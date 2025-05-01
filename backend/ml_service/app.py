from flask import Flask, request, jsonify
import xgboost as xgb
import pandas as pd
import numpy as np
import requests
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from sklearn.preprocessing import MinMaxScaler  
from keras.layers import LSTM, Dense
from keras.models import Sequential

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configuration
POLYGON_API_KEY = os.getenv("POLYGON_API_KEY")
BASE_URL = "https://api.polygon.io"


# ===== Helper: Fetch Polygon 1-Year History =====
def fetch_one_year_history(ticker):
    today = datetime.now()
    one_year_ago = today - timedelta(days=365)
    from_date = one_year_ago.strftime("%Y-%m-%d")
    to_date = today.strftime("%Y-%m-%d")

    url = f"{BASE_URL}/v2/aggs/ticker/{ticker}/range/1/day/{from_date}/{to_date}?adjusted=true&sort=asc&limit=365&apiKey={POLYGON_API_KEY}"

    try:
        response = requests.get(url)
        data = response.json()
        if "results" not in data or not data["results"]:
            return []

        return [{
            "open": d["o"],
            "close": d["c"],
            "high": d["h"],
            "low": d["l"],
            "volume": d["v"],
            "date": datetime.fromtimestamp(d["t"] / 1000).strftime("%Y-%m-%d")
        } for d in data["results"]]

    except Exception as e:
        print(f"[ERROR fetching history for {ticker}]: {e}")
        return []


# ===== GET /history =====
@app.route("/history", methods=["GET"])
def get_history():
    ticker = request.args.get("ticker", "").upper()
    if not ticker:
        return jsonify({"error": "Missing ticker query parameter"}), 400

    history = fetch_one_year_history(ticker)
    if not history:
        return jsonify({"error": "No historical data found"}), 404

    return jsonify(history)


# ===== POST /predict (pass history JSON) =====
@app.route("/predict", methods=["POST"])
def predict_from_history():
    data = request.json.get("history", [])
    if not data:
        return jsonify({"error": "No data provided"}), 400
    return run_prediction_pipeline(data)


# ===== GET /predict?ticker=AAPL (automatic flow) =====
@app.route("/predict", methods=["GET"])
def predict_from_ticker():
    ticker = request.args.get("ticker", "").upper()
    if not ticker:
        return jsonify({"error": "Missing ticker query parameter"}), 400

    history = fetch_one_year_history(ticker)
    if not history:
        return jsonify({"error": "No data available for ticker"}), 404

    return run_prediction_pipeline(history)


# ===== Core Prediction Pipeline =====
def run_prediction_pipeline(history_data):
    # Build DataFrame and extract date column
    df = pd.DataFrame(history_data)
    df["date"] = pd.to_datetime(df["date"])
    df.sort_values("date", inplace=True)

    actual = df["close"].tolist()
    actual_dates = df["date"].dt.strftime("%Y-%m-%d").tolist()

    # Retain date while separating features
    features = ["open", "high", "low", "volume", "close"]
    df_features = df[features]

    # Scale only features
    scaler = MinMaxScaler()
    scaled_data = scaler.fit_transform(df_features)


    sequence_length = 25
    X = []
    y = []
    for i in range(sequence_length, len(scaled_data)):
        X.append(scaled_data[i-sequence_length:i])
        y.append(scaled_data[i, 4])  # Close price is the target

    X, y = np.array(X), np.array(y)

    # LSTM Model
    model = Sequential()
    model.add(LSTM(50, return_sequences=True, input_shape=(X.shape[1], X.shape[2])))
    model.add(LSTM(50))
    model.add(Dense(1))
    model.compile(optimizer='adam', loss='mse')
    model.fit(X, y, epochs=20, batch_size=16, verbose=0)

    # Begin future prediction
    future = []
    last_window = scaled_data[-sequence_length:]

    for _ in range(356):
        input_seq = np.expand_dims(last_window, axis=0)
        predicted_scaled = model.predict(input_seq, verbose=0)[0][0]

        # Create next day scaled input
        next_row = np.copy(last_window[-1])
        next_row[0] = next_row[4]  # open = previous close
        next_row[1] = max(next_row[1], predicted_scaled)  # high
        next_row[2] = min(next_row[2], predicted_scaled)  # low
        next_row[3] *= 0.99  # decay volume
        next_row[4] = predicted_scaled  # close = prediction

        future.append(predicted_scaled)
        last_window = np.append(last_window[1:], [next_row], axis=0)

    # Inverse transform for real values
    full_close = np.concatenate([scaled_data[:, 4], np.array(future)])
    dummy_full = np.tile(scaled_data[-1], (len(full_close), 1))
    dummy_full[:, 4] = full_close  # only close changes
    inverse_full = scaler.inverse_transform(dummy_full)
    future_close = inverse_full[-356:, 4]

    trend = "rise" if future_close[-1] > actual[-1] else "fall"

    return jsonify({
        "actual": actual,
        "actualDates": actual_dates,
        "future": future_close.tolist(),
        "futureDates": [(df["date"].max() + timedelta(days=i+1)).strftime("%Y-%m-%d") for i in range(356)],
        "trend": trend
    })


# ===== Server Start =====
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
