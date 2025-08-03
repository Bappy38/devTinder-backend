require('dotenv').config();

const express = require('express');
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { createServer } = require("node:http");

const { errorHandler } = require('./middlewares/errorHandler');

const { createOrUpdateTemplate } = require("./utils/createEmailTemplate");

// require('./utils/cronjob');

const app = express();

const allowedOrigins = require('./config/corsConfigs');
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.debug(`Allowed origins: ${allowedOrigins}`);
            callback(new Error(`CORS policy violation: Origin ${origin} not allowed`));
        }
    },
    credentials: true
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

require('./config/redisClient');
const connectSocket = require('./utils/socket');
const authRateLimiter = require('./middlewares/authRateLimiter');
const apiRateLimiter = require('./middlewares/apiRateLimiter');
const { apiAuth } = require('./middlewares/apiAuth');

const authRouter = require('./routes/authRoutes');
const profileRouter = require('./routes/profileRoutes');
const requestRouter = require('./routes/requestRoutes');
const userRouter = require('./routes/userRoutes');
const messageRouter = require('./routes/messageRoutes');

app.use("/auth", authRateLimiter, authRouter);
app.use("/profile", apiAuth, apiRateLimiter, profileRouter);
app.use("/request", apiAuth, apiRateLimiter, requestRouter);
app.use("/user", apiAuth, apiRateLimiter, userRouter);
app.use("/message", apiAuth, apiRateLimiter, messageRouter);

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