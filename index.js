const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: { origin : '*'},
});

server.listen(3000, () => {
    console.log('Running Server!!!');
})

let connections = []

io.on('connect', (socket) => {
    connections.push(socket)
    socket.on('down', (data) => {
        connections.forEach(con => {
            if(con.id !== socket.id){
                con.emit('ondown', (data))
            }
        })
    })
    socket.on('mousemove', (data) => {
        connections.forEach(con => {
            if(con.id !== socket.id){
                con.emit('setMouseMove', {x:data.x, y:data.y})
            }
        })
    })
    socket.on('mousedown', (mouse) => {
        connections.forEach(con => {
            if(con.id !== socket.id){
                con.emit('setMouseDown', {x:mouse.x, y:mouse.y})
            }
        })
    })

    socket.on('changePenColor', (color) => {
        connections.forEach(con => {
            if(con.id !== socket.id){
                con.emit('setPenColor', (color))
            }
        })
    })

    socket.on('changePenSize', (color) => {
        connections.forEach(con => {
            if(con.id !== socket.id){
                con.emit('setPenSize', (color))
            }
        })
    })
    socket.on('changeBackgroundColor', (color) => {
        connections.forEach(con => {
            if(con.id !== socket.id){
                con.emit('setBackgroundColor', (color))
            }
        })
    })
    socket.on('clearBoardListen', () => {
        connections.forEach(con => {
            if(con.id !== socket.id){
                con.emit('clearBoard')
            }
        })
    })
    socket.on('disconnect', () => {
        connections = connections.filter((con) => con.id !== socket.id)
    })
})