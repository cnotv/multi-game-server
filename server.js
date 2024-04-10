const { Server } = require("socket.io");

const io = new Server({ /* options */ });

io.on("connection", (socket) => {
  const count = io.engine.clientsCount;
  const uuid = require("uuid");

  io.engine.generateId = (req) => {
    return uuid.v4(); // must be unique across all Socket.IO servers
  }

  console.log(`New connection: ${socket.id} - Total clients: ${count}`);

  io.engine.on("connection_error", (err) => {
    console.log(err);
  });
});

  
io.listen(3000);