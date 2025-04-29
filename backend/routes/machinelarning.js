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
    console.log("X", X.length); // Check input data
    const Y = history.map(entry => [entry.close]); // Predict close

    const MLR = require('ml-regression-multivariate-linear'); 
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
      const predictedClose = regression.predict(lastInput)[0];
      futurePrices.push(predictedClose);

      const nextOpen = predictedClose;
      const nextHigh = predictedClose * 1.01;
      const nextLow = predictedClose * 0.99;
      const nextVolume = lastInput[3] * (1 + (Math.random() * 0.02 - 0.01));

      lastInput = [nextOpen, nextHigh, nextLow, nextVolume];
    }

    // NEW: Generate date arrays
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    // Generate actualDates from history itself
    const actualDates = history.map(entry => {
      const date = new Date(entry.date || entry.timestamp);
      return date.toISOString().split('T')[0];
    });

    // Generate futureDates based off today
    const futureDates = [];
    const lastActualDate = new Date();
    for (let i = 1; i <= futurePrices.length; i++) {
      const futureDate = new Date(lastActualDate);
      futureDate.setDate(lastActualDate.getDate() + i);
      futureDates.push(futureDate.toISOString().split('T')[0]);
    }


    const currentPrice = history[history.length - 1].close;
    const finalPredictedPrice = futurePrices[futurePrices.length - 1];
    const predictionTrend = finalPredictedPrice > currentPrice ? "rise" : "fall";

    // Respond
    res.json({
      actual: history.map(entry => entry.close),
      actualDates: actualDates, 
      future: futurePrices,
      futureDates: futureDates, // Works now after proper formatting :)
      trend: predictionTrend
    });
  } catch (error) {
    console.error("Error in prediction route:", error.message);
    res.status(500).json({ error: "Failed to process prediction" });
  }
});


module.exports = router;
