const express = require('express');
const connectDB = require("./config/database");
require('dotenv').config();

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

app.post("/auth/signup", (req, res) => {
    console.log(req);
    res.status(201).send("User created successfully");
});