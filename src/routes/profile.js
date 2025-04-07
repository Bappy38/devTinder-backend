const express = require("express");
const User = require("../models/user");
const { userAuth } = require("../middlewares/auth");
const { errorHandler } = require("../middlewares/error");

const profileRouter = express.Router();

profileRouter.get("/", userAuth, async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        res.send(user);
    } catch (err) {
        next(err);
    }
}, errorHandler);

module.exports = profileRouter;