const cookie = require('cookie');
const jwt = require("jsonwebtoken");

const socketAuth = (socket, next) => {

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
    }

    module.exports = socketAuth;