import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Chip,
  Stack,
} from "@mui/material";
import axios from "axios";

const alertTypes = [
  { label: "All", value: "" },
  { label: "Weather", value: "weather" },
  { label: "Fire", value: "fire" },
  { label: "Crowd", value: "crowd" },
  { label: "Security", value: "security" },
];

const riskColors = {
  High: "#d32f2f",   // red
  Medium: "#ed6c02", // orange
  Low: "#2e7d32",    // green
};

const RiskAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (typeFilter) params.type = typeFilter;
      if (searchText) params.search = searchText;
      const response = await axios.get("http://localhost:5000/api/alerts", {
        params,
      });
      setAlerts(response.data);
    } catch (error) {
      console.error("Failed to fetch alerts", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAlerts();
  }, [typeFilter, searchText]);

  return (
    <Box p={2} bgcolor="#222" borderRadius={2} color="#eee" minHeight={400}>
      <Typography variant="h5" mb={2}>
        Risk Alerts History
      </Typography>

      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField
          select
          label="Filter by Type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          {alertTypes.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Search alerts"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="small"
          sx={{ flexGrow: 1, minWidth: 200 }}
        />
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : alerts.length === 0 ? (
        <Typography>No alerts found.</Typography>
      ) : (
        <Stack spacing={2} maxHeight={320} overflow="auto">
          {alerts.map((alert) => (
            <Box
              key={alert.id}
              p={2}
              bgcolor="#333"
              borderRadius={1}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              gap={1}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {alert.zone}
                </Typography>
                <Typography>{alert.message}</Typography>
                <Typography variant="caption" color="gray">
                  {new Date(alert.timestamp).toLocaleString()}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                }}
              >
                <Chip
                  label={alert.risk}
                  sx={{
                    backgroundColor: riskColors[alert.risk],
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                  size="small"
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {alert.type.toUpperCase()}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default RiskAlerts;
