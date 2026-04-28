import {
  getParticipants,
  removeParticipant,
  findParticipantRoom,
} from "../../memory/roomParticipants.js";
import { latestCode } from "./codeChange.handler.js";
import { latestLanguage } from "./languageChange.handler.js";
import { deleteTimeline } from "../../memory/timeline.js";
import { Room } from "../../models/room.model.js";
import { userLeft } from "../../memory/timeline.js";

const leaveRoom = (socket, io) => {
  socket.on("leave-room", async () => {
    const roomId = findParticipantRoom(socket.id);
    if (!roomId) return;

    const participants = getParticipants(roomId);

    const participant = participants.find((p) => p.socketId === socket.id);
    if (!participant) return;

    socket.leave(roomId);

    // USER LEFT EVENT
    const leaveEvent = userLeft(roomId, participant);
    io.to(roomId).emit("timeline-event", leaveEvent);

    // REMOVE PARTICIPANT + OWNER TRANSFER
    const ownerTransferEvent = removeParticipant(roomId, participant.userId);

    if (ownerTransferEvent) {
      io.to(roomId).emit("timeline-event", ownerTransferEvent);
    }

    const updatedParticipants = getParticipants(roomId);
    io.to(roomId).emit("participants", updatedParticipants);

    if (updatedParticipants.length === 0) {
      const code = latestCode[roomId] ?? " ";
      const language = latestLanguage[roomId] ?? "javascript";

      await Room.findOneAndUpdate(
        { roomId },
        { code, language, isActive: false, closedAt: new Date() },
      );

      delete latestCode[roomId];
      delete latestLanguage[roomId];
      deleteTimeline(roomId);
    }
  });
};

export default leaveRoom;
