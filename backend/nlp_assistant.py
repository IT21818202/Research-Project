from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

API_KEY = "a8927c216016b945b6ef3d9329f0cd0c"
WEATHER_API_URL = "http://api.openweathermap.org/data/2.5/weather"

SUPPORTED_CITIES = {
    "colombo": "Colombo",
    "kandy": "Kandy",
    "hatton": "Hatton",
    "galle": "Galle",
    "negombo": "Negombo",
    "trincomalee": "Trincomalee",
    "nuwara eliya": "Nuwara Eliya",
    "anuradhapura": "Anuradhapura",
    "jaffna": "Jaffna",
    "batticaloa": "Batticaloa",
    "matara": "Matara",
    "polonnaruwa": "Polonnaruwa",
    "ratnapura": "Ratnapura",
    "dambulla": "Dambulla",
    "badulla": "Badulla"
}

def parse_query(query):
    query = query.lower()

    # Detect city
    city = None
    for c in SUPPORTED_CITIES:
        if c in query:
            city = c
            break
    if city is None:
        city = "colombo"  # default city

    # Detect weather feature
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
        features.append("weather")  # default to general weather

    return {"city": city, "features": features}

def fetch_weather(city_name):
    params = {
        "q": f"{city_name},LK",
        "appid": API_KEY,
        "units": "metric"
    }
    response = requests.get(WEATHER_API_URL, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        return None


def classify_intent(text):
    text = text.lower()
    if any(word in text for word in ["fire", "burning", "smoke", "flames"]):
        return "fire"
    elif any(word in text for word in ["police", "crime", "thief", "robbery"]):
        return "police"
    elif any(word in text for word in ["hospital", "ambulance", "injury", "medical", "doctor"]):
        return "medical"
    elif any(word in text for word in ["weather", "temperature", "rain", "wind", "cloud"]):
        return "weather"
    return "general"

EMERGENCY_INFO = {
    "colombo": {
        "fire": "Colombo Fire Brigade - 0112 421 111",
        "police": "Colombo Police - 0112 421 222",
        "medical": "National Hospital - 0112 693 366",
    },
    "kandy": {
        "fire": "Kandy Fire Brigade - 0812 223 456",
        "police": "Kandy Police - 0812 224 567",
        "medical": "Kandy General Hospital - 0812 876 543",
    },
    "malabe": {
        "fire": "Malabe Fire Station - 0112 123 456",
        "police": "Malabe Police Station - 0112 234 567",
        "medical": "Neville Fernando Hospital - 0114 321 234",
    },
    # Add more as needed
}



@app.route("/nlp_query", methods=["POST"])
def nlp_query():
    query = request.json.get("query", "").lower()

    parsed = parse_query(query)
    city_key = parsed["city"]
    intent = classify_intent(query)
    
    # Emergency contacts
    if city_key in EMERGENCY_INFO and intent in EMERGENCY_INFO[city_key]:
        contact = EMERGENCY_INFO[city_key][intent]
        return jsonify({"message": f"⚠️ Emergency detected in {city_key.capitalize()}. Contact: {contact}"})

    # If weather intent, fetch and return weather info
    if intent == "weather":
        city_name = SUPPORTED_CITIES[city_key]
        weather_data = fetch_weather(city_name)

        if not weather_data:
            return jsonify({"message": f"Sorry, couldn't fetch weather for {city_name}."})

        parts = []
        main = weather_data.get("main", {})
        wind = weather_data.get("wind", {})
        clouds = weather_data.get("clouds", {})
        weather_conditions = weather_data.get("weather", [{}])[0]

        features = parsed["features"]
        if "temperature" in features or "weather" in features:
            temp = main.get("temp")
            desc = weather_conditions.get("description", "No data")
            parts.append(f"The temperature in {city_name} is {temp}°C with {desc}.")

        if "wind" in features:
            speed = wind.get("speed")
            parts.append(f"Wind speed is {speed} m/s.")

        if "rain" in features:
            rain = weather_data.get("rain", {})
            rain_1h = rain.get("1h", 0)
            parts.append(f"It's raining with {rain_1h} mm rain in the last hour." if rain_1h > 0 else "No rain currently.")

        if "cloud" in features:
            cloudiness = clouds.get("all", 0)
            parts.append(f"Cloudiness is {cloudiness}%.")

        return jsonify({"message": " ".join(parts)})

    return jsonify({"message": "Let me check that for you..."})

if __name__ == "__main__":
    app.run(port=5050, debug=True)
