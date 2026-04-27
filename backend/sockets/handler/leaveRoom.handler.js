import {
  getParticipants,
  removeParticipant,
  findParticipantRoom,
} from "../../memory/roomParticipants.js";

const leaveRoom = (socket, io) => {
  socket.on("leave-room", () => {
    const roomId = findParticipantRoom(socket.id);

    if (!roomId) return;

    const participants = getParticipants(roomId);

    if (!participants) return;

    const participant = participants.find((p) => p.socketId === socket.id);

    if (!participant) return;

    socket.leave(roomId);

    removeParticipant(roomId, participant.userId);

    io.to(roomId).emit("participants", getParticipants(roomId));
  });
};

export default leaveRoom;
