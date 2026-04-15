//import mongoose
const mongoose = require('mongoose')
// console.log("db.js file loaded");

const dbString = process.env.connectionString
// console.log("Connection String:" ,dbString);


if (!dbString) {
    console.error("CRITICAL ERROR: connectionString is undefined in .env!");
} else {
    console.log("Attempting to connect to MongoDB...");

    mongoose.connect(dbString)
        .then(() => {
            console.log("SUCCESS: Connected to MongoDB");
        })
        .catch((err) => {
            console.error("CRITICAL: MongoDB Connection Failed!");
            console.error("Message:", err.message);
        });
}

