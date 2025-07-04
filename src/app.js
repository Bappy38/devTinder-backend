const express = require('express');
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { createServer } = require("node:http");
const { Server } = require("socket.io");

const { errorHandler } = require('./middlewares/error');

const { createOrUpdateTemplate } = require("./utils/createEmailTemplate");
const socket = require('./utils/socket');

const authRouter = require('./routes/authRoutes');
const profileRouter = require('./routes/profileRoutes');
const requestRouter = require('./routes/requestRoutes');
const userRouter = require('./routes/userRoutes');
const messageRouter = require('./routes/messageRoutes');

require('dotenv').config();
require('./utils/cronjob');

const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
});

socket(io);

const PORT = process.env.PORT || 3000;

connectDB()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Server failed to start: " + err);
        process.exit(1);
    });

const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/request", requestRouter);
app.use("/user", userRouter);
app.use("/message", messageRouter);

app.use(errorHandler);