import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, DoorOpen, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { joinRoom } from "@/api/room.api.js";
import { toast } from "react-hot-toast";

export function JoinRoomDialog() {
  const [roomCode, setRoomCode] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();

    const code = roomCode.trim().toLowerCase();

    if (!code) {
      setServerError("Enter a room code");
      return;
    }

    if (code.length !== 8) {
      setServerError("Room code must be 8 characters");
      return;
    }

    try {
      setLoading(true);
      setServerError("");

      await joinRoom(code);

      toast.success(`Joined room-${code}`);
      navigate(`/room/${code}`);
    } catch (error) {
      setServerError(error.response?.data?.message || "Unable to join room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);

        if (!val) {
          setRoomCode("");
          setServerError("");
        }
      }}
    >
      <DialogTrigger asChild>
        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            <DoorOpen className="h-4 w-4" />
            Join Room
          </Button>
        </motion.div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleJoin}>
          <DialogHeader>
            <DialogTitle>Join a Room</DialogTitle>
            <DialogDescription>
              Enter the 8-digit room code shared with you.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <Label htmlFor="roomCode">Room Code</Label>

            <Input
              autoFocus
              id="roomCode"
              placeholder="e.g. 3fa9c1b2"
              value={roomCode}
              onChange={(e) => {
                setRoomCode(e.target.value.toLowerCase());
                setServerError("");
              }}
            />
          </div>

          {serverError && <p className="text-sm text-red-400">{serverError}</p>}

          <DialogFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  Join Room
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
