const cookie = require('cookie');
const jwt = require("jsonwebtoken");
const ConnectionRequest = require('../models/connectionRequest');
const Message = require('../models/message');
const User = require('../models/user');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-streams-adapter');
const { createClient } = require('redis');

const connectSocket = async (server) => {
    try {
        const redisUrl = process.env.REDIS_CONNECTION;

        const redisClient = createClient({ url: redisUrl });
        await redisClient.connect();

        const io = new Server(server, {
            cors: {
                origin: process.env.CORS_ORIGIN,
                credentials: true
            }
        });
        io.adapter = createAdapter(redisClient);

        addSocketRoutes(io);
    }
    catch (err) {
        console.error('Error setting up socket:', err);
        process.exit(1);
    }
};

const addSocketRoutes = (io) => {

    io.use((socket, next) => {

        const cookies = socket.handshake.headers.cookie;
            
        if (!cookies) {
            return next(new Error('No cookies found'));
        }

        const parsedCookies = cookie.parse(cookies);
        const accessToken = parsedCookies['accessToken'];

        if (!accessToken) {
            return next(new Error('No token found in cookie'));
        }

        try {
            const claims = jwt.verify(accessToken, process.env.SECRET_KEY)
            const { userId } = claims;
            socket.userId = userId;

            next();
        } catch (err) {
            console.error('Socket auth failed: ', err.message);
            return next(new Error('Invalid token'));
        }
    });

    io.on('connection', async (socket) => {

        console.log('User connected: ', socket.userId);

        socket.on('heartbeat', async () => {
            try {
                await User.findByIdAndUpdate(socket.userId, { lastSeen: new Date() });
            } catch (err) {
                console.error('Error updating lastSeen on heartbeat:', err);
            }
        });

        socket.on('joinRoom', async (roomId) => {

            const connection = await ConnectionRequest.findById(roomId);
            const isAuthorized = connection && (connection.fromUserId.toString() === socket.userId || connection.toUserId.toString() === socket.userId);
            
            if (!isAuthorized) {
                socket.disconnect();
                return;
            }
            
            socket.join(roomId);
            console.log(`User ${socket.userId} joined room ${roomId}`);
        });

        socket.on('sendMessage', async ({roomId, text}) => {

            try {
                const connection = await ConnectionRequest.findById(roomId);
                const isAuthorized = connection && (connection.fromUserId.toString() === socket.userId || connection.toUserId.toString() === socket.userId);

                if (!isAuthorized) {
                    socket.disconnect();
                    return;
                }

                const newMessage = new Message({
                    roomId,
                    senderId: socket.userId,
                    text
                });
                const data = await newMessage.save();
                
                io.to(roomId).emit('receiveMessage', data);
            } catch (err) {
                console.error('Error occured while sending message: ', err);
            }
        });

        socket.on('disconnect', () => {
            User.findByIdAndUpdate(socket.userId, { lastSeen: new Date() })
                .catch(err => console.error('Error updating lastSeen on disconnect:', err));
            console.log('User disconnected: ', socket.userId);
        });
    });
};

module.exports = connectSocket;