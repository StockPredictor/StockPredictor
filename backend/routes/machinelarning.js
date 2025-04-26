const express = require("express");
const router = express.Router();
const axios = require("axios");
const MLR = require('ml-regression-multivariate-linear'); // NEW library
require("dotenv").config();

router.get("/predict", async (req, res) => {
  const { ticker } = req.query;
  if (!ticker) {
    return res.status(400).json({ error: "Missing ticker query parameter" });
  }

  try {
    // Fetch history from your own /history route
    const historyResponse = await axios.get(`http://localhost:3000/api/history?ticker=${ticker.toUpperCase()}`);
    const history = historyResponse.data;

    if (!Array.isArray(history) || history.length === 0) {
      return res.status(404).json({ error: "No historical data found for prediction" });
    }

    // Prepare training data
    const X = history.map(entry => [entry.open, entry.high, entry.low, entry.volume]);
    const Y = history.map(entry => [entry.close]); // Predict close

    // Train the multivariate linear regression model
    const regression = new MLR(X, Y);

    // Predict next 126 trading days
    const futurePrices = [];
    let lastInput = [
    history[history.length - 1].open,
    history[history.length - 1].high,
    history[history.length - 1].low,
    history[history.length - 1].volume
    ];

    for (let i = 0; i < 126; i++) {
    // Predict next day's close price based on current input
    const predictedClose = regression.predict(lastInput)[0];
    futurePrices.push(predictedClose);

    // Update the inputs for next day simulation
    // Assume:
    // - Next day's open is previous day's close
    // - High/Low are adjusted slightly based on previous patterns
    // - Volume stays roughly similar or can also slightly decay

    const nextOpen = predictedClose;
    const nextHigh = predictedClose * 1.01; // Assume 1% higher swing
    const nextLow = predictedClose * 0.99;  // Assume 1% lower swing
    const nextVolume = lastInput[3] * (1 + (Math.random() * 0.02 - 0.01)); // Volume changes randomly ±1%

    lastInput = [nextOpen, nextHigh, nextLow, nextVolume];
    }

    const currentPrice = history[history.length - 1].close;
    const finalPredictedPrice = futurePrices[futurePrices.length - 1];
    const predictionTrend = finalPredictedPrice > currentPrice ? "rise" : "fall";

    // Respond
    res.json({
      actual: history.map(entry => entry.close),
      future: futurePrices,
      trend: predictionTrend
    });
  } catch (error) {
    console.error("Error in prediction route:", error.message);
    res.status(500).json({ error: "Failed to process prediction" });
  }
});

module.exports = router;
