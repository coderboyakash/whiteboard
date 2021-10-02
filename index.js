const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: { origin : '*'},
});

let connections = []
let users = [];
const addUser = (socket_id, publisher_id, subscriber_id) => {
    if(socket_id != null){
        users.some(user => user.publisher_id === publisher_id) ? 
            ( 
                index = users.findIndex((obj => obj.publisher_id == publisher_id)),
                users[index].socket_id = socket_id
            )
            : 
            (users.push({publisher_id, subscriber_id, socket_id}))
    }
}

const getUser = (socket_id) => {
    index = users.findIndex((obj => obj.socket_id == socket_id))
    if(index >= 0){
        return {
            return:true,
            data:users[index]
        };
    }else{
        return {
            return:false,
        };
    }
}

const addConnection = (socket_id, user_id) => {
    if(socket_id != null){
        connections.some(user => user.user_id === user_id) ? 
            ( 
                index = connections.findIndex((obj => obj.user_id == user_id)),
                connections[index].socket_id = socket_id
            )
            : 
            (connections.push({user_id, socket_id}))
    }
}

const getConnection = (user_id) => {
    index = connections.findIndex((obj => obj.user_id == user_id))
    if(index >= 0){
        return {
            return:true,
            socket_id:connections[index].socket_id
        };
    }else{
        return {
            return:false,
        };
    }
}


io.on('connect', (socket) => {
    socket.on('add_connections',({socket_id, user_id}) => {
        addConnection(socket_id, user_id)
    })
    socket.on('addUser',({socket_id, publisher_id, subscriber_id}) => {
        addUser(socket_id, publisher_id, subscriber_id)
    })

    socket.on('down', (data) => {
        const receiver = getUser(socket.id)
        if(receiver.return){
            const subscriber = getConnection(receiver.data.subscriber_id)
            if(subscriber.return){
                io.to(subscriber.socket_id).emit('ondown', (data))
            }else{
                console.log('receiver not found');
            }
        }
    })
    socket.on('mousemove', (data) => {
        const receiver = getUser(socket.id)
        
        if(receiver.return){
        const subscriber = getConnection(receiver.data.subscriber_id)
        if(subscriber.return){
            io.to(subscriber.socket_id).emit('setMouseMove', {x:data.x, y:data.y})
        }else{
            console.log('receiver not found');
        }
    }
    })
    socket.on('mousedown', (mouse) => {
        const receiver = getUser(socket.id)
        
        if(receiver.return){
            const subscriber = getConnection(receiver.data.subscriber_id)
            if(subscriber.return){
                io.to(subscriber.socket_id).emit('setMouseDown', {x:mouse.x, y:mouse.y})
            }else{
                console.log('receiver not found');
            }
        }
    })

    socket.on('changePenColor', (color) => {
        const receiver = getUser(socket.id)
        
        if(receiver.return){
            const subscriber = getConnection(receiver.data.subscriber_id)
            if(subscriber.return){
                io.to(subscriber.socket_id).emit('setPenColor', (color))
            }else{
                console.log('receiver not found');
            }
        }
    })

    socket.on('changePenSize', (color) => {
        const receiver = getUser(socket.id)
        
        if(receiver.return){
            const subscriber = getConnection(receiver.data.subscriber_id)
            if(subscriber.return){
                io.to(subscriber.socket_id).emit('setPenSize', (color))
            }else{
                console.log('receiver not found');
            }
        }
    })
    socket.on('changeBackgroundColor', (color) => {
        const receiver = getUser(socket.id)
        
        if(receiver.return){
            const subscriber = getConnection(receiver.data.subscriber_id)
            if(subscriber.return){
                io.to(subscriber.socket_id).emit('setBackgroundColor', (color))
            }else{
                console.log('receiver not found');
            }
        }
    })
    socket.on('clearBoardListen', () => {
        const receiver = getUser(socket.id)
        
        if(receiver.return){
            const subscriber = getConnection(receiver.data.subscriber_id)
            if(subscriber.return){
                io.to(subscriber.socket_id).emit('clearBoard')
            }else{
                console.log('receiver not found');
            }
        }
    })
    socket.on('disconnect', () => {
        connections = connections.filter((con) => con.id !== socket.id)
    })
})

server.listen(3000, () => {
    console.log('Running Server!!!');
})