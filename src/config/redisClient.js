const { createClient } = require("redis");


const client = createClient({
    url: process.env.REDIS_CONNECTION
});

client.on('error', (err) => console.error('Redis Error:', err));

const connectRedis = async () => {
    if (!client.isOpen) {
        await client.connect()
        console.log('Redis client connected');
    };
};

module.exports = {
    redisClient: client,
    connectRedis
};