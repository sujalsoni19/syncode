import {
  addParticipant,
  getParticipants,
} from "../../memory/roomParticipants.js";
import { roomCreated, userJoined } from "../../memory/timeline.js";
import generateGuestName from "../../utils/generateGuestName.js";
import generateColor from "../../utils/generateColors.js";

const joinRoom = (socket) => {
  socket.on("join-room", ({ roomId, user }) => {
    const participants = getParticipants(roomId);

    const already_joined = participants.find((p) => p.socketId === socket.id);

    if (already_joined) {
      return;
    }

    socket.join(roomId);
    console.log("user joined the room");

    const participant = {
      socketId: socket.id,
      userId: user?._id || null,
      name: user?.username || generateGuestName(),
      color: generateColor(roomId),
    };

    if (participants.length === 0) {
      roomCreated(roomId, participant);
    }

    addParticipant(roomId, participant);

    userJoined(roomId, participant);

    // request existing users to sync code with the new user
    socket.to(roomId).emit("request-sync-code", socket.id);

    socket.emit("participants", getParticipants(roomId));
    console.log("participants: ", getParticipants(roomId));
    socket.to(roomId).emit("user-joined", participant);

    // console.log(roomId, participant);
  });
};

export default joinRoom;
