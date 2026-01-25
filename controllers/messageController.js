const Message = require('../models/messageModel');

// Get messages between two users 
exports.getMessages = async (req, res) => {
    const { userId, otherId } = req.params;
    try {
        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: otherId },
                { senderId: otherId, receiverId: userId }
            ]
        }).sort({ timestamp: 1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all messages for a specific user
exports.getUserMessages = async (req, res) => {
    const { id } = req.params;
    try {
        const messages = await Message.find({
             $or: [
                { receiverId: id },
                { senderId: id }
            ]
        })
        .sort({ timestamp: 1 })
        .populate("senderId", "username email role")
        .populate("receiverId", "username email role");

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
