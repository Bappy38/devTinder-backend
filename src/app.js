const express = require('express');
const connectDB = require("./config/database");
require('dotenv').config();

const User = require("./models/user");

const app = express();

const PORT = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Server failed to start");
        process.exit(1);
    });

app.use(express.json());

app.post("/auth/signup", async (req, res) => {
    const user = new User(req.body);
    await user.save();
    res.status(201).send("User created successfully");
});

app.use((err, req, res, next) => {

    if (err) {
        res.status(500).send("Internal Server Error");
    }
});