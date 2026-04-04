import joinRoom from "./handler/joinroom.handler.js";
import codeChange from "./handler/codeChange.handler.js";
import syncCode from "./handler/syncCode.handler.js";
import languageChange from "./handler/languageChange.handler.js";
import {
  findParticipantRoom,
  removeParticipant,
  getParticipant,
  getParticipants,
} from "../memory/roomParticipants.js";
import { userLeft, deleteTimeline } from "../memory/timeline.js";

const socketManager = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    joinRoom(socket);
    syncCode(socket, io);
    codeChange(socket);
    languageChange(socket);

    socket.on("disconnect", () => {
      const roomId = findParticipantRoom(socket.id);

      if (!roomId) return;

      const participant = getParticipant(roomId, socket.id);

      if (participant) {
        userLeft(roomId, participant);
      }

      // remove participant first
      removeParticipant(roomId, socket.id);

      const remainingParticipants = getParticipants(roomId);

      // check if room is empty
      if (remainingParticipants.length === 0) {
        deleteTimeline(roomId);
      }

      socket.to(roomId).emit("user-left", participant);

      console.log("User disconnected:", socket.id);
    });
  });
};

export default socketManager;
