const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const { ValidationError, NotFoundError } = require("../errors/error");
const User = require("../models/user");
const { validateSendConnectionRequestData, validateReviewConnectionRequestData } = require("../utils/validation");

const requestRouter = express.Router();

requestRouter.post("/send/:status/:toUserId", userAuth, async (req, res, next) => {
    try {
        validateSendConnectionRequestData(req);

        const fromUserId = req.userId;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        const toUser = await User.findById(toUserId);
        if (!toUser) {
            throw new NotFoundError("User not found");
        }

        const existingConnReq = await ConnectionRequest.findOne({
            $or: [
                {
                    fromUserId: fromUserId,
                    toUserId: toUserId
                },
                {
                    fromUserId: toUserId,
                    toUserId: fromUserId
                }
            ]
        });
        if (existingConnReq) {
            throw new ValidationError("Already sent a connection request");
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
});

requestRouter.post("/review/:status/:requestId", userAuth, async (req, res, next) => {
    try {
        validateReviewConnectionRequestData(req);

        const loggedInUserId = req.userId;
        const { status, requestId } = req.params;
        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUserId,
            status: "interested"
        });
        
        if (!connectionRequest) {
            throw new NotFoundError("Connection request not found");
        }

        connectionRequest.status = status;
        const data = await connectionRequest.save();

        res.status(200).json({
            success: true,
            message: "Connection request reviewed successfully",
            data
        });
    } catch (err) {
        next(err);
    }
});

module.exports = requestRouter;