const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/userModel');
const fs = require('fs');

mongoose.connect(process.env.connectionString).then(async () => {
    const admin = await User.findOne({ role: 'Admin' });
    if (admin) {
        fs.writeFileSync('admin_id.txt', admin._id.toString());
    } else {
        fs.writeFileSync('admin_id.txt', "No Admin found");
    }
    process.exit();
}).catch(err => {
    fs.writeFileSync('admin_id.txt', err.message);
    process.exit();
});
