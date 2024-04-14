const { Server } = require('socket.io');
const express = require('express');
const { createServer } = require('http');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
  // res.send('<h1>Worker up</h1>');
});

const httpServer = createServer(app);
const io = new Server(httpServer, { 
  cors: {
    origin: ['https://cnotv-multi-game.netlify.app/', 'http://localhost:4000/'],
    methods: ['GET', 'POST'],
  },
 });

io.on('connection', (socket) => {
  const count = io.engine.clientsCount;
  const uuid = require('uuid');

  io.engine.generateId = (req) => {
    return uuid.v4(); // must be unique across all Socket.IO servers
  }

  console.log(`New connection: ${socket.id} - Total clients: ${count}`);

  io.engine.on('connection_error', (err) => {
    console.log(err);
  });
});

httpServer.listen(3000, '0.0.0.0', () => {
  console.log('Server ready at port 3000');
});