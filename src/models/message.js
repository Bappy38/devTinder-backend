const { mongoose } = require("mongoose");


const messageSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'ConnectionRequest'
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    text: {
        type: String,
        required: true
    }
},
{
    timestamps: true
});

messageSchema.index({
    roomId: 1,
    _id: -1
});


const Message = mongoose.model("Message", messageSchema);

module.exports = Message;