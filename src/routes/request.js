const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { errorHandler } = require("../middlewares/error");
const ConnectionRequest = require("../models/connectionRequest");
const { ValidationError, NotFoundError } = require("../errors/error");
const User = require("../models/user");

const requestRouter = express.Router();

requestRouter.post("/send/:status/:toUserId", userAuth, async (req, res, next) => {
    try {
        const fromUserId = req.userId;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        if (fromUserId === toUserId) {
            throw new ValidationError("Cannot send connection request to yourself");
        }

        const toUser = await User.findById(toUserId);
        if (!toUser) {
            throw new NotFoundError("User not found");
        }

        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });
        const data = await connectionRequest.save();

        res.status(201).json({
            message: "Connection Request Sent",
            data
        });
    } catch(err) {
        next(err);
    }
}, errorHandler)

module.exports = requestRouter;