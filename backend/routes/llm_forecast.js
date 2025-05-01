// routes/llm_forecast.js
const express = require("express");
const OpenAI = require("openai");
const dotenv = require("dotenv");

dotenv.config();
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/llm-forecast", async (req, res) => {
  const { ticker, future } = req.body;
  if (!ticker || !future || !Array.isArray(future)) {
    return res.status(400).json({ error: "Missing or invalid 'ticker' or 'future' array." });
  }

  const promptText = `You're a financial analyst with access to real-time news and data.
The LSTM model predicts the stock price for ${ticker} over the next year starting at around $${future[0].toFixed(2)}.
Here is a 30-day sample of the forecast:\n${JSON.stringify(future.slice(0, 30))}

Based on this, your job is to:
1. Evaluate current financial and macroeconomic trends that may affect this stock (e.g., inflation, interest rates, competition, recent news, regulations).
2. Provide a detailed, human-readable analysis of where the stock market and this specific stock might be headed over the next 12 months.
3. Give a revised prediction of the stock's **expected price in one year**, backed by your research and reasoning.
Make your output useful for an investor wondering whether to buy this stock or not. Format the final number clearly as: 
Final Prediction: $[value]`;

  try {
    const response = await openai.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "You're a financial analyst with access to current news.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: promptText,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "text",
        },
      },
      reasoning: {},
      tools: [
        {
          type: "web_search_preview",
          user_location: {
            type: "approximate",
            country: "US",
          },
          search_context_size: "high",
        },
      ],
      temperature: 1,
      max_output_tokens: 15000,
      top_p: 1,
      store: true,
    });
    
    const output = response.output_text || "No output received.";
    console.log("LLM Analysis:\n", output);
    return res.json({
      reasoning: output,
    });

  } catch (err) {
    console.error("OpenAI API error:", err.message);
    return res.status(500).json({ error: "Failed to get LLM forecast." });
  }
});

module.exports = router;
