const { createClient } = require("redis");

const client = createClient({
    url: process.env.REDIS_CONNECTION,
    enable_offline_queue: false
});

client.on('error', (err) => console.error('Redis Error:', err));

(async () => {
    await client.connect();
    console.log('Redis client connected');
})();

module.exports = client;