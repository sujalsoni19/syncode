import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../socket.js";
import { useUsercontext } from "@/context/userContext.jsx";
import CodeEditor from "@/components/CodeEditor";
import EditorNavbar from "@/components/EditorNavbar";
import ParticipantsPanel from "@/components/ParticipantsPanel";
import TimelinePanel from "@/components/TimelinePanel";
import { Separator } from "@/components/ui/separator";
import { timelineEvents } from "@/data/mockData";
import getGuestId from "@/utils/getGuestId.js";
import { toast } from "react-hot-toast";
import DialogueBox from "@/components/DialogueBox.jsx";

function RoomEditor() {
  const { roomId } = useParams();

  // for kicking user
  const [targetUser, setTargetUser] = useState({});

  // dialogue box states
  const [openCloseRoomDialog, setOpenCloseRoomDialog] = useState(false);
  const [openKickUserDialog, setKickUserDialog] = useState(false);

  const [events, setEvents] = useState([]);

  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const debounceRef = useRef(null);
  const codeRef = useRef("");
  const languageRef = useRef("javascript");
  const isRemoteChange = useRef(false);
  const [participants, setParticipants] = useState([]);
  const [isOutputOpen, setIsOutputOpen] = useState(false);
  const [isSynced, setIsSynced] = useState(false);

  const navigate = useNavigate();

  const { user, loading } = useUsercontext();

  const currentUserId = user?._id || getGuestId();

  const isOwner =
    participants?.find((p) => p.userId === currentUserId)?.isOwner ?? false;

  // timeline
  useEffect(() => {
    socket.on("timeline-history", (history) => {
      setEvents(history);
    });

    socket.on("timeline-event", (event) => {
      setEvents((prev) => {
        if (prev.some((e) => e.id === event.id)) return prev;
        return [...prev, event];
      });
    });

    return () => {
      socket.off("timeline-history");
      socket.off("timeline-event");
    };
  }, []);

  useEffect(() => {
    socket.on("participants", (item) => {
      setParticipants(item);
      setIsSynced(true);
    });

    return () => {
      socket.off("participants");
    };
  }, []);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  // connect socket once
  useEffect(() => {
    if (!socket.connected) socket.connect();
    return () => socket.disconnect();
  }, []);

  // listeners
  useEffect(() => {
    socket.on("code-change", ({ code, socketId }) => {
      if (socketId === socket.id) return;

      isRemoteChange.current = true;
      setCode(code);
    });

    socket.on("language-change", ({ language }) => setLanguage(language));

    socket.on("request-sync-code", (socketId) => {
      socket.emit("sync-code", {
        code: codeRef.current,
        language: languageRef.current,
        socketId,
      });
    });

    socket.on("sync-code", ({ code, language }) => {
      setCode(code);
      setLanguage(language);
    });

    socket.on("room-full", () => {
      toast.error("Room is full (max 10 participants)");
      navigate(user ? "/home" : "/");
    });

    socket.on("kicked", ({ message }) => {
      toast.error(message);
      navigate(user ? "/home" : "/");
    });

    return () => {
      socket.off("code-change");
      socket.off("language-change");
      socket.off("request-sync-code");
      socket.off("sync-code");
      socket.off("room-full");
      socket.off("kicked");
    };
  }, []);

  useEffect(() => {
    socket.on("room-closed", ({ message }) => {
      if (isOwner) {
        toast.success("Room closed successfully");
      } else {
        toast.error(message);
      }
      navigate(user ? "/home" : "/");
    });

    return () => socket.off("room-closed");
  }, [isOwner]);

  // join room
  useEffect(() => {
    if (loading) return;

    const guestId = getGuestId();
    const userId = user?._id || guestId;

    socket.emit("join-room", {
      roomId,
      userId,
      name: user?.username,
    });
  }, [roomId, user, loading]);

  const handleCodeChange = (value) => {
    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }
    if (!value) return;

    const valueCode = value;

    // update UI immediately
    setCode(valueCode);

    // clear previous debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // emit change after small delay
    debounceRef.current = setTimeout(() => {
      socket.emit("code-change", {
        roomId,
        code: valueCode,
      });
    }, 200);
  };

  const handleLangChange = (language) => {
    setLanguage(language);

    socket.emit("language-change", {
      roomId,
      language: language,
    });
  };

  const handleKickUser = (userId, name) => {
    setTargetUser({ userId, name });
    setKickUserDialog(true);
  };

  const confirmKickUser = () => {
    if (!targetUser) return;

    socket.emit("kick-user", {
      roomId,
      userId: targetUser.userId,
    });

    setKickUserDialog(false);
    setTargetUser(null);

    toast.success(`${targetUser.name} was removed`);
  };

  const handleLeaveRoom = () => {
    socket.emit("leave-room");
    navigate(user ? "/home" : "/");
    toast.success("You left the room");
  };

  const handleCloseRoom = () => {
    setOpenCloseRoomDialog(true);
  };

  const confirmCloseRoom = () => {
    socket.emit("close-room", { roomId });
    setOpenCloseRoomDialog(false);
  };

  if (!isSynced) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Loading room...
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100">
      <EditorNavbar
        roomId={roomId}
        language={language}
        onLanguageChange={handleLangChange}
        onLeaveRoom={handleLeaveRoom}
        isOwner={isOwner}
        onCloseRoom={handleCloseRoom}
        isOutputOpen={isOutputOpen}
        onToggleOutput={() => setIsOutputOpen((current) => !current)}
      />
      <DialogueBox
        open={openCloseRoomDialog}
        onOpenChange={setOpenCloseRoomDialog}
        onConfirm={confirmCloseRoom}
        title={"Close the room?"}
        desc={"This will remove everyone from the room."}
        action={"Close Room"}
      />

      <DialogueBox
        open={openKickUserDialog}
        onOpenChange={setKickUserDialog}
        onConfirm={confirmKickUser}
        title={`Kick ${targetUser?.name}?`}
        desc="This user will be removed from the room."
        action="Kick User"
      />

      <main className="flex min-h-0 flex-1">
        <aside className="flex w-1/5 min-w-64 flex-col border-r border-zinc-800 bg-zinc-950 p-3">
          <div className="min-h-0 flex-1">
            <ParticipantsPanel
              participants={participants}
              currentUserId={currentUserId}
              isOwner={isOwner}
              onKickUser={handleKickUser}
            />
          </div>

          <Separator className="my-3 bg-zinc-800" />

          <div className="min-h-0 flex-1">
            <TimelinePanel events={events} />
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col bg-zinc-950 p-3">
          <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
            <CodeEditor
              language={language}
              value={code}
              onChange={handleCodeChange}
              socket={socket}
              roomId={roomId}
              participants={participants}
            />
          </div>

          <AnimatePresence initial={false}>
            {isOutputOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 200, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="mt-3 h-47 rounded-lg border border-zinc-800 bg-black p-4 font-mono text-sm text-emerald-300">
                  <p className="text-zinc-500">&gt; Program Output</p>
                  <p className="mt-3 text-zinc-300">Ready to run your code.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

export default RoomEditor;
