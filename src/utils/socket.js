const ConnectionRequest = require('../models/connectionRequest');
const Message = require('../models/message');
const User = require('../models/user');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');
const socketAuth = require('../middlewares/socketAuth');
const { RateLimiterRedis, RateLimiterRes } = require('rate-limiter-flexible');
const redisClient = require("../config/redisClient");
const allowedOrigins = require('../config/corsConfigs');

const chatRateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    useRedisPackage: true,
    keyPrefix: 'socketRateLimiter',
    points: process.env.CHAT_LIMITER_POINTS | 10,
    duration: process.env.CHAT_LIMITER_DURATION | 60
});

const connectSocket = async (server) => {
    try {
        const redisUrl = process.env.REDIS_CONNECTION;

        const pubClient = createClient({
            url: redisUrl
        });
        const subClient = pubClient.duplicate();

        await Promise.all([
            pubClient.connect(),
            subClient.connect()
        ]);

        const io = new Server(server, {
            adapter: createAdapter(pubClient, subClient),
            cors: {
                origin: (origin, callback) => {
                    if (!origin || allowedOrigins.includes(origin)) {
                        callback(null, true);
                    } else {
                        callback(new Error('CORS policy violation: Origin not allowed'));
                    }
                },
                credentials: true
            }
        });
        console.log('Current adapter:', io.of('/').adapter.constructor.name);
        console.log('Socket.IO connected');

        addSocketRoutes(io);
    }
    catch (err) {
        console.error('Error setting up socket:', err);
        throw err;
    }
};

const addSocketRoutes = (io) => {

    io.use(socketAuth);

    io.on('connection', async (socket) => {

        console.log('User connected: ', socket.userId);

        socket.on('heartbeat', async () => {
            try {
                await User.findByIdAndUpdate(socket.userId, { lastSeen: new Date() });
            } catch (err) {
                console.error('Error updating lastSeen on heartbeat:', err);
            }
        });

        socket.on('joinRoom', async ({roomId}, callback) => {

            const connection = await ConnectionRequest.findById(roomId);
            const isAuthorized = connection && (connection.fromUserId.toString() === socket.userId || connection.toUserId.toString() === socket.userId);
            
            if (!isAuthorized) {
                console.log(`Unauthorized join attempt by user ${socket.userId} in room ${roomId}`);
                return callback({
                    unAuthorized: true
                });
            }
            
            socket.join(roomId);
            console.log(`User ${socket.userId} joined room ${roomId}`);
            return callback({ success: true });
        });

        socket.on('sendMessage', async ({roomId, text}, callback) => {

            try {
                const connection = await ConnectionRequest.findById(roomId);
                const isAuthorized = connection && (connection.fromUserId.toString() === socket.userId || connection.toUserId.toString() === socket.userId);

                if (!isAuthorized) {
                    return callback({
                        error: 'You are not authorized to send messages in this room'
                    });
                }

                await chatRateLimiter.consume(socket.userId);

                const newMessage = new Message({
                    roomId,
                    senderId: socket.userId,
                    text
                });
                const data = await newMessage.save();
                
                io.to(roomId).emit('receiveMessage', data);
                return callback({ success: true });
            } catch (err) {
                if (err instanceof RateLimiterRes) {
                    const retryAfter = Math.ceil(err.msBeforeNext / 1000);
                    return callback({
                        error: `You are sending messages too frequently. Please wait ${retryAfter} seconds.`
                    });
                }
                
                console.error('Error occured while sending message: ', err);
                return callback({
                    error: 'Something went wrong while sending the message'
                });
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