exports.init = (io) => {
  io.sockets.on("connection", (socket) => {
    try {
      socket.on("joinRoom", ({ postId }) => {
        socket.join(postId);
      });

      socket.on("message", ({ postId, message, nickname }) => {
        socket.to(postId).emit("message", { message, nickname });
      });
    } catch (e) {
      console.log(e);
    }
  });
};
