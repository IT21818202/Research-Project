from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
import os

app = Flask(__name__)
CORS(app, resources={r"/predict_disruption": {"origins": "*"}})

# Load model and encoder
MODEL_PATH = os.path.join("model", "event_disruption_model.pkl")
ENCODER_PATH = os.path.join("model", "location_encoder.pkl")

try:
    model = joblib.load(MODEL_PATH)
    location_encoder = joblib.load(ENCODER_PATH)
except Exception as e:
    print("Model loading failed:", e)
    model = None
    location_encoder = None

# Your OpenWeatherMap API key here
API_KEY = "a8927c216016b945b6ef3d9329f0cd0c"

def get_time_of_day():
    hour = datetime.now().hour
    if 5 <= hour < 12:
        return "morning"
    elif 12 <= hour < 17:
        return "afternoon"
    elif 17 <= hour < 20:
        return "evening"
    else:
        return "night"

def fetch_weather(lat, lon):
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    res = requests.get(url)
    if res.status_code != 200:
        print("Weather API error:", res.text)
        return None
    data = res.json()
    temp = data["main"]["temp"]
    humidity = data["main"]["humidity"]
    wind_speed = data["wind"]["speed"]
    rainfall = data.get("rain", {}).get("1h", 0.0)
    return temp, humidity, wind_speed, rainfall

@app.route("/predict_disruption", methods=["POST", "OPTIONS"])
def predict_disruption():
    if request.method == "OPTIONS":
        return '', 200

    if model is None or location_encoder is None:
        return jsonify({"error": "Model not loaded"}), 500

    data = request.get_json()
    lat = data.get("latitude")
    lon = data.get("longitude")

    if lat is None or lon is None:
        return jsonify({"error": "Missing coordinates"}), 400

    weather = fetch_weather(lat, lon)
    if weather is None:
        return jsonify({"error": "Weather API failed"}), 500

    temp, humidity, wind_speed, rainfall = weather
    crowd_density = round(np.random.uniform(0.5, 5.5), 2)
    time_of_day = get_time_of_day()

    time_map = {"morning": 0, "afternoon": 1, "evening": 2, "night": 3}
    time_encoded = time_map[time_of_day]

    try:
        loc_encoded = location_encoder.transform(["Colombo"])[0]
    except:
        loc_encoded = -1

    X = pd.DataFrame([{
        "temperature": temp,
        "humidity": humidity,
        "wind_speed": wind_speed,
        "rainfall": rainfall,
        "crowd_density": crowd_density,
        "time_of_day_encoded": time_encoded,
        "location_encoded": loc_encoded
    }])

    prediction = model.predict(X)[0]
    prob = model.predict_proba(X)[0][1]

    return jsonify({
        "risk": "High" if prediction == 1 else "Low",
        "probability": round(prob * 100, 2),
        "latitude": lat,
        "longitude": lon
    })

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
