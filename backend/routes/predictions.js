const express = require("express");
const router = express.Router();
const Prediction = require("../models/Prediction");

router.get("/predictions", async (req, res) => {
    const userId = req.session.user._id;
    const predictions = await Prediction.find({ userId }).sort({ generatedAt: -1 });
    res.json(predictions);
  });
  
module.exports = router;