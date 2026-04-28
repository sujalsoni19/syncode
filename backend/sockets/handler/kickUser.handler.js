import {
  getParticipants,
  removeParticipant,
} from "../../memory/roomParticipants.js";
import { userKicked } from "../../memory/timeline.js";

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

    const event = userKicked(roomId, target, requestedBy.name);

    console.log(event);
    io.to(roomId).emit("timeline-event", event);
    
    io.to(roomId).emit("participants", getParticipants(roomId));
  });
};

export default kickUser;
