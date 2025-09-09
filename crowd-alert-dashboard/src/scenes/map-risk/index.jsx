import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  Polygon,
  FeatureGroup,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { io } from "socket.io-client";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

const socket = io("http://localhost:5000");

const RISK_COLORS = {
  low: "green",
  medium: "orange",
  high: "red",
};

const fixedLocations = [
  { name: "Stage Area 🎤", position: [6.9152, 79.9725] },
  { name: "Food Court 🍱", position: [6.9149, 79.9718] },
  { name: "Main Lecture Halls 🏫", position: [6.9147, 79.9721] },
  { name: "Library Entrance 🛗", position: [6.9151, 79.9714] },
  { name: "Main Gate 🚪", position: [6.9137, 79.9716] },
];

export default function MapDashboardPage() {
  const [zones, setZones] = useState([]);
  const [isAdmin, setIsAdmin] = useState(true);
  const [alertMsg, setAlertMsg] = useState("");
  const [satelliteView, setSatelliteView] = useState(false);
  const mapRef = useRef();
  const featureGroupRef = useRef();

  useEffect(() => {
    fetchZones();

    socket.on("new_zone", (zone) => setZones((prev) => [...prev, zone]));
    socket.on("update_zones", (allZones) => setZones(allZones));
    socket.on("reset_zones", () => setZones([]));
    socket.on("high_risk_alert", (data) => setAlertMsg(data.message));

    return () => {
      socket.off("new_zone");
      socket.off("update_zones");
      socket.off("reset_zones");
      socket.off("high_risk_alert");
    };
  }, []);

  const fetchZones = async () => {
    try {
      const res = await axios.get("http://localhost:5000/zones");
      setZones(res.data);
    } catch (err) {
      console.error("Fetch zones failed", err);
    }
  };

  const onCreated = async (e) => {
    const { layer } = e;
    const coordinates = layer.getLatLngs()[0].map((latlng) => [latlng.lat, latlng.lng]);

    let risk = prompt("Enter risk level: low, medium, or high")?.toLowerCase();
    if (!["low", "medium", "high"].includes(risk)) {
      alert("Invalid risk level. Zone not saved.");
      featureGroupRef.current.removeLayer(layer);
      return;
    }

    layer.setStyle({
      color: RISK_COLORS[risk],
      fillColor: RISK_COLORS[risk],
      fillOpacity: 0.4,
    });

    layer.bindTooltip(risk.toUpperCase(), {
      permanent: true,
      direction: "center",
      className: "risk-tooltip",
      offset: [0, 0],
      opacity: 1,
    }).openTooltip();

    try {
      await axios.post("http://localhost:5000/zones", { type: "polygon", coordinates, risk });
      fetchZones();
    } catch (error) {
      console.error("Failed to save zone:", error);
    }
  };

  const renderZones = () =>
    zones.map((zone, idx) => (
      <Polygon
        key={idx}
        positions={zone.coordinates}
        pathOptions={{
          color: RISK_COLORS[zone.risk],
          fillColor: RISK_COLORS[zone.risk],
          fillOpacity: 0.4,
        }}
      >
        <Tooltip
          direction="center"
          permanent
          className="risk-tooltip"
          offset={[0, 0]}
          opacity={1}
        >
          <span style={{ fontWeight: "bold", color: RISK_COLORS[zone.risk] }}>
            {zone.risk.toUpperCase()}
          </span>
        </Tooltip>
      </Polygon>
    ));

  const riskCounts = zones.reduce(
    (acc, zone) => {
      acc[zone.risk] += 1;
      return acc;
    },
    { low: 0, medium: 0, high: 0 }
  );

  return (
    <div className="bg-[#0d1117] text-white min-h-screen px-4 py-6">
      {/* Top Panel */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">🗺️ Event Risk Monitoring Dashboard</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setIsAdmin(!isAdmin)}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white"
          >
            Switch to {isAdmin ? "Viewer" : "Admin"}
          </button>
          <button
            onClick={() => setSatelliteView(!satelliteView)}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-white"
          >
            {satelliteView ? "Show Map" : "Show Satellite"}
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {alertMsg && (
        <div className="bg-red-600 text-white font-bold text-center py-2 rounded mb-4 animate-pulse">
          ⚠️ {alertMsg}
        </div>
      )}

      {/* Risk Summary */}
      <div className="bg-[#161b22] p-4 rounded-lg shadow mb-4 grid grid-cols-3 gap-4 text-center text-lg font-medium">
        <div className="text-green-400">🟢 Low Risk: {riskCounts.low}</div>
        <div className="text-orange-400">🟠 Medium Risk: {riskCounts.medium}</div>
        <div className="text-red-400">🔴 High Risk: {riskCounts.high}</div>
      </div>

      {/* Map */}
      <div className="rounded-lg shadow overflow-hidden">
        <MapContainer
          center={[6.9147, 79.9721]}
          zoom={18}
          style={{ height: "75vh", width: "100%" }}
          scrollWheelZoom={true}
          ref={mapRef}
        >
          {satelliteView ? (
            <TileLayer
              // Using Esri WorldImagery for satellite tiles (free to use)
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            />
          ) : (
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          )}

          {fixedLocations.map((loc, idx) => (
            <Marker key={idx} position={loc.position}>
              <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
                {loc.name}
              </Tooltip>
            </Marker>
          ))}

          <FeatureGroup ref={featureGroupRef}>
            {isAdmin && (
              <EditControl
                position="topright"
                onCreated={onCreated}
                draw={{
                  polygon: true,
                  rectangle: false,
                  circle: false,
                  marker: false,
                  polyline: false,
                }}
                edit={{
                  edit: true,
                  remove: true,
                }}
              />
            )}
            {renderZones()}
          </FeatureGroup>
        </MapContainer>
      </div>
    </div>
  );
}
