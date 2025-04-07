const express = require("express");
const bcrypt = require("bcrypt");
const {validateSignUpData} = require("../utils/validation");
const ValidationError = require('../errors/ValidationError');
const User = require("../models/user");
const { errorHandler } = require("../middlewares/error");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res, next) => {
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
}, errorHandler);

authRouter.post("/signin", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({email: email});

        if (!user) {
            throw new ValidationError("Invalid Credentials");
        }

        if (!await user.isValidPassword(password)) {
            throw new ValidationError("Invalid Credentials");
        }

        const accessToken = await user.getAccessToken();
        res.cookie("accessToken", accessToken, {
            expires: new Date(Date.now() + Number(process.env.COOKIE_EXPIRES_IN_MS))
        });
        res.status(201).send("Logged In Successfull");
    } catch (err) {
        next(err);
    }
}, errorHandler);

authRouter.post("/logout", async (req, res, next) => {
    try {
        res.cookie("accessToken", null, {
            expires: new Date(Date.now())
        }).send("Logout successfull");
    } catch (err) {
        next(err);
    }
}, errorHandler);

module.exports = authRouter;