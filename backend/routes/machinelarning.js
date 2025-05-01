const express = require("express");
const router = express.Router();
const getLSTMPredictions = require("../utilities/ml_requester");

router.get("/predict", async (req, res) => {
  const { ticker } = req.query;
  if (!ticker) {
    return res.status(400).json({ error: "Ticker is required" });
  }

  try {
    const result = await getLSTMPredictions(ticker);
    if (!result) {
      return res.status(500).json({ error: "Prediction failed" });
    }

    return res.json(result);
  } catch (err) {
    console.error("Prediction route error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
