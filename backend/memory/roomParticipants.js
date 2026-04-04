const roomParticipants = {};

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
  return roomParticipants[roomId] || [];
};

export const addParticipant = (roomId, user) => {
  if (!roomParticipants[roomId]) {
    roomParticipants[roomId] = [];
  }
  roomParticipants[roomId].push(user);
};

export const removeParticipant = (roomId, socketId) => {
  if (!roomParticipants[roomId]) return;

  roomParticipants[roomId] = roomParticipants[roomId].filter(
    (s) => s.socketId !== socketId,
  );

  if (roomParticipants[roomId].length === 0) {
    delete roomParticipants[roomId];
  }
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

  return roomParticipants[roomId].find(
    (p) => p.socketId === socketId
  );
};
