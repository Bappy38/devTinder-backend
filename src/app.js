const express = require('express');
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { createServer } = require("node:http");

const { errorHandler } = require('./middlewares/error');

const { createOrUpdateTemplate } = require("./utils/createEmailTemplate");

const authRouter = require('./routes/authRoutes');
const profileRouter = require('./routes/profileRoutes');
const requestRouter = require('./routes/requestRoutes');
const userRouter = require('./routes/userRoutes');
const messageRouter = require('./routes/messageRoutes');
const connectSocket = require('./utils/socket');
const authRateLimiter = require('./middlewares/authRateLimiter');
const apiRateLimiter = require('./middlewares/apiRateLimiter');
const { userAuth } = require('./middlewares/auth');

require('dotenv').config();
require('./utils/cronjob');
require('./config/redisClient');

const app = express();

const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRateLimiter, authRouter);
app.use("/profile", userAuth, apiRateLimiter, profileRouter);
app.use("/request", userAuth, apiRateLimiter, requestRouter);
app.use("/user", userAuth, apiRateLimiter, userRouter);
app.use("/message", userAuth, apiRateLimiter, messageRouter);

app.use(errorHandler);

const server = createServer(app);

const PORT = process.env.PORT || 3000;

connectDB()
    .then(() => {
        return connectSocket(server);
    })
    .then(() => {
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Server failed to start: " + err);
        process.exit(1);
    });