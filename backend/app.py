from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import joblib
import requests
import numpy as np
import cv2
from tensorflow.keras.models import load_model
from tensorflow.keras.losses import MeanSquaredError
import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# --- Flask and SocketIO setup ---
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# === Twilio Configuration ===
from twilio.rest import Client

TWILIO_ACCOUNT_SID = "//ACeedb20c2775832a07d27e02693066787"
TWILIO_AUTH_TOKEN = "5c27d300871d13ebb0a9e974e3b201be"
TWILIO_PHONE_NUMBER = "+19378284953"  # Twilio sender number
ALERT_RECIPIENT_NUMBER = "+94705388035"  # Your phone number (Sri Lanka format)

# === SMTP Configuration ===
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "bobhesha@gmail.com"  # Your Gmail address
SMTP_PASS = "Lahiru100##"  # Use App Password here
EMAIL_TO = "heshanidilanga11@gmail.com"  # Recipient

def send_sms(body):
    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=body,
            from_=TWILIO_PHONE_NUMBER,
            to=ALERT_RECIPIENT_NUMBER
        )
        print(f"✅ SMS sent successfully: SID={message.sid}")
        return True
    except Exception as e:
        print(f"❌ Error sending SMS: {e}")
        return False

def send_email(subject, body):
    try:
        msg = MIMEMultipart()
        msg["From"] = SMTP_USER
        msg["To"] = EMAIL_TO
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)
        server.quit()
        print("✅ Email sent successfully")
        return True
    except Exception as e:
        print(f"❌ Error sending email: {e}")
        return False

# ------------------ In-Memory Alert Store ------------------ #
alerts = []

@app.route("/api/alerts", methods=["GET"])
def get_alerts():
    return jsonify(alerts)

@app.route("/api/alerts", methods=["POST"])
def post_alert():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid alert data"}), 400

    alert = {
        "zone": data.get("zone", "Unknown Zone"),
        "risk": data.get("risk", "Unknown"),
        "message": data.get("message", ""),
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
    alerts.append(alert)
    socketio.emit("new_alert", alert)

    subject = f"New Alert: {alert['risk']} risk in {alert['zone']}"
    body = (
        f"Alert Details:\n\nZone: {alert['zone']}\nRisk Level: {alert['risk']}\n"
        f"Message: {alert['message']}\nTimestamp: {alert['timestamp']}"
    )
    send_email(subject, body)
    send_sms(body)

    return jsonify({"message": "Alert added successfully", "alert": alert})

# ------------------ Disruption Risk Prediction Models ------------------ #
# Model 1: realistic_disruption_model.pkl (with scaler and label encoder)
model1 = joblib.load("model/realistic_disruption_model.pkl")
X_train, X_test, y_train, y_test, scaler, label_encoder = joblib.load("model/realistic_preprocessed_data.pkl")

# Model 2: event_disruption_model.pkl + label_encoder.pkl
model2 = joblib.load("model/new_event_disruption_model.pkl")
label_encoder2 = joblib.load("model/label_encoder.pkl")

# ------------------ Weather API Setup ------------------ #
OPENWEATHER_API_KEY = "a8927c216016b945b6ef3d9329f0cd0c"

# City name to coordinates mapping (merged from second app)
CITIES = {
    "Colombo": (6.9271, 79.8612),
    "Kandy": (7.2906, 80.6337),
    "Jaffna": (9.6615, 80.0255),
    "Galle": (6.0535, 80.2210),
    "Trincomalee": (8.5874, 81.2152),
    "Hatton": (6.8910, 80.5937),
    "Negombo": (7.2083, 79.8358),
    "Nuwara Eliya": (6.9707, 80.7820),
    "Anuradhapura": (8.3114, 80.4037),
    "Batticaloa": (7.7102, 81.6924),
    "Matara": (5.9485, 80.5353),
    "Polonnaruwa": (7.9391, 81.0036),
    "Ratnapura": (6.6828, 80.3992),
    "Dambulla": (7.8569, 80.6517),
    "Badulla": (6.9895, 81.0550),
    "Malabe": (6.9147, 79.9719),
    "Galle": (6.0535, 80.2210),
    "Negombo": (7.2083, 79.8358),
    "Trincomalee": (8.5874, 81.2152),
    "Nuwara Eliya": (6.9707, 80.7820),
    "Anuradhapura": (8.3114, 80.4037),
    "Batticaloa": (7.7102, 81.6924),
    "Matara": (5.9485, 80.5353),
    "Polonnaruwa": (7.9391, 81.0036),
    "Ratnapura": (6.6828, 80.3992),
    "Dambulla": (7.8569, 80.6517),
    "Badulla": (6.9895, 81.0550)
}

def fetch_weather(lat, lon):
    url = (
        f"https://api.openweathermap.org/data/2.5/weather?"
        f"lat={lat}&lon={lon}&units=metric&appid={OPENWEATHER_API_KEY}"
    )
    resp = requests.get(url)
    if resp.status_code != 200:
        return None
    data = resp.json()
    weather_data = {
        "temperature_2m_max": data["main"]["temp_max"],
        "temperature_2m_min": data["main"]["temp_min"],
        "precipitation_sum": data.get("rain", {}).get("1h", 0),
        "windspeed_10m_max": data["wind"]["speed"] * 3.6,  # m/s to km/h
        "clouds": {"all": data.get("clouds", {}).get("all", 0)},
        "weather_main": data["weather"][0]["main"] if "weather" in data and len(data["weather"]) > 0 else "",
    }
    return weather_data

@app.route("/weather/<city>")
def get_weather_by_city(city):
    city_key = city.replace("%20", " ").title()
    if city_key not in CITIES:
        return jsonify({"error": "City not found"}), 404

    lat, lon = CITIES[city_key]
    weather_data = fetch_weather(lat, lon)
    if not weather_data:
        return jsonify({"error": "Failed to fetch weather data"}), 500
    return jsonify(weather_data)

@app.route("/weather/coordinates")
def get_weather_by_coordinates():
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    if not lat or not lon:
        return jsonify({"error": "Missing lat or lon parameter"}), 400

    try:
        lat_f = float(lat)
        lon_f = float(lon)
    except ValueError:
        return jsonify({"error": "Invalid lat or lon value"}), 400

    weather_data = fetch_weather(lat_f, lon_f)
    if not weather_data:
        return jsonify({"error": "Failed to fetch weather data"}), 500
    return jsonify(weather_data)

# ------------------ NLP Query (from first app) ------------------ #
SUPPORTED_CITIES_LOWER = {k.lower(): k for k in CITIES.keys()}

# Dummy emergency contact data
EMERGENCY_INFO = {
    "colombo": {
        "fire": "Colombo Fire Service - 0112 345 678",
        "police": "Colombo Police - 0112 456 789",
        "hospital": "Colombo General Hospital - 0112 987 654",
    },
    "kandy": {
        "fire": "Kandy Fire Brigade - 0812 123 456",
        "police": "Kandy Police - 0812 234 567",
        "hospital": "Kandy General Hospital - 0812 876 543",
    },
    "jaffna": {
        "fire": "Jaffna Fire Station - 0212 345 678",
        "police": "Jaffna Police - 0212 456 789",
        "hospital": "Jaffna Teaching Hospital - 0212 987 654",
    },
    "galle": {
        "fire": "Galle Fire Brigade - 0912 345 678",
        "police": "Galle Police - 0912 456 789",
        "hospital": "Karapitiya Teaching Hospital - 0912 987 654",
    },
    "trincomalee": {
        "fire": "Trincomalee Fire Station - 0262 345 678",
        "police": "Trincomalee Police - 0262 456 789",
        "hospital": "Trincomalee General Hospital - 0262 987 654",
    },
    "hatton": {
        "fire": "Hatton Fire Station - 0512 345 678",
        "police": "Hatton Police - 0512 456 789",
        "hospital": "Dickoya Base Hospital - 0512 987 654",
    },
    "negombo": {
        "fire": "Negombo Fire Brigade - 0312 345 678",
        "police": "Negombo Police - 0312 456 789",
        "hospital": "Negombo General Hospital - 0312 987 654",
    },
    "nuwara eliya": {
        "fire": "Nuwara Eliya Fire Station - 0522 345 678",
        "police": "Nuwara Eliya Police - 0522 456 789",
        "hospital": "Nuwara Eliya General Hospital - 0522 987 654",
    },
    "anuradhapura": {
        "fire": "Anuradhapura Fire Brigade - 0252 345 678",
        "police": "Anuradhapura Police - 0252 456 789",
        "hospital": "Anuradhapura Teaching Hospital - 0252 987 654",
    },
    "batticaloa": {
        "fire": "Batticaloa Fire Station - 0652 345 678",
        "police": "Batticaloa Police - 0652 456 789",
        "hospital": "Batticaloa Teaching Hospital - 0652 987 654",
    },
    "matara": {
        "fire": "Matara Fire Service - 0412 345 678",
        "police": "Matara Police - 0412 456 789",
        "hospital": "Matara General Hospital - 0412 987 654",
    },
    "polonnaruwa": {
        "fire": "Polonnaruwa Fire Station - 0272 345 678",
        "police": "Polonnaruwa Police - 0272 456 789",
        "hospital": "Polonnaruwa General Hospital - 0272 987 654",
    },
    "ratnapura": {
        "fire": "Ratnapura Fire Station - 0452 345 678",
        "police": "Ratnapura Police - 0452 456 789",
        "hospital": "Ratnapura General Hospital - 0452 987 654",
    },
    "dambulla": {
        "fire": "Dambulla Fire Brigade - 0662 345 678",
        "police": "Dambulla Police - 0662 456 789",
        "hospital": "Dambulla Base Hospital - 0662 987 654",
    },
    "badulla": {
        "fire": "Badulla Fire Service - 0552 345 678",
        "police": "Badulla Police - 0552 456 789",
        "hospital": "Badulla General Hospital - 0552 987 654",
    },
    "malabe": {
        "fire": "Malabe Fire Station - 0112 123 456",
        "police": "Malabe Police Station - 0112 234 567",
        "hospital": "Neville Fernando Hospital - 0114 321 234",
    }
}

def classify_intent(text):
    text = text.lower()
    if "fire" in text or "burning" in text:
        return "fire"
    elif "police" in text or "crime" in text:
        return "police"
    elif "hospital" in text or "ambulance" in text or "medical" in text:
        return "hospital"
    elif any(w in text for w in ["weather", "temperature", "rain", "wind", "cloud"]):
        return "weather"
    return "general"

def parse_weather_query(query):
    query = query.lower()
    city = next((c for c in SUPPORTED_CITIES_LOWER if c in query), "colombo")
    features = []
    if any(word in query for word in ["wind", "windy"]):
        features.append("wind")
    if any(word in query for word in ["rain", "rainfall", "raining", "rainy"]):
        features.append("rain")
    if any(word in query for word in ["cloud", "cloudy", "clouds"]):
        features.append("cloud")
    if any(word in query for word in ["weather", "temperature", "temp", "hot", "cold"]):
        features.append("temperature")
    if not features:
        features.append("weather")
    return {"city": SUPPORTED_CITIES_LOWER[city], "features": features}

# Dummy weather fetch function
def fetch_weather(lat, lon):
    return {
        "temperature_2m_max": 32,
        "temperature_2m_min": 26,
        "precipitation_sum": 5,
        "windspeed_10m_max": 20,
        "clouds": {"all": 70},
        "weather_main": "Partly Cloudy",
    }

@app.route("/nlp_query", methods=["POST"])
def nlp_query():
    query = request.json.get("query", "").lower()
    intent = classify_intent(query)

    # Detect city
    city = next((c for c in EMERGENCY_INFO if c in query), "colombo")

    # Emergency response
    if intent in ["fire", "police", "hospital"]:
        if city in EMERGENCY_INFO and intent in EMERGENCY_INFO[city]:
            contact = EMERGENCY_INFO[city][intent]
            return jsonify({"message": f"⚠️ Emergency in {city.capitalize()} detected. Contact: {contact}"})

    # Weather response
    if intent == "weather":
        parsed = parse_weather_query(query)
        city_name = parsed["city"]
        weather_data = fetch_weather(*CITIES[city_name])
        if not weather_data:
            return jsonify({"message": f"Sorry, could not fetch weather data for {city_name}."})
        
        parts = []
        main = weather_data
        temp_max = main.get("temperature_2m_max")
        temp_min = main.get("temperature_2m_min")
        wind_speed = main.get("windspeed_10m_max")
        precip = main.get("precipitation_sum", 0)
        clouds = main.get("clouds", {}).get("all", 0)
        weather_main = main.get("weather_main", "No data")

        if "temperature" in parsed["features"] or "weather" in parsed["features"]:
            parts.append(f"🌡️ Temp in {city_name} is {temp_min}°C - {temp_max}°C. Sky: {weather_main}.")
        if "wind" in parsed["features"]:
            parts.append(f"💨 Wind speed: {wind_speed} km/h.")
        if "rain" in parsed["features"]:
            parts.append(f"🌧️ Rainfall: {precip} mm.")
        if "cloud" in parsed["features"]:
            parts.append(f"☁️ Cloudiness: {clouds}%.")

        return jsonify({"message": " ".join(parts)})

    return jsonify({"message": "I’m not sure what you meant. Could you please clarify?"})

# ------------------ Disruption Prediction Routes ------------------ #

risk_suggestions = {
    "Low": "No immediate action needed. Monitor weather conditions.",
    "Medium": "Prepare contingency plans. Inform staff and check equipment.",
    "High": "Activate backup plans immediately. Notify all stakeholders and consider event postponement or cancellation.",
}

@app.route("/predict_disruption", methods=["POST"])
def predict_disruption():
    """
    This endpoint tries to support both models:
    - If input has temperature, humidity, wind_speed, rainfall: use model1 (scaled)
    - If input has temperature_2m_max, temperature_2m_min, precipitation_sum, windspeed_10m_max: use model2 directly
    """
    data = request.json
    try:
        if all(k in data for k in ("temperature", "humidity", "wind_speed", "rainfall")):
            # Use model1 + scaler + label_encoder
            features = [
                float(data["temperature"]),
                float(data["humidity"]),
                float(data["wind_speed"]),
                float(data["rainfall"]),
            ]
            features_scaled = scaler.transform([features])
            pred_encoded = model1.predict(features_scaled)[0]
            risk_label = label_encoder.inverse_transform([pred_encoded])[0]
            suggestion = risk_suggestions.get(risk_label, "No suggestions available.")
            socketio.emit('risk_prediction', {'risk': risk_label})
            return jsonify({"risk": risk_label, "suggestion": suggestion})

        elif all(k in data for k in ("temperature_2m_max", "temperature_2m_min", "precipitation_sum", "windspeed_10m_max")):
            # Use model2
            features = [
                float(data["temperature_2m_max"]),
                float(data["temperature_2m_min"]),
                float(data["precipitation_sum"]),
                float(data["windspeed_10m_max"]),
            ]
            features_array = np.array(features).reshape(1, -1)
            pred_encoded = model2.predict(features_array)[0]
            risk_label = label_encoder2.inverse_transform([pred_encoded])[0]
            return jsonify({
                "risk_level": risk_label,
                "message": f"Predicted Risk Level: {risk_label}"
            })
        else:
            return jsonify({"error": "Insufficient or incorrect input data"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ------------------ Image Classification & Counting Models ------------------ #
CLASSIFICATION_MODEL_PATH = r"model/crowd_fire_model.h5"
PEOPLE_COUNT_MODEL_PATH = r"model/people_count_model.h5"  # Adjust path accordingly

classification_model = load_model(CLASSIFICATION_MODEL_PATH)
class_names = ['crowd', 'fire']

people_count_model = load_model(
    PEOPLE_COUNT_MODEL_PATH,
    custom_objects={'mse': MeanSquaredError()}
)

def preprocess_classification_image(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return None
    img = cv2.resize(img, (224, 224)) / 255.0
    return np.expand_dims(img, axis=0)

def preprocess_counting_image(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return None
    img = cv2.resize(img, (128, 128)) / 255.0
    return np.expand_dims(img, axis=0)

def get_risk_level(count):
    if count < 0:
        return "Unknown"
    elif count <= 20:
        return "Low"
    elif count <= 60:
        return "Medium"
    elif count <= 100:
        return "High"
    else:
        return "Very High"

@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files["image"]
    image_bytes = image_file.read()

    # Classification
    processed_class_img = preprocess_classification_image(image_bytes)
    if processed_class_img is None:
        return jsonify({"error": "Invalid image for classification"}), 400
    class_pred = classification_model.predict(processed_class_img)
    predicted_class = class_names[np.argmax(class_pred)]

    # People Counting
    processed_count_img = preprocess_counting_image(image_bytes)
    if processed_count_img is None:
        return jsonify({"error": "Invalid image for people counting"}), 400
    count_pred = people_count_model.predict(processed_count_img)
    count = int(round(count_pred[0][0]))
    count = max(0, min(count, 100))  # Clamp to 0-100
    risk_level = get_risk_level(count)

    # Trigger Alert for fire or risky crowd
    if predicted_class == "fire" or risk_level in ["Medium", "High", "Very High"]:
        alert = {
            "zone": "Unknown",
            "risk": risk_level,
            "message": f"{'Fire detected' if predicted_class == 'fire' else 'Crowd level is ' + risk_level}",
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
        alerts.append(alert)
        socketio.emit("new_alert", alert)

        subject = f"ALERT: {alert['risk']} risk detected"
        body = (
            f"Alert:\n\nZone: {alert['zone']}\nRisk: {alert['risk']}\n"
            f"Message: {alert['message']}\nTime: {alert['timestamp']}"
        )
        send_email(subject, body)
        send_sms(body)

    return jsonify({
        "prediction": predicted_class,
        "people_count": count,
        "risk_level": risk_level
    })

# ------------------ SocketIO events ------------------ #
@socketio.on('connect')
def on_connect():
    print('🔌 Client connected')

@socketio.on('disconnect')
def on_disconnect():
    print('❌ Client disconnected')

# ------------------ Home ------------------ #
@app.route("/")
def home():
    return "Unified Disruption & Alert Flask API with Socket.IO"

# ------------------ Run ------------------ #
if __name__ == "__main__":
    socketio.run(app, debug=True, port=5000)
