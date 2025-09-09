from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import joblib

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")  # WebSocket support

# Load model and preprocessing objects
model = joblib.load("realistic_disruption_model.pkl")
X_train, X_test, y_train, y_test, scaler, label_encoder = joblib.load("realistic_preprocessed_data.pkl")

@app.route("/")
def home():
    return "Disruption Risk Prediction API with Socket.IO"

@app.route("/predict_disruption", methods=["POST"])
def predict_disruption():
    data = request.get_json()
    try:
        features = [
            float(data["temperature"]),
            float(data["humidity"]),
            float(data["wind_speed"]),
            float(data["rainfall"])
        ]
        features_scaled = scaler.transform([features])
        prediction = model.predict(features_scaled)[0]
        risk_label = label_encoder.inverse_transform([prediction])[0]

        # Emit real-time message to all connected clients
        socketio.emit('risk_prediction', {'risk': risk_label})

        return jsonify({"risk": risk_label})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@socketio.on('connect')
def on_connect():
    print('🔌 Client connected')

@socketio.on('disconnect')
def on_disconnect():
    print('❌ Client disconnected')

if __name__ == "__main__":
    socketio.run(app, debug=True, port=5000)  # socketio.run instead of app.run
