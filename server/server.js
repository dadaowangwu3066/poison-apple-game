const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));

let poisonedApple = null;
let players = [];

io.on('connection', (socket) => {
    if (players.length < 2) {
        players.push(socket);
        socket.emit('playerNumber', players.length);
    }

    socket.on('setPoison', (index) => {
        if (!poisonedApple) {
            poisonedApple = index;
            io.emit('poisonSet', index);
        }
    });

    socket.on('eatApple', (index) => {
        const isPoisoned = index === poisonedApple;
        io.emit('result', { index, isPoisoned });
        if (isPoisoned) {
            poisonedApple = null;
        }
    });

    socket.on('disconnect', () => {
        players = players.filter(s => s !== socket);
        poisonedApple = null;
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
