require('dotenv').config();
const express = require('express');

//2. Import DB
const db = require('./config/db');

//3. Import cors
const cors = require('cors');

//4. Import router
const router = require('./router/route');

const http = require("http");
const { Server } = require("socket.io");

//5. Import Product model for DB updates
const Product = require("./models/productModel");

//5. Import User model for DB updates
const Users = require("./models/userModel");

//6. Create express app
const farmmartServer = express();

//7. Middlewares
farmmartServer.use(
  cors({
    origin: ["http://localhost:5173", "https://farm-mart-frontend.vercel.app"],
    credentials: true
  })
);

farmmartServer.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

farmmartServer.use(express.json());

farmmartServer.get("/", (req, res) => {
  res.status(200).send("FarmMart API is running");
});
// Serve static product images
farmmartServer.use('/uploads/products', express.static('./uploads/products'));

//8. Attach router
farmmartServer.use(router);

//9. Port
const PORT = process.env.PORT || 3000;

//10. Create HTTP server for Socket.IO use
const server = http.createServer(farmmartServer);

//11. Attach Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://farm-mart-frontend.vercel.app"]
  }
});


io.on("connection", (socket) => {
  console.log("User connected:", socket.id);


  socket.on("joinRoom", (productId) => {
    socket.join(productId);
    console.log(`User ${socket.id} joined room: ${productId}`);
  });

  socket.on("placeBid", async (data) => {
    console.log("New Bid:", data);

    try {
      const { productId, amount, bidderId, bidderName } = data;

      await Product.findByIdAndUpdate(productId, {
        currentBid: amount,
        highestBidder: bidderId,
        $push: {
          bidsHistory: {
            bidderID: bidderId,
            amount: amount,
            time: new Date()
          }
        }
      });

      io.to(productId).emit("bidUpdated", {
        productId,
        amount,
        bidderName
      });

    } catch (err) {
      console.log("DB Update Error:", err.message);
    }
  });

  socket.on("registerUser", (userId) => {
    socket.userId = userId;
  });

  socket.on("joinUserRoom", (userId) => {
    socket.join(userId);
    console.log(`Socket ${socket.id} joined user room ${userId}`);
  });

  const Message = require("./models/messageModel");

  // ... (other imports are fine, just make sure Message is top level or imported before use)
  // Wait, I can't put require in the middle easily with replace_file_content relative to line numbers if I don't see them. 
  // I'll add the require at the top first in a separate call? 
  // No, I can just use require inside the callback or at top if I match correctly.
  // Let's add the require at line 21 (after userModel).

  // Then replace the socket handler.


  socket.on("sendMessage", async ({ roomId, sender, message, userId, farmerId, senderId, receiverId, role }) => {

    // Attempt to resolve IDs for persistence
    let sId = senderId;
    let rId = receiverId;
    let rRole = null; // Receiver Role

    // INFER SENDER ID
    if (!sId) {
      if (sender === "User") sId = userId;
      if (sender === "Farmer") sId = farmerId;
    }

    // INFER RECEIVER ID & ROLE
    // Case 1: User/Farmer sending to Admin
    if (sender === "User" || sender === "Farmer") {
      if (!rId) rId = roomId; // Default receiver is AdminID (room)
      rRole = "Admin";
    }

    // Case 2: Admin replying
    if (sender === "Admin") {
      if (!rId) {
        // Try to infer from context if not explicitly sent
        if (userId) { rId = userId; rRole = "User"; }
        else if (farmerId) { rId = farmerId; rRole = "Farmer"; }
      } else {
        // If explicit rId, try to guess role or usepassed role?
        // For now, if we are in adminUserMessages, we are talking to User.
        // If in adminFarmerMessages, we are talking to Farmer.
        // But socket payload might not have rRole.
        // Let's rely on the client sending correct IDs.
        // Simplistic heuristic:
        // Ideally we should pass receiverRole from client.
      }
    }

    // Fallback/Validation from client payload if available
    // We update client to send receiverRole if possible, or infer stronger here.
    // For now, let's look at the "User" vs "Farmer" logic in the Room ID or passed params.

    // BETTER LOGIC:
    // If Admin sends to a User, the room ID is usually the UserID.
    // If Admin sends to a Farmer, the room ID is the FarmerID.

    // If sender is Admin:
    if (sender === "Admin") {
      if (farmerId) { rRole = "Farmer"; rId = farmerId; }
      else if (userId) { rRole = "User"; rId = userId; }
    }


    if (sId && rId) {
      try {
        const newMsg = new Message({
          senderId: sId,
          receiverId: rId,
          senderRole: sender,
          receiverRole: rRole,
          message,
          roomId
        });
        await newMsg.save();
      } catch (e) {
        console.error("Error saving message:", e.message);
      }
    }

    io.to(roomId).emit("receiveMessage", {
      sender,
      message,
      userId,
      farmerId,
      time: new Date(),
    });
    console.log("MSG:", roomId, sender, userId, farmerId, rRole);
  });



  socket.on("disconnect", async () => {

    console.log("Disconnected:", socket.id);
  });
});

//13. Start Server
server.listen(PORT, () => {
  console.log(`FarmMart Server running on http://localhost:${PORT}`);
});
