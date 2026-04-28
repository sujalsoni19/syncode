const timeline = {};
const eventCounters = {};

const MAX_EVENTS = 50;

const ensureRoomTimeline = (roomId) => {
  if (!timeline[roomId]) {
    timeline[roomId] = [];
    eventCounters[roomId] = 0;
  }
};

// create event with monotonic id
const createEvent = (roomId, type, participant, extra = {}) => {
  eventCounters[roomId] += 1;

  return {
    id: eventCounters[roomId], // monotonic event id
    type,
    user: participant?.name || null,
    socketId: participant?.socketId || null,
    timestamp: Date.now(),
    ...extra,
  };
};

const pushEvent = (roomId, event) => {
  timeline[roomId].push(event);

  if (timeline[roomId].length > MAX_EVENTS) {
    timeline[roomId].shift();
  }
};

// get timeline
export const getTimeline = (roomId) => {
  return timeline[roomId] || [];
};

// room created
export const roomCreated = (roomId, participant) => {
  ensureRoomTimeline(roomId);

  if (timeline[roomId].length !== 0) return;

  const event = createEvent(roomId, "ROOM_CREATED", participant);
  pushEvent(roomId, event);

  return event;
};

// user joined
export const userJoined = (roomId, participant) => {
  ensureRoomTimeline(roomId);

  const event = createEvent(roomId, "USER_JOINED", participant);
  pushEvent(roomId, event);

  return event;
};

// user left
export const userLeft = (roomId, participant) => {
  ensureRoomTimeline(roomId);

  const event = createEvent(roomId, "USER_LEFT", participant);
  pushEvent(roomId, event);

  return event;
};

// user kicked
export const userKicked = (roomId, participant, by) => {
  ensureRoomTimeline(roomId);

  const event = createEvent(roomId, "USER_KICKED", participant, {
    by,
  });

  pushEvent(roomId, event);

  return event;
};

// ownership transferred
export const ownerTransfer = (roomId, participant) => {
  ensureRoomTimeline(roomId);

  const event = createEvent(roomId, "OWNER_TRANSFERRED", participant);
  pushEvent(roomId, event);

  return event;
};

// delete timeline
export const deleteTimeline = (roomId) => {
  delete timeline[roomId];
  delete eventCounters[roomId];
};
