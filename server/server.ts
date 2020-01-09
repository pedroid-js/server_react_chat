import express from "express"
import { createServer } from "http"
import {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    User,
    Error,
    getUsers
} from './users'
import cors from 'cors'
const PORT = process.env.PORT || 5000
const app = express()
const server = createServer(app)
const io = require("socket.io")(server)

//Middleware
app.use(cors())

let users: string[] = []

io.on("connection", (socket: any) => {
    console.log("We have a new connection")

    socket.on('join', async ({ name, room }:
        { name: string, room: string },
        callback: Function) => {
        const response = await addUser({ id: socket.id, name, room })
        try {
            let value = JSON.parse(response)
            let error = value.error, user = value.user

            if (error) return callback(error)

            socket.join(user.room)

            users[socket.id] = name
            socket.emit('message', { user: 'admin', text: `${user.name}, welcome to the room ${user.room}` })
            socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name}, has joined!` })

            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

            callback()
        } catch {
            return callback("There was an error")
        }
    })

    socket.on('sendMessage', (message: string, name: string, callback: Function) => {
        try {
            const response = getUser(socket.id)
            let user = JSON.parse(response)
            console.log(user)
            io.to(user.room).emit('message', { user: user.name, text: ` ${message}` })
        } catch (err) {
            console.log(err)
        } finally {
            callback()
        }
    })

    socket.on("disconnect", () => {
        console.log("User had left!!")
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
          }
    })
})


async function init() {
    await server.listen(PORT)
    console.log("Server listening on port", PORT)
}

init()