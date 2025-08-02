const { RateLimiterRedis } = require("rate-limiter-flexible");
const redisClient = require("../config/redisClient");
const { sendErrorResponse } = require("../utils/response");


const limiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "apiRateLimiter",
    points: process.env.API_LIMITER_POINTS || 20,
    duration: process.env.API_LIMITER_DURATION || 60
});

const apiRateLimiter = async (req, res, next) => {
    try {
        await limiter.consume(req.userId || req.ip);
        next();
    } catch (err) {
        sendErrorResponse(res, {
            status: 429,
            message: "Too many requests, please try again later."
        });
    }
}

module.exports = apiRateLimiter;