import {
  addParticipant,
  getParticipants,
} from "../../memory/roomParticipants.js";
import { roomCreated, userJoined } from "../../memory/timeline.js";
import generateGuestName from "../../utils/generateGuestName.js";
import generateColor from "../../utils/generateColors.js";
import { disconnectTimers } from "../../memory/roomParticipants.js";

const joinRoom = (socket) => {
  socket.on("join-room", ({ roomId, userId, name }) => {
    const participants = getParticipants(roomId);

    const alreadyJoined = participants.find((p) => p.userId === userId);

    //  RECONNECT CASE (user refreshed)
    if (alreadyJoined) {
      alreadyJoined.socketId = socket.id;

      socket.join(roomId);

      // cancel pending disconnect removal
      if (disconnectTimers[userId]) {
        clearTimeout(disconnectTimers[userId]);
        delete disconnectTimers[userId];
      }

      console.log("user reconnected to room:", socket.id);

      socket.nsp.to(roomId).emit("participants", getParticipants(roomId));
      console.log("participants:", getParticipants(roomId));

      return;
    }

    // 🔹 NEW USER
    socket.join(roomId);
    console.log("user joined the room:", socket.id);

    const participant = {
      socketId: socket.id,
      userId,
      name: name || generateGuestName(),
      color: generateColor(roomId),
    };

    // room creation event
    if (participants.length === 0) {
      roomCreated(roomId, participant);
    }

    // clear any previous disconnect timers
    if (disconnectTimers[userId]) {
      clearTimeout(disconnectTimers[userId]);
      delete disconnectTimers[userId];
    }

    addParticipant(roomId, participant);

    userJoined(roomId, participant);

    // request existing users to sync code with the new user
    socket.to(roomId).emit("request-sync-code", socket.id);

    socket.nsp.to(roomId).emit("participants", getParticipants(roomId));
    console.log("participants:", getParticipants(roomId));
  });
};

export default joinRoom;