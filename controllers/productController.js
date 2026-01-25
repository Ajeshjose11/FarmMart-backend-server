const Products = require('../models/productModel');

exports.addProduct = async (req, res) => {
  const { category, name, basePrice, pickupOption, qty } = req.body;
  const images = req.files?.map(file => file.filename) || [];

  const farmerID = req.userId;

  try {
    const newProduct = new Products({
      farmerID,
      category,
      name,
      basePrice,
      pickupOption,
      qty,
      images,
      status: "pending"
    });

    await newProduct.save();

    return res.status(201).json({ message: "Product submitted for approval", product: newProduct });
  }
  catch (err) {
    return res.status(500).json({ message: "Error adding product", error: err.message });
  }
};

// DELETE PRODUCT (Farmer)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Products.findOne({
      _id: req.params.id,
      farmerID: req.userId
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Products.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Get Farmer Products
exports.getFarmerProducts = async (req, res) => {
  try {
    const products = await Products.find({ farmerID: req.userId });
    return res.status(200).json(products);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Approve or Decline Product (Admin)
exports.updateProductStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; 

  try {
    const updated = await Products.findByIdAndUpdate(id, { status }, { new: true });

    return res.status(200).json({
      message: `Product ${status}`,
      product: updated
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// GET ALL PRODUCTS (Admin)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Products.find().sort({ createdAt: -1 }).populate("farmerID", "username");
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
};

// APPROVE PRODUCT
exports.approveProduct = async (req, res) => {
  try {
    await Products.findByIdAndUpdate(req.params.id, {
      status: 'approved'
    });
    res.status(200).json({ message: 'Product approved' });
  } catch (err) {
    res.status(500).json(err);
  }
};


exports.getApprovedProducts = async (req, res) => {
  try {
    const products = await Products.find({
      status: "approved",
    })
      .sort({ createdAt: -1 })
      .populate("farmerID", "username");

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching approved products",
      error: err.message,
    });
  }
};

// GET Approved Products (Farmer)
exports.getApprovedFarmerProducts = async (req, res) => {
  try {
    const products = await Products.find({
      farmerID: req.userId,
      status: "approved",
    })
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// DECLINE PRODUCT
exports.declineProduct = async (req, res) => {
  try {
    await Products.findByIdAndUpdate(req.params.id, {
      status: 'declined'
    });
    res.status(200).json({ message: 'Product declined' });
  } catch (err) {
    res.status(500).json(err);
  }
};


exports.getUserWonProducts = async (req, res) => {
  try {
    const products = await Products.find({
      winner: req.userId,
      auctionStatus: "ended",
      status: "approved"
    }).sort({ updatedAt: -1 });

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
};

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.makePayment = async (req, res) => {
  const { productId } = req.body;

  try {
    const product = await Products.findByIdAndUpdate(productId, {
      paymentStatus: "COMPLETED",
      paymentDate: new Date(),
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      success_url: 'http://localhost:5173/payment-success',
      cancel_url: 'http://localhost:5173/payment-error',

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: product.name,
              description: `Quantity: ${product.qty || "1 Unit"}`,
            },
            unit_amount: product.currentBid * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
    });

    res.status(200).json({
      message: "Payment successful",
      sessionId: session.id,
      url: session.url,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




// exports.endAuction = async (req, res) => {
//   const { productId, winnerId, finalBid } = req.body;

//   try {
//     const product = await Products.findByIdAndUpdate(
//       productId,
//       {
//         auctionStatus: "ended",
//         winner: winnerId,
//         highestBidder: winnerId,
//         currentBid: finalBid,
//         paymentStatus: "PENDING",
//       },
//       { new: true }
//     );

//     res.status(200).json({
//       message: "Auction ended successfully",
//       product,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

