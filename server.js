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
    // origin: '*',
    origin: ['https://cnotv-multi-game.netlify.app/', 'http://localhost:4000/'],
    methods: ['GET', 'POST'],
  },
});
 
let users = [];
const messages = [];

io.on('connection', (socket) => {
  const count = io.engine.clientsCount;

  io.engine.generateId = (req) => {
    return uuid.v4(); // must be unique across all Socket.IO servers
  }

  console.log(`New connection: ${socket.id} - Total clients: ${count}`);


  socket.on('user:create', (user) => {
    console.log('user:create', user);
    users.push(user);
    io.emit('user:created', users);
  });
  
  socket.on('user:change', (user) => {
    console.log('user:change', user);
    users = [
      ...users.filter(u => u.id !== user.id),
      user
    ];
    io.emit('user:created', users);
  });

  socket.on('user:created', (user) => {
    console.log('user:created', user);
  });

  socket.on('message:create', (message) => {
    console.log('message:create', message);
    messages.push(message);
    io.emit('message:created', message);
  });

  socket.on('message:created', (message) => {
    console.log('message:created', message);
  });


  io.engine.on('connection_error', (err) => {
    console.log(err.message);
  });
});

httpServer.listen(3000, '0.0.0.0', () => {
  console.log('Server ready at port 3000');
});