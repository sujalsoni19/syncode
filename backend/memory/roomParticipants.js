import { ownerTransfer } from "./timeline.js";

const roomParticipants = {};
const disconnectTimers = {};

/*
Structure:

roomParticipants = {
   roomId1: [
      {
         socketId: "abc123",
         userId: "optional",
         name: "Guest-123",
         color: "#FF5733"
      }
   ]
}
*/

export const getParticipants = (roomId) => {
  const list = roomParticipants[roomId] || [];

  return [...list].sort((a, b) => {
    if (a.isOwner) return -1;
    if (b.isOwner) return 1;
    return 0;
  });
};

export const addParticipant = (roomId, user) => {
  if (!roomParticipants[roomId]) {
    roomParticipants[roomId] = [];
  }

  const existing = roomParticipants[roomId].find(
    (p) => p.userId === user.userId,
  );

  if (existing) {
    existing.socketId = user.socketId;

    if (disconnectTimers[user.userId]) {
      clearTimeout(disconnectTimers[user.userId]);
      delete disconnectTimers[user.userId];
    }

    return existing;
  }

  const isOwner = roomParticipants[roomId].length === 0;

  roomParticipants[roomId].push({
    ...user,
    isOwner,
  });
};

export const removeParticipant = (roomId, userId) => {
  if (!roomParticipants[roomId]) return;

  const leaving = roomParticipants[roomId].find((p) => p.userId === userId);

  roomParticipants[roomId] = roomParticipants[roomId].filter(
    (p) => p.userId !== userId,
  );

  let ownerTransferEvent = null;

  if (leaving?.isOwner && roomParticipants[roomId].length > 0) {
    const newOwner = roomParticipants[roomId][0];

    newOwner.isOwner = true;

    ownerTransferEvent = ownerTransfer(roomId, newOwner);
  }

  if (roomParticipants[roomId].length === 0) {
    delete roomParticipants[roomId];
  }

  return ownerTransferEvent;
};

export const findParticipantRoom = (socketId) => {
  for (const roomId in roomParticipants) {
    const exists = roomParticipants[roomId].find(
      (p) => p.socketId === socketId,
    );

    if (exists) {
      return roomId;
    }
  }

  return null;
};

export const getParticipant = (roomId, socketId) => {
  if (!roomParticipants[roomId]) return null;

  return roomParticipants[roomId].find((p) => p.socketId === socketId);
};

export { disconnectTimers };
