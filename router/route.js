//1.import express
const express = require('express')

//4.import controller
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const messageController = require('../controllers/messageController');

//import middlewares
const jwtMiddleware = require('../middlewares/jwtMiddleware')
const multerMiddleware = require('../middlewares/multerMiddleware')

//2.create Router
const router = express.Router();

//3.define routes
//Register User
router.post('/api/register', userController.registerUser)

//Login User
router.post('/api/login', userController.loginUser)

//Google Login User
router.post('/api/google-login', userController.googleAuth)


// Add Product (Farmer)
router.post('/api/farmer/add-product', jwtMiddleware, multerMiddleware.array('images', 1), productController.addProduct);

// DELETE PRODUCT (Farmer)
router.delete("/api/farmer/delete-product/:id", jwtMiddleware, productController.deleteProduct);

//All Products (Farmer)
router.get('/api/farmer/my-products', jwtMiddleware, productController.getFarmerProducts);

//Approved Products by Admin
router.get('/api/farmer/approved-products', productController.getApprovedProducts);

//All Users (Admin)
router.get('/api/admin/users', jwtMiddleware, userController.getAllUsers);

//All Farmers (Admin)
router.get('/api/admin/farmers', jwtMiddleware, userController.getAllFarmers);

//Each User (Admin)
router.get("/api/admin/user/:id", jwtMiddleware, userController.getUserById);

//Each Farmer (Admin)
router.get("/api/admin/farmer/:id", jwtMiddleware, userController.getUserById);

// Get all products
router.get('/api/admin/products', jwtMiddleware, productController.getAllProducts);

// Approve product
router.patch('/api/admin/approve-product/:id', jwtMiddleware, productController.approveProduct);

//GET All Approved Products
router.get("/api/products/approved", productController.getApprovedProducts);

//GET Approved Products (Farmer)
router.get("/api/farmer/approved-products", jwtMiddleware, productController.getApprovedFarmerProducts);

// Decline product
router.patch('/api/admin/decline-product/:id', jwtMiddleware, productController.declineProduct);

//Payment-history
router.get("/api/user/payment-history", jwtMiddleware, productController.getUserWonProducts);

//Auction end
// router.post("/api/auction/end", jwtMiddleware, productController.endAuction);

router.put("/api/makePayment", productController.makePayment);

// Messages
router.get("/api/messages/:userId/:otherId", jwtMiddleware, messageController.getMessages);
router.get("/api/messages/all/:id", jwtMiddleware, messageController.getUserMessages);

//5.export router
module.exports = router;