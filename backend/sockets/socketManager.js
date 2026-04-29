import joinRoom from "./handler/joinroom.handler.js";
import codeChange, { latestCode } from "./handler/codeChange.handler.js";
import syncCode from "./handler/syncCode.handler.js";
import languageChange, {
  latestLanguage,
} from "./handler/languageChange.handler.js";
import kickUser from "./handler/kickUser.handler.js";
import leaveRoom from "./handler/leaveRoom.handler.js";
import closeRoom from "./handler/closeRoom.handler.js";
import cursorTracking from "./handler/cursorTracking.handler.js";
import {
  findParticipantRoom,
  removeParticipant,
  getParticipant,
  getParticipants,
} from "../memory/roomParticipants.js";
import { userLeft, deleteTimeline } from "../memory/timeline.js";
import { Room } from "../models/room.model.js";
import { disconnectTimers } from "../memory/roomParticipants.js";
import { setIO } from "./io.js";

const socketManager = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    setIO(io);

    joinRoom(socket, io);
    syncCode(socket, io);
    codeChange(socket);
    languageChange(socket);
    cursorTracking(socket, io);

    kickUser(socket, io);
    leaveRoom(socket, io);
    closeRoom(socket, io);

    socket.on("disconnect", () => {
      const roomId = findParticipantRoom(socket.id);
      if (!roomId) return;

      const participant = getParticipant(roomId, socket.id);
      if (!participant) return;

      const { userId } = participant;

      disconnectTimers[userId] = setTimeout(async () => {
        const participants = getParticipants(roomId);

        const stillExists = participants.find((p) => p.userId === userId);

        // user already reconnected with a new socket → cancel removal
        if (!stillExists || stillExists.socketId !== socket.id) {
          delete disconnectTimers[userId];
          return;
        }

        socket.leave(roomId);

        // USER LEFT EVENT
        const leaveEvent = userLeft(roomId, participant);
        io.to(roomId).emit("timeline-event", leaveEvent);

        // REMOVE PARTICIPANT + OWNER TRANSFER
        const ownerTransferEvent = removeParticipant(
          roomId,
          participant.userId,
        );

        if (ownerTransferEvent) {
          io.to(roomId).emit("timeline-event", ownerTransferEvent);
        }

        const updatedParticipants = getParticipants(roomId);
        io.to(roomId).emit("participants", updatedParticipants);
        console.log("participants: ", updatedParticipants);

        if (updatedParticipants.length === 0) {
          const code = latestCode[roomId] ?? " ";
          const language = latestLanguage[roomId] ?? "javascript";

          try {
            await Room.findOneAndUpdate(
              { roomId },
              { code, language, isActive: false, closedAt: new Date() },
            );
          } catch (err) {
            console.error("Failed to persist room state:", err);
          }

          delete latestCode[roomId];
          delete latestLanguage[roomId];
          deleteTimeline(roomId);
        }

        delete disconnectTimers[userId];

        console.log("User fully disconnected:", socket.id);
        console.log("participants: ", updatedParticipants);
      }, 3000);
    });
  });
};

export default socketManager;
