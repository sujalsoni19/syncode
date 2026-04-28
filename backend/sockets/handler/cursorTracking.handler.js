import {getParticipant} from "../../memory/roomParticipants.js";

const cursorTracking = (socket, io) => {
  socket.on("cursor-move", ({ roomId, cursor, selection }) => {

    const participant = getParticipant(roomId, socket.id);

    if(!participant) return;
    
    socket.to(roomId).emit("cursor-update", {
      userId: participant.userId,
      color: participant.color,
      cursor,
      selection,
    });
  });
};

export default cursorTracking;