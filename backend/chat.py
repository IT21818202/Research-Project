from flask import Flask, request, jsonify
from flask_cors import CORS
from nlp_utils import detect_urgency, classify_intent, extract_city
from emergency_data import EMERGENCY_SERVICES

app = Flask(__name__)
CORS(app)

@app.route('/chatbot', methods=['POST'])
def chatbot():
    data = request.get_json()
    message = data.get('message', '')

    urgency = detect_urgency(message)
    intent = classify_intent(message)
    city = extract_city(message)

    response = {
        "urgency": urgency,
        "intent": intent,
        "city": city,
        "suggestions": {}
    }

    if city and city in EMERGENCY_SERVICES:
        if intent == "fire":
            response["suggestions"]["fire_station"] = EMERGENCY_SERVICES[city]["fire_station"]
        elif intent == "police":
            response["suggestions"]["police_station"] = EMERGENCY_SERVICES[city]["police_station"]
        elif intent == "medical":
            response["suggestions"]["hospital"] = EMERGENCY_SERVICES[city]["hospital"]
        else:
            # Provide all if intent unclear
            response["suggestions"] = EMERGENCY_SERVICES[city]

    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
