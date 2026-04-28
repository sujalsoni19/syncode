const syncCode = (socket, io) => {
  socket.on("sync-code", ({ code,language, socketId }) => {
    io.to(socketId).emit("sync-code", { code, language });
  });
};

export default syncCode;
