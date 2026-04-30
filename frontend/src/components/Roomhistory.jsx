import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Archive, Code2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUsercontext } from "@/context/userContext.jsx";
import { getRoomDetails, deleteRoom } from "@/api/room.api.js";
import { useNavigate } from "react-router-dom";
import DialogueBox from "./DialogueBox.jsx";
import { toast } from "react-hot-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const timeAgo = (timestamp) => {
  const now = new Date();
  const past = new Date(timestamp);

  const seconds = Math.floor((now - past) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const key in intervals) {
    const value = Math.floor(seconds / intervals[key]);

    if (value >= 1) {
      return `${value} ${key}${value > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
};

function Roomhistory() {
  const { user } = useUsercontext();
  const navigate = useNavigate();

  if (!user) return;

  const [activeRooms, setActiveRooms] = useState([]);
  const [closedRooms, setClosedRooms] = useState([]);

  const [deleteRoomDialogue, setdeleteRoomDialogue] = useState(false);
  const [roomForDelete, setRoomForDelete] = useState("");

  const fetchRoomDetails = async () => {
    try {
      const res = await getRoomDetails();

      setActiveRooms(res?.data?.data?.activeRooms || []);
      setClosedRooms(res?.data?.data?.closedRooms || []);
    } catch (error) {
      console.log("error while fetching rooms: ", error);
    }
  };

  useEffect(() => {
    fetchRoomDetails();
  }, []);

  const handleDeleteRoom = (roomId) => {
    setRoomForDelete(roomId);
    setdeleteRoomDialogue(true);
  };

  const confirmDeleteRoom = async () => {
    if (!roomForDelete) return;
    try {
      await deleteRoom(roomForDelete);

      toast.success(`Deleted room-${roomForDelete}`);
      setdeleteRoomDialogue(false);
      setRoomForDelete("");

      fetchRoomDetails();
    } catch (error) {
      toast.error("Failed to delete room");
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-12"
      >
        <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-white">
          <Activity className="h-5 w-5 text-zinc-400" />
          Active Rooms
          <div>
            <Tooltip>
              <TooltipTrigger>
                <Info size={14} />
              </TooltipTrigger>
              <TooltipContent sideOffset={10}>
                <p>
                  Only the 6 most recent active rooms are shown here.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </h2>
        {activeRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className=" text-zinc-400">No active rooms right now.</p>
            <p className="text-xs text-zinc-500">
              Create a new room to start collaborating.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeRooms.map((room) => (
              <Card
                key={room._id}
                className="transition hover:border-emerald-300/30"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Code2 className="h-4 w-4 text-emerald-300" />
                    room-{room.roomId}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">🟢Active</span>

                  <Button
                    onClick={() => navigate(`/room/${room.roomId}`)}
                    size="sm"
                    variant="outline"
                    className="cursor-pointer"
                  >
                    Rejoin
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
      <DialogueBox
        open={deleteRoomDialogue}
        onOpenChange={setdeleteRoomDialogue}
        onConfirm={confirmDeleteRoom}
        title={`Delete room-${roomForDelete}`}
        desc="This room will be removed from the database. This action is irreversible"
        action="Delete Room"
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-12"
      >
        <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-white">
          <Archive className="h-5 w-5 text-zinc-400" />
          Closed Rooms
          <div>
            <Tooltip>
              <TooltipTrigger>
                <Info size={14} />
              </TooltipTrigger>
              <TooltipContent sideOffset={10}>
                <p>
                  Closed rooms are deleted after 7 days. Showing the 6 most
                  recent rooms.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </h2>
        {closedRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className=" text-zinc-400">No closed rooms right now.</p>
            <p className="text-xs text-zinc-500">
              Your past sessions will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {closedRooms.map((room) => (
              <Card
                key={room._id}
                className="transition hover:border-emerald-300/30"
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-center gap-2 text-sm">
                    <div className="flex gap-2">
                      <Code2 className="h-4 w-4 text-emerald-300" />
                      room-{room.roomId}
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteRoom(room.roomId)}
                    >
                      Delete
                    </Button>
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">
                    Closed At: {timeAgo(room.closedAt)}
                  </span>

                  <Button
                    onClick={() => navigate(`/room/${room.roomId}`)}
                    size="sm"
                    variant="outline"
                    className="cursor-pointer"
                  >
                    View
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default Roomhistory;
