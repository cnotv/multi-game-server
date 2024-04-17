const { Server } = require('socket.io');
const express = require('express');
const { createServer } = require('http');
const cors = require('cors');
const uuid = require('uuid');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
  // res.send('<h1>Worker up</h1>');
});

const httpServer = createServer(app);
const io = new Server(httpServer, { 
  cors: {
    origin: '*',
    // origin: ['https://cnotv-multi-game.netlify.app/', 'http://localhost:4000/'],
    // methods: ['GET', 'POST'],
  },
});
 
let users = [];
const messages = [];

io.on('connection', (socket) => {
  const count = io.engine.clientsCount;

  io.engine.generateId = (req) => {
    return uuid.v4(); // must be unique across all Socket.IO servers
  }

  console.log(`New connection: ${socket.id} - Total clients: ${count} - Total users: ${users.length}`);

  // USERS
  socket.on('user:create', (user, callback) => {
    console.log('user:create', user);
    user = {
      ...user,
      id: socket.id
    }
    users.push(user);
    io.emit('user:list', users);
    callback(user);
  });
  
  // Filter user by ID
  socket.on('user:change', (user) => {
    console.log('user:change', user);
    users = [
      ...users
        .filter(u => !!u.id)
        .filter(u => u.id !== user.id),
      user
    ];
    io.emit('user:list', users);
  });

  // MESSAGES
  socket.on('message:create', (message) => {
    console.log('message:create', message);
    messages.push(message);
    io.emit('message:created', message);
  });

  // ERROR HANDLING
  io.engine.on('connection_error', (err) => {
    console.log(err.message);
  });

  // DISCONNECTION
  // Remove user on disconnection using token
  socket.on("disconnect", (reason) => {
    console.log(`disconnect ${socket.id} due to ${reason}`);
    users = users.filter(user => user.id !== socket.id);
    io.emit('user:list', users);
  });
});


httpServer.listen(3000, '0.0.0.0', () => {
  console.log('Server ready at port 3000');
});