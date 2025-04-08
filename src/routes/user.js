const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");

const userRouter = express.Router();

userRouter.get("/request/received", userAuth, async (req, res, next) => {
    try {
        const loggedInUserId = req.userId;
        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUserId,
            status: "interested"
        }).populate('fromUserId', ['firstName', 'lastName', 'photoUrl', 'skills']);

        console.log(connectionRequests);

        res.status(200).json({
            success: true,
            message: "Connection request fetched successfully",
            data: connectionRequests
        });
    } catch (err) {
        next(err);
    }
});

module.exports = userRouter;