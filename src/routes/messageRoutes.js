const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Message = require("../models/message");

const messageRouter = express.Router();

messageRouter.get("/:roomId", userAuth, async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const { cursor, limit = 20 } = req.query;

        console.log(roomId, cursor, limit);

        const query = {
            roomId: roomId
        };

        if (cursor) {
            query._id = { $lt: cursor }
        }

        const messages = await Message.find(query)
            .sort({ _id: -1 })
            .limit(parseInt(limit, 10));

        res.json({
            success: true,
            data: messages,
            nextCursor: messages.length ? messages.at(-1)._id : null
        });
    } catch (err) {
        next(err);
    }
});

module.exports = messageRouter;