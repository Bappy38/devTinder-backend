const { RateLimiterRedis } = require("rate-limiter-flexible");
const redisClient = require("../config/redisClient");
const { sendErrorResponse } = require("../utils/response");

const limiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "authRateLimiter",
    points: process.env.AUTH_LIMITER_POINTS || 5,
    duration: process.env.AUTH_LIMITER_DURATION || 60 * 5,
    blockDuration: process.env.AUTH_LIMITER_BLOCK_DURATION || 60 * 10
});

const authRateLimiter = async (req, res, next) => {
    try {
        await limiter.consume(req.ip);
        next();
    } catch (err) {
        sendErrorResponse(res, {
            status: 429,
            message: "Too many requests, please try again later."
        });
    }
}

module.exports = authRateLimiter;