//import and configure dotenv
require('dotenv').config();

//import mongoose
const mongoose = require('mongoose')
// console.log("db.js file loaded");

const dbString = process.env.connectionString
// console.log("Connection String:" ,dbString);


//connect to mongodb database
mongoose.connect(dbString).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log("Error connecting to MongoDB:"+err.message);
})

