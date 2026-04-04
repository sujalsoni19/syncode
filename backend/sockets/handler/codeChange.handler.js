import { findParticipantRoom } from "../../memory/roomParticipants.js";

export const latestCode = {};

const codeChange = (socket) => {
  socket.on("code-change", ({ code }) => {
    const roomId = findParticipantRoom(socket.id);

    if (!roomId) {
      return;
    }
    latestCode[roomId] = code;
    socket.to(roomId).emit("code-change", { code, socketId: socket.id });
  });
};

export default codeChange;
