const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const userRouter = express.Router();

userRouter.get("/request/received", userAuth, async (req, res, next) => {
    try {
        const loggedInUserId = req.userId;
        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUserId,
            status: "interested"
        }).populate('fromUserId', ['firstName', 'lastName', 'photoUrl', 'skills']);

        res.status(200).json({
            success: true,
            message: "Connection request fetched successfully",
            data: connectionRequests
        });
    } catch (err) {
        next(err);
    }
});

userRouter.get("/connection", userAuth, async (req, res, next) => {
    try {
        const loggedInUserId = req.userId;
        const connections = await ConnectionRequest.find({
            $or: [
                {
                    fromUserId: loggedInUserId, status: "accepted"
                },
                {
                    toUserId: loggedInUserId, status: "accepted"
                }
            ]
        })
        .populate('fromUserId', ['firstName', 'lastName', 'photoUrl', 'skills'])
        .populate('toUserId', ['firstName', 'lastName', 'photoUrl', 'skills']);

        const data = connections.map((connection) => {
            if (connection.fromUserId._id.toString() === loggedInUserId) {
                return connection.toUserId;
            }
            return connection.fromUserId;
        });

        res.status(200).json({
            success: true,
            message: "Connection request fetched successfully",
            data: data
        });
    } catch (err) {
        next(err);
    }
});

userRouter.get("/feed", userAuth, async (req, res, next) => {
    try {
        const loggedInUserId = req.userId;

        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUserId },
                { toUserId: loggedInUserId }
            ]
        }).select("fromUserId toUserId");

        const ignoreUsersFromFeed = new Set();
        ignoreUsersFromFeed.add(loggedInUserId);
        connectionRequests.forEach((req) => {
            ignoreUsersFromFeed.add(req.fromUserId.toString());
            ignoreUsersFromFeed.add(req.toUserId.toString());
        });

        const users = await User.find({
            _id: { $nin: Array.from(ignoreUsersFromFeed) }
        }).select("firstName lastName photoUrl skills");

        res.send(users);
    } catch (err) {
        next(err);
    }
})

module.exports = userRouter;