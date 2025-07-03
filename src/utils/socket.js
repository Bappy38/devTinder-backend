const cookie = require('cookie');
const jwt = require("jsonwebtoken");

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

    io.on('connection', (socket) => {

        console.log('User connected: ', socket.userId);

        socket.on('joinRoom', (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.userId} joined room ${roomId}`);
        });

        socket.on('sendMessage', ({roomId, message}) => {
            io.to(roomId).emit('receiveMessage', message);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected: ', socket.userId);
        });
    });
};