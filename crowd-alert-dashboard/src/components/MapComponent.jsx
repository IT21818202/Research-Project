import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix icon not showing issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapComponent({ lat, lng, city }) {
  if (!lat || !lng) return null;

  return (
    <div style={{ height: "300px", marginTop: 20 }}>
      <MapContainer center={[lat, lng]} zoom={10} style={{ height: "100%" }} key={city}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat, lng]}>
          <Popup>{city}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
