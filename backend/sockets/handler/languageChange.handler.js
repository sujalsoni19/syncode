import { findParticipantRoom } from "../../memory/roomParticipants.js";

export const latestLanguage = {};

const languageChange = (socket) => {
  socket.on("language-change", ({ language }) => {
    const roomId = findParticipantRoom(socket.id);

    if (!roomId) {
      return;
    }
    latestLanguage[roomId] = language;
    socket
      .to(roomId)
      .emit("language-change", { language, socketId: socket.id });
  });
};

export default languageChange;
