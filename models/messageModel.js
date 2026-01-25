const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Users"
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Users"
  },
  senderRole: {
    type: String,
    enum: ["User", "Farmer", "Admin"],
    required: true
  },
  receiverRole: {
    type: String,
    enum: ["User", "Farmer", "Admin"]
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  roomId: {
    type: String
  }
});

module.exports = mongoose.model("Message", messageSchema);
