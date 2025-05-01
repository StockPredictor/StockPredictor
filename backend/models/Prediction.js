const mongoose = require("mongoose");

const PredictionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ticker: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  futurePrices: {
    type: [Number],
    required: true,
  },
  finalPrice: {
    type: Number,
    required: true,
  }
});

module.exports = mongoose.model("Prediction", PredictionSchema);
