import { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import BarChart from "../../components/BarChart";
import ProgressCircle from "../../components/ProgressCircle";
import axios from "axios";

// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default icon issue in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Live location state
  const [position, setPosition] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // Live date-time state
  const [liveDateTime, setLiveDateTime] = useState(new Date());

  // Update live date-time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Get user geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    const success = (pos) => {
      const { latitude, longitude } = pos.coords;
      setPosition([latitude, longitude]);
    };

    const error = (err) => {
      setLocationError("Unable to retrieve your location");
      console.error(err);
    };

    navigator.geolocation.getCurrentPosition(success, error);
  }, []);

  // Component to recenter map on user position change
  function RecenterMap({ latlng }) {
    const map = useMap();
    useEffect(() => {
      if (latlng) {
        map.setView(latlng, 13);
      }
    }, [latlng, map]);
    return null;
  }

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="DASHBOARD"
          subtitle="Welcome to the Event Management dashboard"
        />
        <Button
          sx={{
            backgroundColor: colors.blueAccent[700],
            color: colors.grey[100],
            fontSize: "14px",
            fontWeight: "bold",
            padding: "10px 20px",
          }}
        >
          <DownloadOutlinedIcon sx={{ mr: "10px" }} />
          Download Reports
        </Button>
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* TRAFFIC LINE CHART */}
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                Traffic Rise & Fall
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                Once A While
              </Typography>
            </Box>
            <IconButton>
              <DownloadOutlinedIcon
                sx={{ fontSize: "26px", color: colors.greenAccent[500] }}
              />
            </IconButton>
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <LineChart isDashboard={true} />
          </Box>
        </Box>

        {/* LIVE DATE AND TIME BOX (Stylish) */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          sx={{
            background: `linear-gradient(135deg, ${colors.greenAccent[600]}, ${colors.blueAccent[700]})`,
            borderRadius: "16px",
            boxShadow: `0 4px 20px ${colors.greenAccent[700]}`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            p: "30px",
            color: colors.grey[100],
            userSelect: "none",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              letterSpacing: "2px",
              fontWeight: 700,
              textTransform: "uppercase",
              mb: 1,
              color: colors.grey[300],
              textShadow: `0 0 8px ${colors.grey[400]}`,
            }}
          >
            Current Date
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              letterSpacing: "3px",
              textTransform: "uppercase",
              textShadow: `0 0 12px ${colors.grey[100]}`,
              mb: 2,
            }}
          >
            {liveDateTime.toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Typography>
          <Typography
            variant="h2"
            component="div"
            sx={{
              fontFamily: "'Roboto Mono', monospace",
              fontWeight: 700,
              letterSpacing: "6px",
              color: colors.grey[50],
              textShadow: `0 0 14px ${colors.grey[100]}`,
            }}
          >
            {liveDateTime.toLocaleTimeString()}
          </Typography>
        </Box>

        {/* CROWD DISTRIBUTION */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          p="30px"
        >
          <Typography variant="h5" fontWeight="600">
            Crowd Distribution
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            mt="25px"
          >
            <ProgressCircle size="125" />
            <Typography
              variant="h5"
              color={colors.greenAccent[500]}
              sx={{ mt: "15px" }}
            >
              --------------------
            </Typography>
            <Typography>---------------------------</Typography>
          </Box>
        </Box>

        {/* HOURLY CROWD BAR CHART */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: "30px 30px 0 30px" }}
          >
            Hourly Crowd Rise and Fall
          </Typography>
          <Box height="250px" mt="-20px">
            <BarChart isDashboard={true} />
          </Box>
        </Box>

        {/* LIVE LOCATION MAP */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          padding="15px"
          display="flex"
          flexDirection="column"
        >
          <Typography variant="h5" fontWeight="600" sx={{ mb: 2 }}>
            Live Location
          </Typography>

          {locationError ? (
            <Typography color={colors.redAccent[400]}>
              {locationError}
            </Typography>
          ) : position ? (
            <Box flex={1} sx={{ height: "250px" }}>
              <MapContainer
                center={position}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%", borderRadius: "8px" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                  <Popup>Your Current Location</Popup>
                </Marker>
                <RecenterMap latlng={position} />
              </MapContainer>
            </Box>
          ) : (
            <Typography color={colors.grey[300]}>Locating...</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
