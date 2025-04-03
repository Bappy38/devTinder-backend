const express = require('express');
const connectDB = require("./config/database");
require('dotenv').config();

const User = require("./models/user");
const {validateSignUpData} = require("./utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const ValidationError = require('./errors/ValidationError');
const jwt = require("jsonwebtoken");

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
app.use(cookieParser());

app.post("/auth/signup", async (req, res, next) => {
    try {
        validateSignUpData(req);

        const { firstName, lastName, email, password } = req.body;
        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({
            firstName,
            lastName,
            email,
            password: passwordHash
        });
        await user.save();
        res.status(201).send("User created successfully");
    } catch (err) {
        next(err);
    }
});

app.post("/auth/signin", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({email: email});

        if (!user) {
            throw new ValidationError("Invalid Credentials");
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new ValidationError("Invalid Credentials");
        }

        const accessToken = await jwt.sign({
            userId: user._id
        }, "secretKey");
        
        res.cookie("accessToken", accessToken);
        res.status(201).send("Logged In Successfull");
    } catch (err) {
        next(err);
    }
});

app.get("/users/profile", async (req, res, next) => {
    try {
        const cookies = req.cookies;
        
        const { accessToken } = cookies;

        const claims = jwt.verify(accessToken, "secretKey");

        const user = await User.findById(claims.userId);

        res.send(user);
    } catch (err) {
        next(err);
    }
});

app.get("/users", async (req, res, next) => {
    try {
        const users = await User.find({});
        res.send(users);   
    } catch (err) {
        next(err);
    }
});

app.get("/users/:userId", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            res.status(404).send("User not found");
            return;
        }

        res.send(user);   
    } catch (err) {
        next(err);
    }
});

app.patch("/users/:userId", async (req, res, next) => {
    try {
        const updateMetadata = await User.findByIdAndUpdate(req.params.userId, 
            {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                dateOfBirth: req.body.dateOfBirth,
                gender: req.body.gender,
                photoUrl: req.body.photoUrl,
                skills: req.body.skills,
                email: req.body.email
            },
            {
                includeResultMetadata: true,
                runValidators: true
            }
        );

        if (!updateMetadata.value) {
            res.status(404).send("User not found");
            return;
        }
        res.send("User updated successfully");   
    } catch (err) {
        next(err);
    }
});

app.delete("/users/:userId", async (req, res, next) => {
    try {
        await User.findByIdAndDelete(req.params.userId);
        res.send("User deleted successfully");   
    } catch (err) {
        next(err);
    }
});

app.use((err, req, res, next) => {

    console.error("Error: ", err.stack || err.message || err);

    let statusCode = 500;
    let message = "Internal Server Error";

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message
    } else if (err.name === 'MongoServerError' && err.code === 11000) {
        statusCode = 409;
        message = err.message;
    }

    res.status(statusCode).json({
        success: false,
        errror: message
    });
});