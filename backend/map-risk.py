from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

client = MongoClient("mongodb+srv://dbUser:pCTn8nTZEerbzMbn@cluster0.iqc12.mongodb.net/")
db = client["map_db"]
zones_col = db["zones"]

@app.route("/zones", methods=["GET"])
def get_zones():
    zones = list(zones_col.find({}, {"_id": 0}))
    return jsonify(zones)

@app.route("/zones", methods=["POST"])
def save_zone():
    data = request.json
    zones_col.insert_one(data)
    socketio.emit("new_zone", data)

    if data.get("risk") == "high":
        socketio.emit("high_risk_alert", {"message": "⚠️ High Risk Zone Added!"})

    return jsonify({"message": "Zone saved"}), 201

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)
