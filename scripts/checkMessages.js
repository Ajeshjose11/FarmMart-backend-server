const mongoose = require('mongoose');
require('dotenv').config();
const Message = require('./models/messageModel');
const fs = require('fs');

mongoose.connect(process.env.connectionString).then(async () => {
    const messages = await Message.find().sort({timestamp: -1}).limit(5);
    const output = messages.map(m => ({
        msg: m.message,
        senderId: m.senderId.toString(),
        receiverId: m.receiverId.toString(),
        roomId: m.roomId,
        role: m.senderRole
    }));
    fs.writeFileSync('messages_dump.json', JSON.stringify(output, null, 2));
    mongoose.connection.close();
}).catch(err => console.log(err));
