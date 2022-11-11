const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const socket = require("socket.io")
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")

const userRoutes = require("./routes/userRoutes")
const messagesRoute = require("./routes/messagesRoute")
const authRoute = require("./routes/authRoutes")

const app = express()
require("dotenv").config()

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())

app.use("/api/user", userRoutes)
app.use("/api/messages", messagesRoute)
app.use("/api/auth", authRoute)
 
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MONGODB CONNECTED!"))
.catch((err) => console.log(err.message))

const server = app.listen(process.env.PORT, () => {
    console.log(`Server Started on Port: ${process.env.PORT}`)
})

const io = socket(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
})

global.onlineUsers = new Map()

socket.on('popup', function(msg){
    console.log("hello: ", msg)
});

socket.on('connect_error', function(err) {
    console.log("client connect_error: ", err);
});

socket.on('connect_timeout', function(err) {
    console.log("client connect_timeout: ", err);
});

io.use((socket, next) => {
    socket.on("send-msg", (data) => {
        jwt.verify(data.token, process.env.ACCESS_TOKEN_SECRET_KEY, (err, user) => {
            if(err) {
                next(new Error("jwt expired or invalid"))
            }
        })
    })
    next()
})

io.on("connection", (socket) => {
    global.chatSocket = socket

    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id)
    })

    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to)
        if(sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-receive", {
                from: data.from,
                msg: data.msg
            })
        }
    })
})