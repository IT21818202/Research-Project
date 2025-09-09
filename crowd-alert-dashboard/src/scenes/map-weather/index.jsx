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

const CITY_COORDS = {
  Colombo: [6.9271, 79.8612],
  Kandy: [7.2906, 80.6337],
  Jaffna: [9.6615, 80.0255],
  Galle: [6.0535, 80.221],
  Trincomalee: [8.5874, 81.2152],
  Hatton: [6.891, 80.5937],
  Negombo: [7.2083, 79.8358],
  "Nuwara Eliya": [6.9707, 80.782],
  Anuradhapura: [8.3114, 80.4037],
  Batticaloa: [7.7102, 81.6924],
  Matara: [5.9485, 80.5353],
  Polonnaruwa: [7.9391, 81.0036],
  Ratnapura: [6.6828, 80.3992],
  Dambulla: [7.8569, 80.6517],
  Badulla: [6.9895, 81.055],
  Malabe: [6.9147, 79.9719],
};

const CITIES = Object.keys(CITY_COORDS);

const cityIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 45],
  iconAnchor: [17, 45],
  popupAnchor: [0, -40],
});
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
  // --- City weather & risk state ---
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [result, setResult] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [loadingPredict, setLoadingPredict] = useState(false);

  // --- Google API address search state ---
  const [googleAddress, setGoogleAddress] = useState("");
  const [googlePosition, setGooglePosition] = useState(null);
  const [googleWeather, setGoogleWeather] = useState(null);
  const [googleResult, setGoogleResult] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");

  // Fetch weather for selected city
  useEffect(() => {
    if (!city) return;
    setLoadingWeather(true);
    setWeather(null);
    setResult(null);
    axios
      .get(`http://localhost:5000/weather/${city}`)
      .then((res) => setWeather(res.data))
      .catch(() => alert("Failed to fetch weather for " + city))
      .finally(() => setLoadingWeather(false));
  }, [city]);

  // Predict disruption risk for city
  const handlePredict = () => {
    if (!weather) {
      alert("No weather data for prediction.");
      return;
    }
    setLoadingPredict(true);
    setResult(null);
    axios
      .post("http://localhost:5000/predict_disruption", weather)
      .then((res) => setResult(res.data))
      .catch(() => setResult({ error: "Prediction failed." }))
      .finally(() => setLoadingPredict(false));
  };

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

  // Helper to get weather emoji icon
  const getWeatherIcon = (w) => {
    if (!w) return null;
    if (w.precipitation_sum > 0) return "🌧️";
    if (w.clouds?.all > 50) return "☁️";
    return "☀️";
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

      {/* City buttons */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 10,
          marginBottom: 20,
        }}
      >
        {CITIES.map((c) => (
          <button
            key={c}
            onClick={() => setCity(c)}
            style={{
              padding: "8px 15px",
              borderRadius: 20,
              border: city === c ? "2px solid #007bff" : "1px solid #ccc",
              backgroundColor: city === c ? "#007bff" : "#f0f0f0",
              color: city === c ? "white" : "black",
              cursor: "pointer",
              fontWeight: city === c ? "bold" : "normal",
              minWidth: 90,
              textAlign: "center",
              userSelect: "none",
              transition: "all 0.3s ease",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* City weather display */}
      {loadingWeather && <p style={{ textAlign: "center" }}>Loading weather for {city}...</p>}
      {weather && (
        <div style={{ textAlign: "center", marginBottom: 15 }}>
          <p>
            <b>Max Temp:</b> {weather.temperature_2m_max} °C
          </p>
          <p>
            <b>Min Temp:</b> {weather.temperature_2m_min} °C
          </p>
          <p>
            <b>Rainfall:</b> {weather.precipitation_sum} mm
          </p>
          <p>
            <b>Wind Speed:</b> {weather.windspeed_10m_max.toFixed(2)} km/h
          </p>
          <p style={{ fontSize: 40 }}>{getWeatherIcon(weather)}</p>
        </div>
      )}

      <button
        onClick={handlePredict}
        disabled={loadingPredict || !weather}
        style={{
          width: "100%",
          padding: 12,
          fontSize: 16,
          cursor: loadingPredict || !weather ? "not-allowed" : "pointer",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: 5,
          fontWeight: "bold",
          marginBottom: 40,
        }}
      >
        {loadingPredict ? "Predicting Risk..." : "Predict Risk"}
      </button>

      <hr />

      {/* Google Maps address search */}
      <h3 style={{ textAlign: "center", marginTop: 40 }}>Or search any address (Google Maps API):</h3>
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

      {/* Google Address weather and prediction */}
      {googlePosition && (
        <>
          <p style={{ textAlign: "center" }}>
            <b>Location found:</b> {googleAddress}
          </p>

          {googleWeather ? (
            <div style={{ textAlign: "center", marginBottom: 15 }}>
              <p>
                <b>Max Temp:</b> {googleWeather.temperature_2m_max} °C
              </p>
              <p>
                <b>Min Temp:</b> {googleWeather.temperature_2m_min} °C
              </p>
              <p>
                <b>Rainfall:</b> {googleWeather.precipitation_sum} mm
              </p>
              <p>
                <b>Wind Speed:</b> {googleWeather.windspeed_10m_max.toFixed(2)} km/h
              </p>
              <p style={{ fontSize: 40 }}>{getWeatherIcon(googleWeather)}</p>
            </div>
          ) : (
            <p style={{ textAlign: "center" }}>Loading weather data...</p>
          )}

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

      <hr />

      {/* Map */}
      <div style={{ height: 600, width: "100%" }}>
        <MapContainer
          center={[7.8731, 80.7718]} // center of Sri Lanka
          zoom={7}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
          zoomControl={true}
        >
          {/* Google Roadmap Tile */}
          <TileLayer
            url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            maxZoom={20}
            subdomains={["mt0", "mt1", "mt2", "mt3"]}
          />

          {/* Fly to selected city */}
          {city && <FlyToLocation position={CITY_COORDS[city]} />}

          {/* Fly to Google API searched address */}
          {googlePosition && <FlyToLocation position={googlePosition} />}

          {/* City Marker & Circle */}
          {city && (
            <>
              <Marker position={CITY_COORDS[city]} icon={cityIcon}>
                <Popup>
                  <b>{city}</b>
                </Popup>
              </Marker>
              <Circle
                center={CITY_COORDS[city]}
                radius={2000}
                pathOptions={{ color: getCircleColor(weather), fillOpacity: 0.2 }}
              />
            </>
          )}

          {/* Google Address Marker */}
          {googlePosition && (
            <Marker position={googlePosition} icon={googleSearchIcon}>
              <Popup>{googleAddress}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
