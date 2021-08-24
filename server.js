// const path = require('path')
import path from 'path'
import { fileURLToPath} from 'url'
// const http = require('http')
import { createServer} from 'http'
// const express = require("express")
import express from 'express'
// const socketio = require('socket.io')

import { Server}  from 'socket.io';
import formatMessage from './utils/messages.js'
import { userJoin, getCurrentUser, userLeave, getRoomUsers } from './utils/users.js'
const app = express();
const httpServer = createServer(app)
// const server = http.createServer(app)
const io = new Server(httpServer, {})
const gameState = {}

//set static folder
const __dirname = path.dirname(fileURLToPath(import.meta.url))
app.use(express.static(path.join(__dirname, 'public')))

const botName = 'ChatCord Bot'
//run when client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({username, room}) => {
        ////////////////////
        if(!gameState.hasOwnProperty(room)) {
            gameState[room] = {
            [username]: {
                points: 0
            }
        }}
        else {
            gameState[room][username] = {
                points: 0
            }
        }
        ////////////////////
        const user = userJoin(socket.id, username, room)
        socket.join(user.room);

    //Welcome current user
        socket.emit('message', formatMessage(botName, 'Welcome to ChatCord'))

    //Broadcast when a user connects emmit to specif room
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`))


        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })

    //Listen for chatMessage
    socket.on('chatMessage', (msg) => {
       
        const user = getCurrentUser(socket.id)
        ////////////////////
        if(msg === '++') gameState[user.room][user.username].points++
        if(msg === 'end') delete gameState[user.room]
        if(msg === 'roll') {
            io.to(user.room).emit('roll', roll())
        }
        ////////////////////
        io.to(user.room).emit('message', formatMessage(user.username, msg))
        console.log('gameState----', gameState);
    })
    
  
    //Runs when a client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)   

        if(user) { 
         io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`))
         io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })

        }
    })
})

const PORT = 3000 || process.env.PORT
httpServer.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
})

    //socket.emit => to client that causes event (single client that connected)
    //socket.broadcast.emit => to all clients except client that causes event
    //io.emit => to all clients


const randomNum = () => {
    return Math.ceil(Math.random() * 6)
}

const roll = () => {
    const data = [];
    const length = 6; 
    
    for(let i = 0; i < length; i++) {
        data.push(randomNum());
    }
    return data
}