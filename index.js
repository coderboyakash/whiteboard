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
    console.log(`connected ${socket.id}`)
    connections.push(socket)
    socket.on('draw', (data) => {
        connections.forEach(con => {
            if(con.id !== socket.id){
                con.emit('ondraw', {x: data.x, y: data.y})
            }
        })
    })
    socket.on('down', (data) => {
        connections.forEach(con => {
            if(con.id !== socket.id){
                con.emit('ondown', {x:data.x, y:data.y})
            }
        })
    })
    socket.on('disconnect', () => {
        connections = connections.filter((con) => con.id !== socket.id)
    })
})