const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {getMessage, getLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users.js'); 

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000

// Define paths for express config
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

// Setting up socket
io.on('connection', (socket) => { 
    console.log('New websocket connection');

    socket.on('join', (username, room, callback) => {
        const {error, user} = addUser({id: socket.id, username, room});
        if(error !== undefined)
        {
            return callback(error);
        }
        socket.join(user.room);

        socket.emit('message', getMessage('Admin' , 'Welcome!'));
        socket.broadcast.to(user.room).emit('message', getMessage('Admin', `${user.username.charAt(0).toUpperCase() + user.username.slice(1)} has joined!`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });
        callback();
    })

    socket.on('sendMessage', (text, callback) => {
        const {user} = getUser(socket.id);

        // Check for inappropriate language
        const filter = new Filter();
        if(filter.isProfane(text))
        {
            return callback('Profanity is not allowed');
        } 

        io.to(user.room).emit('message', getMessage(user.username, text));
        callback();
    });

    socket.on('sendLocation', (location, callback) => {

        const {user} = getUser(socket.id);

        io.to(user.room).emit('sendLocationMessage', getLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`));
        callback('Location shared!');
    })

    socket.on('disconnect', () => {
        const {user} = removeUser(socket.id);

        if(user)
        {
            io.to(user.room).emit('message', getMessage('Admin', `${user.username.charAt(0).toUpperCase() + user.username.slice(1)} has left!`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => console.log('Server is up and running on port ' + port));