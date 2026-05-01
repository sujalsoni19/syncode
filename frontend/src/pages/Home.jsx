import { motion } from "framer-motion";
import { Plus, DoorOpen, Sparkles } from "lucide-react";

import { useUsercontext } from "@/context/userContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { createRoom, joinRoom } from "@/api/room.api.js";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Roomhistory from "@/components/Roomhistory.jsx";

export default function Home() {
  const { user } = useUsercontext();
  const navigate = useNavigate();
  const [enteredRoomId, setenteredRoomId] = useState("");
  const [serverError, setserverError] = useState("");

  const ROOM_CODE_REGEX = /^[a-zA-Z0-9]{8}$/;
  const isRoomIdValid = ROOM_CODE_REGEX.test(enteredRoomId.trim());

  const createRoomHandler = async () => {
    try {
      const res = await createRoom();
      const roomId = res?.data?.data?.roomId;
      navigate(`/room/${roomId}`);
    } catch (error) {
      console.log("error while creating room: ", error);
    }
  };

  const joinRoomHandler = async () => {
    if (!enteredRoomId) return;
    const roomId = enteredRoomId.trim();

    if (!ROOM_CODE_REGEX.test(roomId)) {
      setserverError("Room code must be 8 alphanumeric characters");
      return;
    }
    try {
      setserverError("");
      await joinRoom(roomId);
      navigate(`/room/${roomId}`);
      toast.success(`Room-${roomId} joined successfully`);
    } catch (error) {
      console.log("error in joining room: ", error);
      setserverError(error.response?.data?.message || "something went wrong");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 overflow-hidden rounded-3xl p-7 sm:p-8"
      >
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full  px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-emerald-200">
            <Sparkles className="h-3.5 w-3.5" />
            Workspace Lobby
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
            Welcome, {user?.username || "User"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Create a room or join one with a 8-digit code shared by the host.
          </p>
        </div>
      </motion.div>

      {/* Main Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Create Room */}
        <motion.div whileHover={{ y: -4 }}>
          <Card className="h-full border-emerald-400/15 bg-linear-to-b from-emerald-500/10 to-transparent transition hover:border-emerald-300/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-400" />
                Create a new room
              </CardTitle>
            </CardHeader>

            <CardContent className="flex h-full flex-col gap-4">
              <p className="text-sm text-zinc-400">
                Start a new room and share the code with your team.
              </p>

              <div className="rounded-2xl border border-white/8 p-4 text-sm text-zinc-300">
                Instant setup for a new live session.
              </div>

              <Button
                onClick={createRoomHandler}
                size="lg"
                className="mt-auto bg-emerald-500 text-black hover:bg-emerald-400"
              >
                Create Room
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Join Room */}
        <motion.div whileHover={{ y: -4 }}>
          <Card className="h-full border-cyan-400/15 bg-linear-to-b from-cyan-500/10 to-transparent transition hover:border-emerald-300/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DoorOpen className="h-5 w-5 text-cyan-400" />
                Join a room
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-zinc-400">
                Ask the host to share the 8-digit code, then enter it below.
              </p>

              <div className="rounded-2xl border border-cyan-400/15 bg-black/20 p-4">
                <p className="text-sm font-medium text-white">
                  Enter your 8-digit room code
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  Only alphanumeric codes are accepted. If you do not have one
                  yet, ask the host to share it with you.
                </p>
                <Input
                  placeholder="e.g. 3fa9c1b2"
                  inputMode="text"
                  maxLength={8}
                  onChange={(e) => {
                    setenteredRoomId(e.target.value);
                    setserverError("");
                  }}
                  className="mt-4 border-white/10 bg-zinc-800 focus:border-cyan-400"
                />
              </div>
              {serverError && (
                <p className="text-sm text-center text-red-400">
                  {serverError}
                </p>
              )}
              <Button
                onClick={joinRoomHandler}
                disabled={!isRoomIdValid}
                size="lg"
                className={`transition-all ${
                  isRoomIdValid
                    ? "bg-cyan-500 text-black hover:bg-cyan-400 cursor-pointer"
                    : "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                }`}
              >
                Join Room
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Roomhistory />
      
    </div>
  );
}
