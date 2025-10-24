
import os,sys
sys.path.append(os.path.dirname(__file__))
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import joblib
import requests
import numpy as np
from pymongo import MongoClient
from bson import ObjectId
from location_routes import location_bp
import cv2
from tensorflow.keras.models import load_model
from tensorflow.keras.losses import MeanSquaredError
import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import json

from bson import ObjectId
from bson.errors import InvalidId
from pymongo import MongoClient
from dotenv import load_dotenv
load_dotenv()


# --- Flask and SocketIO setup ---
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")



# ---------------------------
# MongoDB connection
# ---------------------------
MONGO_URI = "mongodb+srv://dbUser:PjgloDbTT3BlOjsE@cluster0.iqc12.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client["Event"]   # same as dbName: 'Event'

# Collections
members_collection = db["members"]
calendar_collection = db["calendar"]
locations_collection = db["locations"] 
devices_collection = db['devices']  

# ---------------------------
# Helpers
# ---------------------------
def serialize_member(member):
    return {
          "id": str(member["_id"]),
        "name": member.get("name"),
        "itno": member.get("itno"),  # Changed from email to itno
        "phone": member.get("phone"),  # Added phone
        "gender": member.get("gender"),  # Added gender
        "access": member.get("access")  # Changed from role to access
    
    }


def serialize_event(event):
    return {
        "id": str(event["_id"]),
        "title": event.get("title"),
        "start": event.get("start"),
        "end": event.get("end")
    }

def serialize_location(location):
    # Convert datetime objects to ISO format strings
    created_at = location.get("createdAt")
    if created_at and hasattr(created_at, 'isoformat'):
        created_at = created_at.isoformat()
    
    updated_at = location.get("updatedAt")
    if updated_at and hasattr(updated_at, 'isoformat'):
        updated_at = updated_at.isoformat()
    
    return {
        "id": str(location["_id"]),
        "name": location.get("name"),
        "fireDevicesCount": location.get("fireDevicesCount"),
        "cameraAreasCount": location.get("cameraAreasCount"),
        "coordinates": location.get("coordinates", {}),
        "subLocations": location.get("subLocations", []),
        "createdAt": created_at,
        "updatedAt": updated_at
    }

# ---------------------------
# Member Routes
# ---------------------------

@app.route("/api/members", methods=["GET"])
def get_members():
    members = list(members_collection.find())
    return jsonify([serialize_member(m) for m in members])

@app.route("/api/members", methods=["POST"])
def add_member():
    data = request.json
    new_member = {
        "name": data.get("name"),
        "itno": data.get("itno"),  # Changed from email to itno
        "phone": data.get("phone"),  # Added phone
        "gender": data.get("gender"),  # Added gender
        "access": data.get("access")  # Changed from role to access
    }
    result = members_collection.insert_one(new_member)
    return jsonify(serialize_member({**new_member, "_id": result.inserted_id})), 201

@app.route("/api/members/<id>", methods=["PUT"])
def update_member(id):
    data = request.json
    updated_member = {
        "name": data.get("name"),
        "itno": data.get("itno"),
        "phone": data.get("phone"),
        "gender": data.get("gender"),
        "access": data.get("access")
    }
    
    result = members_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": updated_member}
    )
    
    if result.matched_count == 1:
        return jsonify(serialize_member({**updated_member, "_id": ObjectId(id)})), 200
    return jsonify({"msg": "Not Found"}), 404

@app.route("/api/members/<id>", methods=["DELETE"])
def delete_member(id):
    try:
        # Try to delete by ObjectId
        obj_id = ObjectId(id)
        result = members_collection.delete_one({"_id": obj_id})
    except Exception as e:
        # If ObjectId fails, try deleting by string id field
        result = members_collection.delete_one({"id": id})
    
    if result.deleted_count == 1:
        return jsonify({"msg": "Deleted"}), 200
    return jsonify({"msg": "Not Found"}), 404

# ---------------------------
# Calendar Routes
# ---------------------------
@app.route("/api/calendar", methods=["GET"])
def get_events():
    events = list(calendar_collection.find())
    return jsonify([serialize_event(e) for e in events])

@app.route("/api/calendar", methods=["POST"])
def add_event():
    data = request.json
    new_event = {
        "title": data.get("title"),
        "start": data.get("start"),
        "end": data.get("end"),
        "allDay": data.get("allDay", False)
    }
    result = calendar_collection.insert_one(new_event)
    return jsonify(serialize_event({**new_event, "_id": result.inserted_id})), 201

@app.route("/api/calendar/<id>", methods=["PUT"])
def update_event(id):
    data = request.json
    updated_event = {
        "title": data.get("title"),
        "start": data.get("start"),
        "end": data.get("end"),
        "allDay": data.get("allDay", False)
    }
    result = calendar_collection.update_one({"_id": ObjectId(id)}, {"$set": updated_event})
    if result.matched_count == 1:
        return jsonify(serialize_event({**updated_event, "_id": ObjectId(id)})), 200
    return jsonify({"msg": "Not Found"}), 404

@app.route("/api/calendar/<id>", methods=["DELETE"])
def delete_event(id):
    result = calendar_collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 1:
        return jsonify({"msg": "Deleted"}), 200
    return jsonify({"msg": "Not Found"}), 404


# ---------------------------
# Geocoding Routes
# ---------------------------

@app.route("/api/geocode", methods=["GET"])
def geocode_location():
    """
    Geocode a location name to coordinates using OpenStreetMap Nominatim
    """
    try:
        location_name = request.args.get("q", "").strip()
        
        if not location_name:
            return jsonify({"error": "Location name is required"}), 400
        
        print(f"🔍 Geocoding: {location_name}")
        
        # OpenStreetMap Nominatim API (free, no API key needed)
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            "q": location_name + ", Sri Lanka",
            "format": "json",
            "limit": 5,
            "countrycodes": "lk"  # Limit to Sri Lanka
        }
        
        headers = {
            "User-Agent": "CrowdAlertDashboard/1.0 (bobhesha@gmail.com)"  # Required by Nominatim
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            if data:
                results = []
                for item in data[:3]:  # Return top 3 results
                    results.append({
                        "name": item.get("display_name", ""),
                        "lat": float(item["lat"]),
                        "lng": float(item["lon"]),
                        "type": item.get("type", ""),
                        "importance": item.get("importance", 0)
                    })
                
                print(f"✅ Found {len(results)} results for: {location_name}")
                return jsonify({"results": results})
            else:
                print(f"❌ No results found for: {location_name}")
                return jsonify({"error": "No results found"}), 404
        else:
            print(f"❌ Geocoding API error: {response.status_code}")
            return jsonify({"error": "Geocoding service unavailable"}), 500
            
    except requests.exceptions.Timeout:
        print("❌ Geocoding request timeout")
        return jsonify({"error": "Geocoding request timeout"}), 408
    except Exception as e:
        print(f"❌ Geocoding error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/reverse-geocode", methods=["GET"])
def reverse_geocode():
    """
    Reverse geocode coordinates to address
    """
    try:
        lat = request.args.get("lat")
        lng = request.args.get("lng")
        
        if not lat or not lng:
            return jsonify({"error": "Latitude and longitude are required"}), 400
        
        url = "https://nominatim.openstreetmap.org/reverse"
        params = {
            "lat": lat,
            "lon": lng,
            "format": "json"
        }
        
        headers = {
            "User-Agent": "CrowdAlertDashboard/1.0"
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return jsonify({
                "address": data.get("display_name", ""),
                "name": data.get("name", "")
            })
        else:
            return jsonify({"error": "Reverse geocoding failed"}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------------------
# Location Routes (MongoDB Integration) - FIXED SERIALIZATION
# ---------------------------

# Add these endpoints to your existing app.py

@app.route("/api/devices", methods=["GET"])
def get_all_devices():
    try:
        devices = list(devices_collection.find())
        return jsonify([serialize_device(device) for device in devices])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/devices/<device_id>", methods=["GET"])
def get_device(device_id):
    try:
        device = devices_collection.find_one({"_id": ObjectId(device_id)})
        if device:
            return jsonify(serialize_device(device))
        return jsonify({"error": "Device not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/devices", methods=["POST"])
def create_device():
    try:
        data = request.json
        
        new_device = {
            "name": data.get("name"),
            "type": data.get("type"),
            "status": data.get("status", "normal"),
            "locationId": data.get("locationId"),
            "coordinates": data.get("coordinates", {}),
            "intensity": data.get("intensity", 0.5),
            "coverage": data.get("coverage", 100),
            "description": data.get("description", ""),
            "createdAt": datetime.datetime.utcnow(),
            "updatedAt": datetime.datetime.utcnow()
        }
        
        result = devices_collection.insert_one(new_device)
        saved_device = devices_collection.find_one({"_id": result.inserted_id})
        serialized_device = serialize_device(saved_device)
        
        socketio.emit("device_added", serialized_device)
        return jsonify(serialized_device), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/devices/<device_id>", methods=["PUT"])
def update_device(device_id):
    try:
        data = request.json
        updated_data = {
            "name": data.get("name"),
            "type": data.get("type"),
            "status": data.get("status"),
            "coordinates": data.get("coordinates", {}),
            "intensity": data.get("intensity"),
            "coverage": data.get("coverage"),
            "description": data.get("description"),
            "updatedAt": datetime.datetime.utcnow()
        }
        
        result = devices_collection.update_one(
            {"_id": ObjectId(device_id)},
            {"$set": updated_data}
        )
        
        if result.matched_count == 1:
            updated_device = devices_collection.find_one({"_id": ObjectId(device_id)})
            socketio.emit("device_updated", serialize_device(updated_device))
            return jsonify(serialize_device(updated_device))
        return jsonify({"error": "Device not found"}), 404
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/devices/<device_id>", methods=["DELETE"])
def delete_device(device_id):
    try:
        result = devices_collection.delete_one({"_id": ObjectId(device_id)})
        if result.deleted_count == 1:
            socketio.emit("device_deleted", {"id": device_id})
            return jsonify({"message": "Device deleted successfully"})
        return jsonify({"error": "Device not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/locations/<location_id>/devices", methods=["GET"])
def get_location_devices(location_id):
    try:
        devices = list(devices_collection.find({"locationId": location_id}))
        return jsonify([serialize_device(device) for device in devices])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def serialize_device(device):
    return {
        "id": str(device["_id"]),
        "name": device.get("name"),
        "type": device.get("type"),
        "status": device.get("status"),
        "locationId": device.get("locationId"),
        "coordinates": device.get("coordinates", {}),
        "intensity": device.get("intensity", 0.5),
        "coverage": device.get("coverage", 100),
        "description": device.get("description", ""),
        "createdAt": device.get("createdAt").isoformat() if device.get("createdAt") else None,
        "updatedAt": device.get("updatedAt").isoformat() if device.get("updatedAt") else None
    }

def serialize_location(location):
    # Convert datetime objects to ISO format strings
    created_at = location.get("createdAt")
    if created_at and hasattr(created_at, 'isoformat'):
        created_at = created_at.isoformat()
    
    updated_at = location.get("updatedAt")
    if updated_at and hasattr(updated_at, 'isoformat'):
        updated_at = updated_at.isoformat()
    
    # Handle sub-locations serialization
    sub_locations = []
    for sub_loc in location.get("subLocations", []):
        sub_created_at = sub_loc.get("createdAt")
        if sub_created_at and hasattr(sub_created_at, 'isoformat'):
            sub_loc = sub_loc.copy()
            sub_loc["createdAt"] = sub_created_at.isoformat()
        sub_locations.append(sub_loc)
    
    return {
        "id": str(location["_id"]),
        "name": location.get("name"),
        "fireDevicesCount": location.get("fireDevicesCount"),
        "cameraAreasCount": location.get("cameraAreasCount"),
        "coordinates": location.get("coordinates", {}),
        "subLocations": sub_locations,
        "createdAt": created_at,
        "updatedAt": updated_at
    }

@app.route("/api/locations", methods=["GET"])
def get_all_locations():
    try:
        locations = list(locations_collection.find().sort("createdAt", -1))
        serialized_locations = [serialize_location(loc) for loc in locations]
        return jsonify(serialized_locations)
    except Exception as e:
        print("Error fetching locations:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/api/locations", methods=["POST"])
def create_new_location():
    try:
        data = request.json
        print("Received location data:", data)
        
        new_location = {
            "name": data.get("name"),
            "fireDevicesCount": int(data.get("fireDevicesCount", 1)),
            "cameraAreasCount": int(data.get("cameraAreasCount", 1)),
            "coordinates": data.get("coordinates", {}),
            "subLocations": data.get("subLocations", []),
            "createdAt": datetime.datetime.utcnow()
        }
        
        result = locations_collection.insert_one(new_location)
        
        # Get the saved document with proper serialization
        saved_doc = locations_collection.find_one({"_id": result.inserted_id})
        serialized_location = serialize_location(saved_doc)
        
        socketio.emit("location_added", serialized_location)
        
        return jsonify(serialized_location), 201
        
    except Exception as e:
        print("Error creating location:", e)
        return jsonify({"error": str(e)}), 400

@app.route("/api/locations/<location_id>", methods=["PUT"])
def update_existing_location(location_id):
    try:
        data = request.json
        updated_data = {
            "name": data.get("name"),
            "fireDevicesCount": int(data.get("fireDevicesCount", 1)),
            "cameraAreasCount": int(data.get("cameraAreasCount", 1)),
            "coordinates": data.get("coordinates", {}),
            "subLocations": data.get("subLocations", []),
            "updatedAt": datetime.datetime.utcnow()
        }
        
        result = locations_collection.update_one(
            {"_id": ObjectId(location_id)},
            {"$set": updated_data}
        )
        
        if result.matched_count == 1:
            # Get updated document
            updated_doc = locations_collection.find_one({"_id": ObjectId(location_id)})
            return jsonify(serialize_location(updated_doc))
        return jsonify({"error": "Location not found"}), 404
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/locations/<location_id>", methods=["DELETE"])
def delete_existing_location(location_id):
    try:
        result = locations_collection.delete_one({"_id": ObjectId(location_id)})
        if result.deleted_count == 1:
            socketio.emit("location_deleted", {"id": location_id})
            return jsonify({"message": "Location deleted"})
        return jsonify({"error": "Location not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/locations/<location_id>/sublocations", methods=["POST"])
def add_new_sublocation(location_id):
    try:
        data = request.json
        new_sublocation = {
            "id": str(ObjectId()),
            "name": data.get("name"),
            "deviceAssignments": data.get("deviceAssignments", []),
            "coordinates": data.get("coordinates", {}),
            "createdAt": datetime.datetime.utcnow().isoformat()  # Store as string
        }
        
        result = locations_collection.update_one(
            {"_id": ObjectId(location_id)},
            {"$push": {"subLocations": new_sublocation}}
        )
        
        if result.matched_count == 1:
            # Get updated document
            updated_doc = locations_collection.find_one({"_id": ObjectId(location_id)})
            socketio.emit("sublocation_added", {
                "locationId": location_id,
                "sublocation": new_sublocation
            })
            return jsonify(new_sublocation), 201
        return jsonify({"error": "Location not found"}), 404
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/locations/<location_id>/sublocations/<sublocation_id>", methods=["DELETE"])
def delete_existing_sublocation(location_id, sublocation_id):
    try:
        result = locations_collection.update_one(
            {"_id": ObjectId(location_id)},
            {"$pull": {"subLocations": {"id": sublocation_id}}}
        )
        
        if result.matched_count == 1:
            socketio.emit("sublocation_deleted", {
                "locationId": location_id,
                "sublocationId": sublocation_id
            })
            return jsonify({"message": "Sub-location deleted"})
        return jsonify({"error": "Location or sub-location not found"}), 404
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400



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

# Load emergency contacts from JSON file
EMERGENCY_JSON_PATH = r"D:\copy3-crowd-alert-dashboard\Crowd-Alert-Dashboard\backend\emergency_locations.json"

try:
    with open(EMERGENCY_JSON_PATH, "r", encoding="utf-8") as f:
        EMERGENCY_INFO = json.load(f)
    print("✅ Emergency contacts loaded successfully.")
except Exception as e:
    print(f"❌ Failed to load emergency contacts: {e}")
    EMERGENCY_INFO = {}

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
    "High": "Activate backup plans immediately. Notify all stakeholders and consider event postponement or cancellation,high heat.",
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
