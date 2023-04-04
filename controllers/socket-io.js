exports.init = (io) => {
  io.sockets.on("connection", (socket) => {
    console.log("try");
    try {
      /**
       * create or joins a room
       */
      socket.on("create or join", (room, userId) => {
        socket.join(room);
        io.sockets.to(room).emit("joined", room, userId);
      });

      socket.on("chat", (room, userId, chatText) => {
        io.sockets.to(room).emit("chat", room, userId, chatText);
      });

      socket.on("disconnect", () => {
        console.log("someone disconnected");
      });
    } catch (e) {}
  });
};
