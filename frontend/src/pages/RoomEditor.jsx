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
import getGuestId from "@/utils/getGuestId.js";
import { toast } from "react-hot-toast";
import DialogueBox from "@/components/DialogueBox.jsx";
import { runCode } from "@/api/room.api.js";

function RoomEditor() {
  const { roomId } = useParams();

  // for kicking user
  const [targetUser, setTargetUser] = useState({});

  // code execution history
  const [executions, setExecutions] = useState([]);
  const [stdin, setStdin] = useState("");
  const [isRunning, setIsRunning] = useState(false);

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

  // auto scroll terminal to bottom on new output
  const terminalRef = useRef(null);

  useEffect(() => {
    terminalRef.current?.scrollTo({
      top: terminalRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [executions]);

  const currentUserId = user?._id || getGuestId();

  const currentUser = participants?.find((p) => p.userId === currentUserId);

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

  // code output
  useEffect(() => {
    socket.on("code-output", ({ output, executedBy, stdin }) => {
      const execution = {
        id: Date.now(),
        output,
        executedBy,
        stdin,
        timestamp: Date.now(),
      };

      setExecutions((prev) => [...prev.slice(-4), execution]);
      setIsOutputOpen(true);
      setIsRunning(false);
    });

    return () => socket.off("code-output");
  }, []);

  const handleCodeChange = (value) => {
    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }
    if (value === undefined) return;

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

  const handleRunCode = async () => {
    if (isRunning) return;
    try {
      setIsRunning(true);
      await runCode(roomId, {
        language: languageRef.current,
        code: codeRef.current,
        stdin,
        executedBy: currentUser?.name,
      });
      setIsOutputOpen(true);
    } catch (error) {
      console.log("Error running code: ", error);
      toast.error(error?.response?.data || "Failed to run code");
      setIsRunning(false);
    }
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
        onCodeRun={handleRunCode}
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
                animate={{ height: "40vh", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="mt-3 flex h-[40vh] flex-col rounded-lg border border-zinc-800 bg-black font-mono text-sm text-emerald-300">
                  {" "}
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2 text-zinc-500">
                    <span>&gt; Program Output</span>

                    <button
                      onClick={() => setExecutions([])}
                      className="text-xs text-zinc-400 hover:text-red-400 transition"
                    >
                      Clear
                    </button>
                  </div>
                  {/* Output history */}
                  <div
                    ref={terminalRef}
                    className="flex-1 overflow-y-auto px-4 py-3 space-y-4"
                  >
                    {executions.map((exec) => (
                      <div key={exec.id}>
                        {/* Execution header */}
                        <p className="text-xs text-zinc-500">
                          {new Date(exec.timestamp).toLocaleTimeString()} ⚡{" "}
                          {exec.executedBy}
                        </p>

                        {/* stdin preview */}
                        {exec.stdin && (
                          <>
                            <p className="text-[11px] text-zinc-500 mt-1">
                              Input:
                            </p>
                            <pre className="whitespace-pre-wrap text-yellow-300">
                              {exec.stdin}
                            </pre>
                          </>
                        )}

                        {/* output */}
                        <p className="text-[11px] text-zinc-500 mt-1">
                          Output:
                        </p>
                        <pre className="whitespace-pre-wrap text-zinc-300">
                          {exec.output}
                        </pre>
                      </div>
                    ))}

                    {isRunning && (
                      <p className="text-yellow-400">▶ Running...</p>
                    )}

                    {executions.length === 0 && !isRunning && (
                      <p className="text-zinc-500">Ready to run your code.</p>
                    )}
                  </div>
                  {/* stdin input */}
                  <div className="border-t border-zinc-800 p-2">
                    <textarea
                      value={stdin}
                      onChange={(e) => setStdin(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleRunCode();
                        }
                      }}
                      placeholder="Program input (stdin)"
                      className="w-full bg-zinc-900 text-zinc-300 text-xs px-2 py-1 rounded outline-none resize-none"
                      rows={2}
                    />
                  </div>
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
