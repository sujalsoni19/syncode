import {
  addParticipant,
  getParticipants,
  disconnectTimers,
} from "../../memory/roomParticipants.js";

import { roomCreated, userJoined, getTimeline } from "../../memory/timeline.js";

import generateGuestName from "../../utils/generateGuestName.js";
import generateColor from "../../utils/generateColors.js";

const joinRoom = (socket, io) => {
  socket.on("join-room", ({ roomId, userId, name }) => {
    const participants = getParticipants(roomId);

    const alreadyJoined = participants.find((p) => p.userId === userId);

    if (!alreadyJoined && participants.length >= 10) {
      socket.emit("room-full");
      return;
    }

    // RECONNECT CASE
    if (alreadyJoined) {
      alreadyJoined.socketId = socket.id;

      socket.join(roomId);

      if (disconnectTimers[userId]) {
        clearTimeout(disconnectTimers[userId]);
        delete disconnectTimers[userId];
      }

      console.log("user reconnected:", socket.id);

      socket.emit("timeline-history", getTimeline(roomId));
      socket.nsp.to(roomId).emit("participants", getParticipants(roomId));
      console.log(getParticipants(roomId));

      return;
    }

    // NEW USER
    socket.join(roomId);

    const participant = {
      socketId: socket.id,
      userId,
      name: name || generateGuestName(),
      color: generateColor(roomId),
    };

    const isFirstUser = participants.length === 0;

    addParticipant(roomId, participant);

    let event;

    // ROOM CREATION
    if (isFirstUser) {
      event = roomCreated(roomId, participant);
    } else {
      event = userJoined(roomId, participant);
    }

    if (event) {
      io.to(roomId).emit("timeline-event", event);
      console.log(event);
    }

    // send timeline history to the new user
    socket.emit("timeline-history", getTimeline(roomId));

    // request existing users to sync code
    socket.to(roomId).emit("request-sync-code", socket.id);

    socket.nsp.to(roomId).emit("participants", getParticipants(roomId));
    console.log(getParticipants(roomId));
  });
};

export default joinRoom;
