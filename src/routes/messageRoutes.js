const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Message = require("../models/message");
const { sendSuccessResponse } = require("../utils/response");

const messageRouter = express.Router();

messageRouter.get("/:roomId", userAuth, async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const { cursor, limit = 20 } = req.query;

        const query = {
            roomId: roomId
        };

        if (cursor) {
            query._id = { $lt: cursor }
        }

        const messages = await Message.find(query)
            .sort({ _id: -1 })
            .limit(parseInt(limit, 10));
        const reversedMessages = messages.reverse();

        sendSuccessResponse(res, {
            message: "Messages fetched successfully",
            data: {
                messages: reversedMessages,
                nextCursor: messages.length ? messages.at(0)._id : null
            }
        });
    } catch (err) {
        next(err);
    }
});

module.exports = messageRouter;