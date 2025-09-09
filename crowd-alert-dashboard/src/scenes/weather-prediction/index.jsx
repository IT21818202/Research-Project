import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Colored markers
const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Map re-centering component
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

function LivePrediction() {
  const [location, setLocation] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => setError("Failed to get your location.")
    );
  }, []);

  useEffect(() => {
    if (!location) return;

    // Correct URL for location-based prediction
    axios
      .post("http://localhost:5000/predict_disruption_with_location", location)
      .then((res) => setPrediction(res.data))
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch prediction from server.");
      });
  }, [location]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!location) return <p>Getting your location...</p>;
  if (!prediction) return <p>Predicting disruption risk...</p>;

  const markerIcon = prediction.risk === "High" ? redIcon : greenIcon;

  return (
    <div style={{ maxWidth: "900px", margin: "20px auto", textAlign: "center" }}>
      <h2>Live Event Disruption Risk</h2>
      <p>
        <strong>Location:</strong>{" "}
        {prediction.latitude.toFixed(6)}, {prediction.longitude.toFixed(6)}
      </p>
      <p>
        <strong>Risk Level:</strong>{" "}
        <span
          style={{
            color: prediction.risk === "High" ? "red" : "green",
            fontWeight: "bold",
          }}
        >
          {prediction.risk}
        </span>{" "}
        ({prediction.probability}% confidence)
      </p>

      <MapContainer
        center={[prediction.latitude, prediction.longitude]}
        zoom={13}
        style={{ height: "500px", width: "100%", borderRadius: "10px" }}
        scrollWheelZoom={true}
      >
        <ChangeView center={[prediction.latitude, prediction.longitude]} zoom={13} />
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[prediction.latitude, prediction.longitude]} icon={markerIcon}>
          <Popup>
            <strong>Risk Level:</strong> {prediction.risk}
            <br />
            <strong>Confidence:</strong> {prediction.probability}%
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default LivePrediction;
