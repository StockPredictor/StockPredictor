const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();

const polygonKey = process.env.POLYGON_API_KEY;
const baseURL = "https://api.polygon.io";

// Helper function: Fetch one year of historical data for a stock
async function fetchOneYearAggregateHistory(ticker) {
  const today = new Date();
  const lastYear = new Date();
  lastYear.setFullYear(today.getFullYear() - 1);

  const from = lastYear.toISOString().split("T")[0]; // YYYY-MM-DD
  const to = today.toISOString().split("T")[0];

  const url = `${baseURL}/v2/aggs/ticker/${ticker}/range/1/day/${from}/${to}?adjusted=true&sort=asc&limit=365&apiKey=${polygonKey}`;

  try {
    const response = await axios.get(url);

    if (!response.data.results || response.data.results.length === 0) {
      console.error(`No historical data found for ${ticker}`);
      return [];
    }

    const stockHistory = response.data.results.map(day => ({
      open: day.o,
      close: day.c,
      high: day.h,
      low: day.l,
      volume: day.v,
      date: new Date(day.t).toISOString().split('T')[0]
    }));

    return stockHistory;

  } catch (error) {
    console.error(`Error fetching historical data for ${ticker}:`, error.response?.data || error.message);
    return [];
  }
}

// API Route: GET /api/history?ticker=AAPL
router.get("/history", async (req, res) => {
  const { ticker } = req.query;

  if (!ticker) {
    return res.status(400).json({ error: "Missing ticker query parameter" });
  }

  const history = await fetchOneYearAggregateHistory(ticker.toUpperCase());

  if (history.length === 0) {
    return res.status(404).json({ error: "No historical data found" });
  }

  res.json(history);
});

module.exports = router;
