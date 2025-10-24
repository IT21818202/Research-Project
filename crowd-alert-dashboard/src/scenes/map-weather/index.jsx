import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";

const GOOGLE_API_KEY = "AIzaSyCA6_JRh6Z_icW1a_38zR3Dc8-5YCiuKPQ";

const googleSearchIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149059.png",
  iconSize: [35, 45],
  iconAnchor: [17, 45],
  popupAnchor: [0, -40],
});

function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 14, { duration: 1.5 });
    }
  }, [position, map]);
  return null;
}

export default function CombinedRiskPredictor() {
  const [googleAddress, setGoogleAddress] = useState("");
  const [googlePosition, setGooglePosition] = useState(null);
  const [googleWeather, setGoogleWeather] = useState(null);
  const [googleResult, setGoogleResult] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");

  // Fetch weather and predict for google searched location
  useEffect(() => {
    if (!googlePosition) return;

    setGoogleLoading(true);
    setGoogleWeather(null);
    setGoogleResult(null);
    setGoogleError("");

    const [lat, lon] = googlePosition;

    axios
      .get("http://localhost:5000/weather/coordinates", { params: { lat, lon } })
      .then((res) => {
        setGoogleWeather(res.data);

        // Then predict disruption risk using fetched weather
        return axios.post("http://localhost:5000/predict_disruption", res.data);
      })
      .then((res) => {
        setGoogleResult(res.data);
      })
      .catch(() => {
        setGoogleError("Failed to fetch weather or predict risk");
      })
      .finally(() => setGoogleLoading(false));
  }, [googlePosition]);

  // Handle Google Maps API address search
  const handleGoogleSearch = async () => {
    if (!googleAddress.trim()) {
      alert("Please enter an address");
      return;
    }
    setGoogleLoading(true);
    setGoogleError("");
    setGooglePosition(null);
    setGoogleWeather(null);
    setGoogleResult(null);

    try {
      const encodedAddress = encodeURIComponent(googleAddress);
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_API_KEY}`
      );
      if (response.data.results.length === 0) {
        setGoogleError("No location found");
        setGooglePosition(null);
      } else {
        const loc = response.data.results[0].geometry.location;
        setGooglePosition([loc.lat, loc.lng]);
      }
    } catch {
      setGoogleError("Failed to fetch location");
      setGooglePosition(null);
    }
    setGoogleLoading(false);
  };

  // Helper to get circle color based on weather
  const getCircleColor = (w) => {
    if (!w) return "blue";
    if (w.precipitation_sum > 0) return "blue";
    if (w.clouds?.all > 50) return "gray";
    return "green";
  };

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 20, fontFamily: "Arial" }}>
      <h2 style={{ textAlign: "center" }}>Event Disruption Risk Predictor</h2>

      {/* Google Maps address search */}
      <h3 style={{ textAlign: "center", marginTop: 20 }}>Search any address (Google Maps API):</h3>
      <div style={{ maxWidth: 600, margin: "auto", marginBottom: 15 }}>
        <input
          type="text"
          placeholder="Enter address e.g. BOC Malabe branch"
          value={googleAddress}
          onChange={(e) => setGoogleAddress(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGoogleSearch()}
          style={{ width: "100%", padding: 10, fontSize: 16, borderRadius: 4, border: "1px solid #ccc" }}
          disabled={googleLoading}
        />
        <button
          onClick={handleGoogleSearch}
          disabled={googleLoading}
          style={{
            padding: 10,
            width: "100%",
            marginTop: 10,
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: googleLoading ? "not-allowed" : "pointer",
            borderRadius: 4,
            fontWeight: "bold",
          }}
        >
          {googleLoading ? "Searching..." : "Search Address"}
        </button>
        {googleError && <p style={{ color: "red" }}>{googleError}</p>}
      </div>

      {/* Google Address prediction */}
      {googlePosition && (
        <>
          <p style={{ textAlign: "center" }}>
            <b>Location found:</b> {googleAddress}
          </p>

          {googleResult && (
            <div
              style={{
                marginTop: 20,
                fontWeight: "bold",
                color: googleResult.error ? "red" : "green",
                textAlign: "center",
                fontSize: 18,
              }}
            >
              {googleResult.error ? `Error: ${googleResult.error}` : `Risk Level: ${googleResult.risk_level}`}
            </div>
          )}
        </>
      )}

      {/* Map */}
      <div style={{ height: 600, width: "100%", marginTop: 20 }}>
        <MapContainer
          center={[7.8731, 80.7718]} // center of Sri Lanka
          zoom={7}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            maxZoom={20}
            subdomains={["mt0", "mt1", "mt2", "mt3"]}
          />

          {/* Fly to Google API searched address */}
          {googlePosition && <FlyToLocation position={googlePosition} />}

          {/* Google Address Marker */}
          {googlePosition && (
            <Marker position={googlePosition} icon={googleSearchIcon}>
              <Popup>{googleAddress}</Popup>
            </Marker>
          )}

          {/* Circle showing weather risk */}
          {googlePosition && googleWeather && (
            <Circle
              center={googlePosition}
              radius={2000}
              pathOptions={{ color: getCircleColor(googleWeather), fillOpacity: 0.2 }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
