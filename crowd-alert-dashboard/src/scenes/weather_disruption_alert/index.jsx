import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
} from "@mui/material";
import { tokens } from "../../theme";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Component to update map view when location changes
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

const API_KEY = "a8927c216016b945b6ef3d9329f0cd0c";

const mitigationSuggestions = {
  Low: "No immediate action needed. Monitor rainfall and track updated forecasts",
  Medium: "Prepare contingency plans. Inform staff, check drainage systems, and ensure protective equipment is ready.",
  High: "Activate emergency plans immediately. Notify all stakeholders, prepare evacuation routes, and consider event postponement or cancellation due to  rainfall.",
};

const cityOptions = [
  "Colombo", "Kandy", "Hatton", "Galle", "Negombo", "Trincomalee",
  "Nuwara Eliya", "Anuradhapura", "Jaffna", "Batticaloa", "Matara",
  "Polonnaruwa", "Ratnapura", "Dambulla", "Badulla",
];

// City coordinates mapping
const cityCoordinates = {
  Colombo: [6.9271, 79.8612],
  Kandy: [7.2906, 80.6337],
  Hatton: [6.8917, 80.5955],
  Galle: [6.0535, 80.2210],
  Negombo: [7.2099, 79.8370],
  Trincomalee: [8.5874, 81.2154],
  "Nuwara Eliya": [6.9497, 80.7891],
  Anuradhapura: [8.3114, 80.4037],
  Jaffna: [9.6615, 80.0255],
  Batticaloa: [7.7162, 81.6924],
  Matara: [5.9483, 80.5353],
  Polonnaruwa: [7.9395, 81.0027],
  Ratnapura: [6.6844, 80.3996],
  Dambulla: [7.8567, 80.6491],
  Badulla: [6.9934, 81.0550],
};

const DisruptionForm = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [formData, setFormData] = useState({
    temperature: "",
    humidity: "",
    wind_speed: "",
    rainfall: "",
  });

  const [location, setLocation] = useState("Colombo");
  const [risk, setRisk] = useState(null);
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [alertColor, setAlertColor] = useState("info");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getAlertColor = (riskLevel) => {
    switch (riskLevel) {
      case "High":
        return "error";
      case "Medium":
        return "warning";
      case "Low":
        return "success";
      default:
        return "info";
    }
  };

  const handlePredict = async () => {
    setLoading(true);
    setRisk(null);
    setSuggestion("");
    try {
      const res = await fetch("http://127.0.0.1:5000/predict_disruption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setRisk(data.risk);
        const msg = mitigationSuggestions[data.risk] || "No suggestion.";
        setSuggestion(msg);
        setAlertText(`Predicted Risk Level: ${data.risk}\n${msg}`);
        setAlertColor(getAlertColor(data.risk));
      } else {
        setAlertText(data.error || "Prediction error occurred.");
        setAlertColor("error");
      }
    } catch (err) {
      setAlertText("❌ Error fetching prediction.");
      setAlertColor("error");
    } finally {
      setAlertOpen(true);
      setLoading(false);
    }
  };

  const fetchLiveWeather = async () => {
    setWeatherLoading(true);
    setRisk(null);
    setSuggestion("");
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${location},LK&appid=${API_KEY}&units=metric`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.cod !== 200) {
        setAlertText("Weather API error: " + data.message);
        setAlertColor("error");
        setAlertOpen(true);
        setWeatherLoading(false);
        return;
      }

      const temperature = data.main.temp;
      const humidity = data.main.humidity;
      const wind_speed = data.wind.speed;
      const rainfall = data.rain?.["1h"] || 0;

      setFormData({
        temperature,
        humidity,
        wind_speed,
        rainfall,
      });

      setAlertText("✅ Weather data fetched successfully.");
      setAlertColor("info");
      setAlertOpen(true);
    } catch (err) {
      setAlertText("❌ Failed to fetch weather data.");
      setAlertColor("error");
      setAlertOpen(true);
    } finally {
      setWeatherLoading(false);
    }
  };

  return (
    <Box m="20px" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
      <Typography variant="h4" color={colors.greenAccent[400]} mb={2}>
        Event Disruption Risk Predictor
      </Typography>

      <Box sx={{ width: "100%", maxWidth: 800, display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", md: "row" } }}>
          <Box sx={{ flex: 1 }}>
            <TextField
              select
              label="🌍 Select Location"
              fullWidth
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              margin="normal"
            >
              {cityOptions.map((city) => (
                <MenuItem key={city} value={city}>
                  {city}
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="contained"
              color="success"
              onClick={fetchLiveWeather}
              fullWidth
              disabled={weatherLoading}
              sx={{ mt: 1 }}
            >
              {weatherLoading ? <CircularProgress size={24} color="inherit" /> : "🌤 Fetch Live Weather"}
            </Button>

            {["temperature", "humidity", "wind_speed", "rainfall"].map((field) => (
              <TextField
                key={field}
                name={field}
                label={field.replace("_", " ").toUpperCase()}
                type="number"
                fullWidth
                required
                margin="normal"
                value={formData[field]}
                onChange={handleChange}
              />
            ))}

            <Button
              variant="contained"
              color="primary"
              onClick={handlePredict}
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "📊 Predict Risk"}
            </Button>
          </Box>

          <Box sx={{ flex: 1, height: 400, minHeight: 400 }}>
            <MapContainer
              center={cityCoordinates[location]}
              zoom={10}
              style={{ height: "100%", width: "100%", borderRadius: "8px" }}
              scrollWheelZoom={false}
            >
              <ChangeView center={cityCoordinates[location]} zoom={10} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={cityCoordinates[location]}>
                <Popup>
                  {location}
                </Popup>
              </Marker>
            </MapContainer>
          </Box>
        </Box>

        {/* Eye-catching Result Field */}
        {risk && (
          <Box
            mt={4}
            p={4}
            borderRadius="20px"
            textAlign="center"
            sx={{
              background: 
                risk === "High"
                  ? "linear-gradient(135deg, #ff6b6b, #ff8787)"
                  : risk === "Medium"
                  ? "linear-gradient(135deg, #ffd93d, #ffe066)"
                  : "linear-gradient(135deg, #51cf66, #74f1a4)",
              color: "#fff",
              boxShadow: risk === "High"
                ? "0 0 20px rgba(255, 107, 107, 0.6)"
                : risk === "Medium"
                ? "0 0 20px rgba(255, 217, 61, 0.5)"
                : "0 0 20px rgba(81, 207, 102, 0.5)",
              transform: "scale(1)",
              transition: "all 0.5s ease",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0 0 30px rgba(0,0,0,0.3)",
              },
            }}
          >
            <Typography variant="h5" mb={1} sx={{ fontWeight: 600, letterSpacing: 1 }}>
              Predicted Risk Level
            </Typography>
            <Typography
              variant="h2"
              fontWeight="bold"
              sx={{
                fontSize: { xs: "2.5rem", md: "3rem" },
                letterSpacing: 2,
                textShadow: "2px 2px 5px rgba(0,0,0,0.3)",
              }}
            >
              {risk}
            </Typography>
            {suggestion && (
              <Typography
                variant="body1"
                mt={2}
                fontStyle="italic"
                sx={{ fontSize: "1.1rem", lineHeight: 1.6 }}
              >
                {suggestion}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Risk-Based Snackbar Notification */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAlertOpen(false)}
          severity={alertColor}
          sx={{
            width: "100%",
            whiteSpace: "pre-line",
            fontSize: "1rem",
            fontWeight: 500,
            borderRadius: "12px",
            boxShadow: 3,
            padding: "12px 24px",
          }}
          elevation={6}
          variant="filled"
        >
          {alertText}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DisruptionForm;