exports.init = (io) => {
  io.sockets.on("connection", (socket) => {
    try {
      /**
       * joins a room
       */
      socket.on("joinRoom", ({ postId }) => {
        socket.join(postId);
      });

      /**
       * send chat messages
       */
      socket.on("message", ({ postId, message, nickname }) => {
        socket.to(postId).emit("message", { message, nickname });
      });
    } catch (e) {
      console.log(e);
    }
  });
};
