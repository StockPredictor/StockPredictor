// In utilities/ml_requester.js
const axios = require("axios");

async function getLSTMPredictions(ticker) {
  try {
    const response = await axios.get(`http://localhost:5001/predict?ticker=${ticker}`);
    return response.data;
  } catch (error) {
    console.error("LSTM API Error:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Status code:", error.response.status);
    }
    return null;
  }
}

module.exports = getLSTMPredictions;
