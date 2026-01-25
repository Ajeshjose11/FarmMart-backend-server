const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  farmerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  category: {
    type: String,
    enum: ['Vegetables', 'Fruits', 'Spices', 'Other Items'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  qty: {
    type: String,
    required: true,
    default: "1 Kg"
  },
  description: {
    type: String,
    default: ""
  },
  basePrice: {
    type: Number,
    required: true
  },
  pickupOption: {
    type: String,
    enum: ['Pickup', 'Delivery'],
    required: true
  },
  images: {
    type: [String],
    default: []
  },
  currentBid: {
    type: Number,
    default: 0
  },
  highestBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    default: null
  },
  bidsHistory: [
    {
      bidderID: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
      amount: Number,
      time: { type: Date, default: Date.now }
    }
  ],
  auctionStatus: {
    type: String,
    enum: ['active', 'ended'],
    default: 'active'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined'],
    default: 'pending'
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    default: null
  },
  paymentStatus: {
    type: String,
    enum: ["PENDING", "COMPLETED", "INCOMPLETE"],
    default: "PENDING"
  },

  paymentDate: Date
}, 
{
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
