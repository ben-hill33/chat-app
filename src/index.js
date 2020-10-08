'use strict';

const path = require('path');
const http = require('http');
const express = require('express');
const chalk = require('chalk');
const socketio = require('socket.io');
const Filter = require('bad-words');


const app = express();
// socket io expects to be called through raw server, this gives me support to use web sockets
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, `../public`);

app.use(express.static(publicDirectoryPath))

// server (emit) -> client (receive) --acknowledgement--> server
// client (emit) -> server (receive) --acknowledgement--> client
// socket.emit - refers to a single client
// io.emit - refers to every client
// socket.broadcast.emit - targets event to other clients except it's own socket

// socket param is an object that contians data about new connection. we can use methods on socket to communicate with client

io.on('connection', (socket) => {
  console.log(chalk.inverse.blue('New WebSocket connection'))

  socket.emit('message', 'Welcome!')
  socket.broadcast.emit('message', 'A new user has joined!')

  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter()

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!')
    }

    io.emit('message', message)
    callback()
  })

  socket.on('sendLocation', (coords, callback) => {
    io.emit('message', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
    callback();
  })

  socket.on('disconnect', () => {
    io.emit('message', 'A user has left!')
  })
})

server.listen(port, () => {
  console.log(chalk.inverse.yellowBright(`Server is up on ${port}!`))
})

