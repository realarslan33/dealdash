const { Server } = require("socket.io");

module.exports = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  let users = [];

  const addUser = (userId, socketId) => {
    if (users.some((user) => user.socketId === socketId)) return;
    users.push({ userId: String(userId), socketId });
  };

  const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
  };

  const getUsers = (userId) => {
    return users.filter((user) => user.userId === String(userId));
  };

  io.on("connection", (socket) => {
    socket.on("addUser", (userId) => {
      addUser(userId, socket.id);
      io.emit("getUsers", users);
    });

    const messages = {};

    socket.on(
      "sendMessage",
      ({ senderId, receiverId, conversationId, message, text, images }) => {
        const recipientSockets = getUsers(receiverId);
        const savedMessage = message || {
          sender: senderId,
          text,
          images,
          conversationId,
        };
        const incomingMessage = {
          ...savedMessage,
          senderId,
          receiverId,
          conversationId: savedMessage?.conversationId || conversationId,
        };

        if (!messages[receiverId]) {
          messages[receiverId] = [incomingMessage];
        } else {
          messages[receiverId].push(incomingMessage);
        }

        recipientSockets.forEach(({ socketId: recipientSocketId }) => {
          io.to(recipientSocketId).emit("getMessage", incomingMessage);
        });
      }
    );

    socket.on("messageSeen", ({ senderId, receiverId, messageId }) => {
      const senderSockets = getUsers(senderId);

      if (messages[senderId]) {
        const message = messages[senderId].find(
          (message) =>
            message.receiverId === receiverId && message.id === messageId
        );
        if (message) {
          message.seen = true;
          senderSockets.forEach(({ socketId: senderSocketId }) => {
            io.to(senderSocketId).emit("messageSeen", {
              senderId,
              receiverId,
              messageId,
            });
          });
        }
      }
    });

    socket.on("updateLastMessage", ({ lastMessage, lastMessagesId }) => {
      io.emit("getLastMessage", {
        lastMessage,
        lastMessagesId,
      });
    });

    socket.on("disconnect", () => {
      removeUser(socket.id);
      io.emit("getUsers", users);
    });
  });

  return io;
};
