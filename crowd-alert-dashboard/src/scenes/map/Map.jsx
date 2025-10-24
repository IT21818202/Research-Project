import { useEffect } from "react";
import { Box } from "@mui/material";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const LiveMap = () => {
  useEffect(() => {
    // Initialize the map
    const map = L.map("map").setView([14.0860746, 100.608406], 6);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    let marker, circle;

    // Create a custom icon
    const customIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by your browser.");
      return;
    }

    // Update location every 5 seconds
    const intervalId = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;

          // Remove old marker and circle if they exist
          if (marker) map.removeLayer(marker);
          if (circle) map.removeLayer(circle);

          // Add new marker with custom icon and accuracy circle
          marker = L.marker([latitude, longitude], { icon: customIcon })
            .addTo(map)
            .bindPopup(`Your location<br>Accuracy: ${Math.round(accuracy)} meters`)
            .openPopup();
          
          circle = L.circle([latitude, longitude], { 
            radius: accuracy,
            color: '#3388ff',
            fillColor: '#3388ff',
            fillOpacity: 0.2
          }).addTo(map);

          // Fit map to the marker and circle
          const featureGroup = L.featureGroup([marker, circle]).addTo(map);
          map.fitBounds(featureGroup.getBounds());

          console.log(
            `Latitude: ${latitude}, Longitude: ${longitude}, Accuracy: ${accuracy}m`
          );
        },
        (error) => {
          console.error("Error getting location:", error.message);
        }
      );
    }, 5000);

    // Cleanup on component unmount
    return () => {
      clearInterval(intervalId);
      map.remove();
    };
  }, []);

  return (
    <Box sx={{ 
      height: "calc(100vh - 64px)", 
      width: "100%",
      borderRadius: 2,
      overflow: "hidden",
      boxShadow: 3
    }}>
      <div id="map" style={{ height: "100%", width: "100%" }} />
    </Box>
  );
};

export default LiveMap;