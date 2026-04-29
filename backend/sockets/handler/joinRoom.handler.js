import {
  addParticipant,
  getParticipants,
  disconnectTimers,
} from "../../memory/roomParticipants.js";

import { roomCreated, userJoined, getTimeline } from "../../memory/timeline.js";

import generateGuestName from "../../utils/generateGuestName.js";
import generateColor from "../../utils/generateColors.js";

import { latestCode } from "./codeChange.handler.js";
import { latestLanguage } from "./languageChange.handler.js";

const joinRoom = (socket, io) => {
  socket.on("join-room", ({ roomId, userId, name }) => {

    const participants = getParticipants(roomId);
    const alreadyJoined = participants.find((p) => p.userId === userId);

    // ROOM FULL CHECK
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

      // send timeline history
      socket.emit("timeline-history", getTimeline(roomId));

      const roomParticipants = getParticipants(roomId);

      // if other users exist → ask them to sync
      if (roomParticipants.length > 1) {
        socket.to(roomId).emit("request-sync-code", socket.id);
      } 
      // fallback → send server stored code
      else if (latestCode[roomId]) {
        socket.emit("sync-code", { code: latestCode[roomId], language: latestLanguage[roomId] || "javascript" });
      }

      socket.nsp.to(roomId).emit("participants", roomParticipants);

      console.log(roomParticipants);

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

    const updatedParticipants = getParticipants(roomId);

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

    // CODE SYNC LOGIC
    if (updatedParticipants.length > 1) {
      // ask existing users to sync code
      socket.to(roomId).emit("request-sync-code", socket.id);
    } else {
      // only user in room → send stored code
      if (latestCode[roomId]) {
        socket.emit("sync-code", { code: latestCode[roomId], language: latestLanguage[roomId] || "javascript" });
      }
    }

    socket.nsp.to(roomId).emit("participants", updatedParticipants);

    console.log(updatedParticipants);
  });
};

export default joinRoom;