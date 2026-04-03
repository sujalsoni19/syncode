import joinRoom from "./handler/joinroom.handler.js";
import codeChange from "./handler/codeChange.handler.js";
import syncCode from "./handler/syncCode.handler.js";
import languageChange from "./handler/languageChange.handler.js";
import {
  findParticipantRoom,
  removeParticipant,
} from "../memory/roomParticipants.js";

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

      removeParticipant(roomId, socket.id);

      socket.to(roomId).emit("user-left", socket.id);

      console.log("User disconnected:", socket.id);
    });
  });
};

export default socketManager;
