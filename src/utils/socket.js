const cookie = require('cookie');
const jwt = require("jsonwebtoken");
const ConnectionRequest = require('../models/connectionRequest');

module.exports = (io) => {

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

        socket.on('joinRoom', async (roomId) => {

            const connection = await ConnectionRequest.findById(roomId);
            const isAuthorized = connection && (connection.fromUserId.toString() === socket.userId || connection.toUserId.toString() === socket.userId);
            
            if (isAuthorized) {
                socket.join(roomId);
                console.log(`User ${socket.userId} joined room ${roomId}`);
            }
            else {
                console.warn(`User ${socket.userId} tried to join room ${roomId} they don't belong to`);
                socket.disconnect();
            }
        });

        socket.on('sendMessage', async ({roomId, message}) => {

            const connection = await ConnectionRequest.findById(roomId);
            const isAuthorized = connection && (connection.fromUserId.toString() === socket.userId || connection.toUserId.toString() === socket.userId);
            
            if (isAuthorized) {
                io.to(roomId).emit('receiveMessage', message);
            }
            else {
                console.warn(`User ${socket.userId} tried to send message to room ${roomId} they don't belong to`);
                socket.disconnect();
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected: ', socket.userId);
        });
    });
};