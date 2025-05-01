const express = require("express");
const router = express.Router();
const getLSTMPredictions = require("../utilities/ml_requester");
const Prediction = require("../models/Prediction");

router.get("/predict", async (req, res) => {
  // Session-based authentication check
  if (!req.session.user || !req.session.user._id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { ticker } = req.query;
  if (!ticker) {
    return res.status(400).json({ error: "Ticker is required" });
  }

  try {
    const result = await getLSTMPredictions(ticker);
    if (!result) {
      return res.status(500).json({ error: "Prediction failed" });
    }

    console.log("Inserting prediction:", {
      userId: req.session.user._id,
      ticker,
      futurePrices: result.future,
      finalPrice: result.future[result.future.length - 1]
    });

    
    // Save prediction to MongoDB
    await Prediction.create({
      userId: req.session.user._id,
      ticker,
      generatedAt: new Date(),
      futurePrices: result.future,
      finalPrice: result.future[result.future.length - 1],
    });

    return res.json(result);
  } catch (err) {
    console.error("Prediction route error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
