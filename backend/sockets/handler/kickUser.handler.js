import {
  getParticipants,
  removeParticipant,
} from "../../memory/roomParticipants.js";

const kickUser = (socket, io) => {
  socket.on("kick-user", ({ roomId, userId }) => {
    const participants = getParticipants(roomId);

    if (!participants) return;

    const requestedBy = participants.find((p) => p.socketId === socket.id);

    if (!requestedBy?.isOwner) return;

    const target = participants.find((p) => p.userId === userId);

    if (!target) return;

    console.log("kick user on server reached:", roomId, userId);

    io.to(target.socketId).emit("kicked", {
      message: "You were removed from the room",
    });

    io.sockets.sockets.get(target.socketId)?.leave(roomId);

    removeParticipant(roomId, userId);

    io.to(roomId).emit("participants", getParticipants(roomId));
  });
};

export default kickUser;
