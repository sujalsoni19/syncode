import {
  getParticipants,
  removeParticipant,
} from "../../memory/roomParticipants.js";
import { latestLanguage } from "./languageChange.handler.js";
import { latestCode } from "./codeChange.handler.js";
import { Room } from "../../models/room.model.js";
import { deleteTimeline } from "../../memory/timeline.js";

const closeRoom = (socket, io) => {
  socket.on("close-room", async ({ roomId }) => {
    const participants = getParticipants(roomId);

    if (!participants) return;

    const requestedBy = participants.find((p) => p.socketId === socket.id);

    if (!requestedBy?.isOwner) return;

    io.to(roomId).emit("room-closed", {
      message: "The host closed the room",
    });

    const code = latestCode[roomId] ?? " ";
    const language = latestLanguage[roomId] ?? "javascript";

    try {
      await Room.findOneAndUpdate({ roomId }, { code, language });
    } catch (err) {
      console.error("Failed to persist room state:", err);
    }

    particpants.forEach((p) => {
      removeParticipant(roomId, p.userId);

      io.sockets.sockets.get(p.socketId)?.leave(roomId);
    });

    delete latestCode[roomId];
    delete latestLanguage[roomId];
    deleteTimeline(roomId);
  });
};

export default closeRoom;
