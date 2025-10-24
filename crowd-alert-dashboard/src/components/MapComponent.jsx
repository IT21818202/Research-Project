import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from "@mui/material";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  ZoomControl
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"
});

// Custom icons
const createCustomIcon = (iconUrl, iconSize = [25, 41], iconAnchor = [12, 41]) =>
  new L.Icon({
    iconUrl,
    iconSize,
    iconAnchor,
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

const fireIcon = createCustomIcon(
  "https://cdn-icons-png.flaticon.com/512/482/482057.png"
);
const crowdIcon = createCustomIcon(
  "https://cdn-icons-png.flaticon.com/512/747/747376.png"
);
const defaultIcon = createCustomIcon(
  "https://cdn-icons-png.flaticon.com/512/854/854878.png"
);

const MapComponent = ({ locations = [] }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);
  const mapRef = useRef();

  // Default center (Colombo, SL)
  const defaultCenter = [6.9271, 79.8612];

  // Pick coordinates
  const getCoordinates = (obj, fallback = defaultCenter) => {
    if (obj && obj.coordinates && obj.coordinates.lat && obj.coordinates.lng) {
      return [obj.coordinates.lat, obj.coordinates.lng];
    }
    return fallback;
  };

  // Handle marker click
  const handleMarkerClick = (event) => {
    event.target.openPopup();
  };

  // Show alert dialog
  const showAlert = (subLocation, mainLocation, alertType) => {
    setCurrentAlert({ subLocation, mainLocation, alertType });
    setAlertDialogOpen(true);
  };

  // Get icon for a sub-location (simulated)
  const getIconForLocation = (subLocation) => {
    const hasFireAlert = Math.random() > 0.85;
    const hasCrowdAlert = Math.random() > 0.8;

    if (hasFireAlert) return fireIcon;
    if (hasCrowdAlert) return crowdIcon;
    return defaultIcon;
  };

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />

        {locations.map((mainLocation) => {
          const mainId = mainLocation._id || mainLocation.id;
          const mainCoords = getCoordinates(mainLocation);

          return (
            <React.Fragment key={mainId}>
              {/* Main Location Marker */}
              <Marker
                position={mainCoords}
                icon={defaultIcon}
                eventHandlers={{ click: handleMarkerClick }}
              >
                <Popup>
                  <Box>
                    <Typography variant="h6">{mainLocation.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Fire Devices: {mainLocation.fireDevicesCount}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Camera Areas: {mainLocation.cameraAreasCount}
                    </Typography>
                  </Box>
                </Popup>
                <Tooltip direction="top" offset={[0, -20]} opacity={0.9} permanent>
                  {mainLocation.name}
                </Tooltip>
              </Marker>

              {/* Sub-Locations */}
              {(mainLocation.subLocations || []).map((sub, index) => {
                const subId = sub._id || sub.id || index;
                const subCoords = getCoordinates(sub, mainCoords);

                return (
                  <Marker
                    key={`${mainId}-${subId}`}
                    position={subCoords}
                    icon={getIconForLocation(sub)}
                    eventHandlers={{ click: handleMarkerClick }}
                  >
                    <Popup>
                      <Box sx={{ minWidth: 200 }}>
                        <Typography variant="h6" gutterBottom>
                          {sub.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Part of: {mainLocation.name}
                        </Typography>

                        {sub.deviceAssignments &&
                          sub.deviceAssignments.map((d, i) => (
                            <Chip
                              key={i}
                              label={`${d.device} → ${d.cameraArea}`}
                              size="small"
                              sx={{ m: 0.5 }}
                            />
                          ))}

                        <Box mt={2}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<InfoIcon />}
                            onClick={() =>
                              setSelectedLocation({ subLocation: sub, mainLocation })
                            }
                          >
                            View Details
                          </Button>
                        </Box>
                      </Box>
                    </Popup>
                    <Tooltip
                      direction="top"
                      offset={[0, -20]}
                      opacity={0.9}
                      permanent
                    >
                      {sub.name}
                    </Tooltip>
                  </Marker>
                );
              })}
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* 🔔 Alert Dialog */}
      <Dialog open={alertDialogOpen} onClose={() => setAlertDialogOpen(false)}>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <WarningIcon color="error" sx={{ mr: 1 }} />
            {currentAlert?.alertType === "fire" ? "Fire Alert" : "Crowd Alert"}
          </Box>
        </DialogTitle>
        <DialogContent>
          {currentAlert && (
            <Box>
              <Typography variant="h6">{currentAlert.subLocation.name}</Typography>
              <Typography variant="body2">
                Location: {currentAlert.mainLocation.name}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertDialogOpen(false)}>Dismiss</Button>
        </DialogActions>
      </Dialog>

      {/* 📍 Location Details Dialog */}
      <Dialog
        open={!!selectedLocation}
        onClose={() => setSelectedLocation(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Location Details: {selectedLocation?.subLocation?.name}
        </DialogTitle>
        <DialogContent>
          {selectedLocation && (
            <Box>
              <Typography variant="body1" gutterBottom>
                <strong>Main Location:</strong> {selectedLocation.mainLocation.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Fire Devices:</strong> {selectedLocation.mainLocation.fireDevicesCount}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Camera Areas:</strong> {selectedLocation.mainLocation.cameraAreasCount}
              </Typography>

              {selectedLocation.subLocation.deviceAssignments &&
                selectedLocation.subLocation.deviceAssignments.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="h6">Device Assignments</Typography>
                    {selectedLocation.subLocation.deviceAssignments.map((a, i) => (
                      <Paper key={i} elevation={1} sx={{ p: 1, mb: 1 }}>
                        <Typography variant="body2">
                          <strong>Device:</strong> {a.device}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Camera Area:</strong> {a.cameraArea}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedLocation(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MapComponent;
