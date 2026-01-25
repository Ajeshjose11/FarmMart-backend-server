
const Users = require('../models/userModel');

//import jwt for jwt token creation
const jwt = require("jsonwebtoken")

//Register user 
exports.registerUser = async (req, res) => {
    console.log("Inside Register User");
    console.log(req.body);
    const { username, email, password, role } = req.body;
    try {
        const existingUser = await Users.findOne({ email })

        if (existingUser) {
            res.status(401).json({ message: "User already exists with this Email" })
        }
        else {
            const newUser = new Users({ username, email, password, role });
            await newUser.save();
            res.status(201).json(newUser)
        }
    } catch (err) {
        res.status(500).json({ message: "Error Registering User", error: err.message });
    }
};

exports.loginUser = async (req, res) => {
    console.log("Inside Login User");
    // res.send("Login User")
    const { email, password } = req.body;
    const existingUser = await Users.findOne({ email })

    try {
        if (existingUser) {
            if (existingUser.password === password) {
                const token = jwt.sign({ id: existingUser._id, role: existingUser.role }, process.env.jwtKey)
                console.log(token);
                res.status(200).json({ message: "Login Successful", user: existingUser, token })
            }
            else {
                res.status(401).json({ message: "Password Incorrect" })
            }
        }
        else {
            res.status(401).json({ message: "User not found with this email" })
        }
    }
    catch (err) {
        res.status(500).json({ message: "Error logging in User", error: err.message })
    }
}

exports.googleAuth = async (req, res) => {
    console.log("Inside Google Login User");
    const { email, password, username, profile, role } = req.body
    try {
        const existingUser = await Users.findOne({ email })
        if (existingUser) {

            const token = jwt.sign({ id: existingUser._id, role: existingUser.role }, process.env.jwtKey)
            console.log(token);
            res.status(200).json({ message: "Login Successful", user: existingUser, token })
        }
        else {

            const newUser = new Users({ email, password, username, profile, role });
            await newUser.save();


            const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.jwtKey)
            console.log(token);
            res.status(200).json({ message: "Login Successful", user: newUser, token }) 
        }
    }
    catch (err) {
        res.status(500).json({ message: "Error logging in User", error: err.message })
    }

}



// GET ALL USERS (Admin)
exports.getAllUsers = async (req, res) => {
    console.log(req.query);
    const searchKey = req.query.search || ""

    try {
        const users = await Users.find({
            role: "User",
            username: {
                $regex: searchKey,
                $options: "i"
            }
        }).select('-password');
        res.status(200).json(users);

    } catch (err) {
        res.status(500).json(err);
    }
};

// GET SINGLE USER (Admin)
exports.getUserById = async (req, res) => {
    try {
        const user = await Users.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
};

//GET All Users - Admin-side
exports.getAllFarmers = async (req, res) => {
    console.log(req.query);
    const searchKey = req.query.search || ""

    try {
        const users = await Users.find({
            role: "Farmer", username: {
                $regex: searchKey,
                $options: "i"
            }
        }).select('-password');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err);
    }
};


