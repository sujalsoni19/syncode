const timeline = {};

/*
timeline = {
  roomId1: [
    {
      type: "ROOM_CREATED",
      user: "Sujal",
      socketId: "abc123",
      timestamp: 171000000
    },
    {
      type: "USER_JOINED",
      user: "Guest-123",
      socketId: "xyz456",
      timestamp: 171000020
    }
  ]
}
*/

// ensure timeline array exists
const ensureRoomTimeline = (roomId) => {
  if (!timeline[roomId]) {
    timeline[roomId] = [];
  }
};

// get timeline for a room
export const getTimeline = (roomId) => {
  return timeline[roomId] || [];
};

// event when room is created
export const roomCreated = (roomId, participant) => {
  ensureRoomTimeline(roomId);

  // prevent duplicate creation event
  if (timeline[roomId].length !== 0) {
    return;
  }

  timeline[roomId].push({
    type: "ROOM_CREATED",
    user: participant.name,
    socketId: participant.socketId,
    timestamp: Date.now(),
  });
};

// event when user joins
export const userJoined = (roomId, participant) => {
  ensureRoomTimeline(roomId);

  timeline[roomId].push({
    type: "USER_JOINED",
    user: participant.name,
    socketId: participant.socketId,
    timestamp: Date.now(),
  });
};

// event when user leaves
export const userLeft = (roomId, participant) => {
  ensureRoomTimeline(roomId);

  timeline[roomId].push({
    type: "USER_LEFT",
    user: participant.name,
    socketId: participant.socketId,
    timestamp: Date.now(),
  });
};

// clear timeline when room becomes empty (optional)
export const deleteTimeline = (roomId) => {
  delete timeline[roomId];
};
