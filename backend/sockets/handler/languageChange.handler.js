import { findParticipantRoom } from "../../memory/roomParticipants.js";

const languageChange = (socket) => {
  socket.on("language-change", ({ language }) => {
    const roomId = findParticipantRoom(socket.id);

    if (!roomId) {
      return;
    }

    socket
      .to(roomId)
      .emit("language-change", { language, socketId: socket.id });
  });
};

export default languageChange;
