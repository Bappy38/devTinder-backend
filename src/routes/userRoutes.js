const express = require("express");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const { sendSuccessResponse } = require("../utils/response");

const userRouter = express.Router();

userRouter.get("/request/received", async (req, res, next) => {
    try {
        const loggedInUserId = req.userId;
        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUserId,
            status: "interested"
        }).populate('fromUserId', [ 'firstName', 'lastName', 'about', 'dateOfBirth', 'gender', 'photoUrl', 'skills' ]);

        sendSuccessResponse(res, {
            message: "Connection request fetched successfully",
            data: connectionRequests
        });
    } catch (err) {
        next(err);
    }
});

userRouter.get("/connection", async (req, res, next) => {
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
        .populate('fromUserId', [ 'firstName', 'lastName', 'about', 'dateOfBirth', 'gender', 'photoUrl', 'skills' ])
        .populate('toUserId', [ 'firstName', 'lastName', 'about', 'dateOfBirth', 'gender', 'photoUrl', 'skills' ]);

        const data = connections.map((connection) => {
            if (connection.fromUserId._id.toString() === loggedInUserId) {
                return {
                    _id: connection._id,
                    user: connection.toUserId
                };
            }
            return {
                _id: connection._id,
                user: connection.fromUserId
            };
        });

        sendSuccessResponse(res, {
            message: "Connection request fetched successfully",
            data: data
        });
    } catch (err) {
        next(err);
    }
});

userRouter.get("/feed", async (req, res, next) => {
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
        }).select("firstName lastName about photoUrl skills");

        sendSuccessResponse(res, {
            message: "Feed fetched successfully",
            data: users
        });
    } catch (err) {
        next(err);
    }
});

userRouter.get("/connection/:connectionId", async (req, res, next) => {
    try {
        const loggedInUserId = req.userId;
        const connectionId = req.params.connectionId;

        const connection = await ConnectionRequest.findById(connectionId)
            .populate('fromUserId', [ 'firstName', 'lastName', 'about', 'dateOfBirth', 'gender', 'photoUrl', 'skills', 'lastSeen' ])
            .populate('toUserId', [ 'firstName', 'lastName', 'about', 'dateOfBirth', 'gender', 'photoUrl', 'skills', 'lastSeen' ]);

        const data = (connection.fromUserId._id.toString() === loggedInUserId)? 
            {
                _id: connection._id,
                user: connection.toUserId
            }
            :
            {
                _id: connection._id,
                user: connection.fromUserId
            };

        sendSuccessResponse(res, {
            message: "Connection fetched successfully",
            data: data
        });
    } catch (err) {
        next(err);
    }
});

module.exports = userRouter;