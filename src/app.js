const express = require('express');
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const { errorHandler } = require('./middlewares/error');
const requestRouter = require('./routes/request');
const userRouter = require('./routes/user');

const { createOrUpdateTemplate } = require("./utils/createEmailTemplate");

require('dotenv').config();
require('./utils/cronjob');

const app = express();

const PORT = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
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

app.use(errorHandler);