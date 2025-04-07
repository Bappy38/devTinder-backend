const express = require('express');
const connectDB = require("./config/database");
require('dotenv').config();
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");

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

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/profile", profileRouter);