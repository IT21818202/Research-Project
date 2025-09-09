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

const API_KEY = "a8927c216016b945b6ef3d9329f0cd0c";

const mitigationSuggestions = {
  Low: "No immediate action needed. Monitor weather conditions.",
  Medium: "Prepare contingency plans. Inform staff and check equipment.",
  High: "Activate backup plans immediately. Notify all stakeholders and consider event postponement or cancellation.",
};

const cityOptions = [
  "Colombo", "Kandy", "Hatton", "Galle", "Negombo", "Trincomalee",
  "Nuwara Eliya", "Anuradhapura", "Jaffna", "Batticaloa", "Matara",
  "Polonnaruwa", "Ratnapura", "Dambulla", "Badulla",
];

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

      <Box sx={{ width: "100%", maxWidth: 400 }}>
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

        {risk && (
          <Box
            mt={4}
            p={3}
            borderRadius="16px"
            border="2px solid"
            textAlign="center"
            bgcolor={
              risk === "High"
                ? colors.redAccent[100]
                : risk === "Medium"
                ? colors.yellowAccent[100]
                : colors.greenAccent[100]
            }
            borderColor={
              risk === "High"
                ? colors.redAccent[500]
                : risk === "Medium"
                ? colors.yellowAccent[500]
                : colors.greenAccent[500]
            }
          >
            <Typography variant="h5" mb={1}>
              Predicted Risk Level:
            </Typography>
            <Typography variant="h3" fontWeight="bold">
              {risk}
            </Typography>
            {suggestion && (
              <Typography variant="body1" mt={2} fontStyle="italic">
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
