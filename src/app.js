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

app.get("/users", async (req, res) => {
    const users = await User.find({});
    res.send(users);
});

app.get("/users/:userId", async (req, res) => {
    const user = await User.findById(req.params.userId);

    if (!user) {
        res.status(404).send("User not found");
        return;
    }

    res.send(user);
});

app.patch("/users/:userId", async (req, res) => {

    const updateMetadata = await User.findByIdAndUpdate(req.params.userId, {firstName: req.body.firstName, lastName: req.body.lastName}, {includeResultMetadata: true});
    if (!updateMetadata.value) {
        res.status(404).send("User not found");
        return;
    }
    res.send("User updated successfully");
});

app.delete("/users/:userId", async (req, res) => {

    await User.findByIdAndDelete(req.params.userId);
    res.send("User deleted successfully");
});

app.use((err, req, res, next) => {

    if (err) {
        res.status(500).send("Internal Server Error");
    }
});