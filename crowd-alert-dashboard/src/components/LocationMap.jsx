import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Box, Typography, Paper, Chip, IconButton, Button, 
  Switch, FormControlLabel, Dialog, DialogTitle, DialogContent,
  DialogActions, List, ListItem, ListItemText, ListItemIcon,
  useTheme, TextField, MenuItem, Grid, Alert
} from '@mui/material';
import {
  Warning, CameraAlt, LocalFireDepartment, ZoomIn,
  LocationOn, GpsFixed, Close, Edit, Delete, Add
} from '@mui/icons-material';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createCustomIcon = (color, iconType = 'default') => {
  const iconSizes = {
    fire: [30, 30],
    camera: [28, 28],
    device: [25, 25],
    default: [25, 41]
  };

  const size = iconSizes[iconType] || iconSizes.default;
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: ${size[0]}px;
        height: ${size[1]}px;
        border-radius: ${iconType === 'default' ? '0' : '50%'};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
      ">
        ${iconType === 'fire' ? '🔥' : iconType === 'camera' ? '📹' : '📍'}
      </div>
    `,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1] / 2],
    className: 'custom-icon'
  });
};

// Map Controller Component for Zooming
const MapController = ({ center, zoomLevel }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && zoomLevel) {
      map.setView(center, zoomLevel);
    }
  }, [center, zoomLevel, map]);
  
  return null;
};

const LocationMap = ({ locations, onDeviceUpdate }) => {
  const theme = useTheme();
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showDevices, setShowDevices] = useState(true);
  const [zoomedArea, setZoomedArea] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [deviceDetailsOpen, setDeviceDetailsOpen] = useState(false);
  const [addDeviceOpen, setAddDeviceOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [newDevicePosition, setNewDevicePosition] = useState(null);
  const mapRef = useRef();
  
  const defaultCenter = [6.9271, 79.8612];
  const defaultZoom = 10;

  // Get all devices from localStorage
  const getAllDevices = () => {
    const savedDevices = JSON.parse(localStorage.getItem('devices') || '[]');
    return savedDevices;
  };

  // Save devices to localStorage
  const saveDevices = (devices) => {
    localStorage.setItem('devices', JSON.stringify(devices));
    if (onDeviceUpdate) {
      onDeviceUpdate(devices);
    }
  };

  // Calculate risk intensity for heatmap
  const calculateRiskIntensity = (location) => {
    const locationDevices = getAllDevices().filter(device => device.locationId === location.id);
    
    const baseIntensity = Math.min(
      (location.fireDevicesCount * 0.3) + 
      (location.cameraAreasCount * 0.2) + 
      (location.subLocations?.length || 0) * 0.2, 
      0.8
    );
    
    // Add actual device status factors
    const alertDevices = locationDevices.filter(d => d.status === 'alert').length;
    const offlineDevices = locationDevices.filter(d => d.status === 'offline').length;
    
    const statusFactor = (alertDevices * 0.15) + (offlineDevices * 0.05);
    return Math.min(baseIntensity + statusFactor, 1.0);
  };

  const getHeatmapColor = (intensity) => {
    if (intensity < 0.3) return '#4CAF50'; // Green
    if (intensity < 0.5) return '#FFEB3B'; // Yellow
    if (intensity < 0.7) return '#FF9800'; // Orange
    if (intensity < 0.8) return '#F44336'; // Red
    return '#D32F2F'; // Dark Red
  };

  const getHeatmapRadius = (intensity, locationType = 'main') => {
    const baseRadius = intensity * 800;
    return locationType === 'main' ? baseRadius : baseRadius * 0.6;
  };

  const getHeatmapOpacity = (intensity) => {
    return intensity * 0.3;
  };

  const handleZoomToLocation = (location, isSubLocation = false) => {
    if (location.coordinates) {
      const center = [location.coordinates.lat, location.coordinates.lng];
      const radius = getHeatmapRadius(calculateRiskIntensity(location), isSubLocation ? 'sub' : 'main');
      const zoomLevel = isSubLocation ? 16 : 14;
      
      setZoomedArea({
        center,
        radius,
        location: location.name,
        type: isSubLocation ? 'sub' : 'main'
      });
    }
  };

  const handleResetZoom = () => {
    setZoomedArea(null);
  };

  const getDeviceIcon = (device) => {
    if (device.type === 'fire') {
      return createCustomIcon(device.status === 'alert' ? '#ff4444' : '#ff9800', 'fire');
    } else if (device.type === 'camera') {
      return createCustomIcon(device.status === 'offline' ? '#9e9e9e' : '#2196f3', 'camera');
    }
    return createCustomIcon('#4caf50', 'device');
  };

  // Handle map click for adding devices
  const handleMapClick = (e) => {
    if (addDeviceOpen && !editingDevice) {
      setNewDevicePosition(e.latlng);
    }
  };

  // Add new device
  const handleAddDevice = (deviceData) => {
    const devices = getAllDevices();
    const newDevice = {
      id: `device-${Date.now()}`,
      ...deviceData,
      coordinates: newDevicePosition || deviceData.coordinates,
      status: 'normal'
    };
    
    devices.push(newDevice);
    saveDevices(devices);
    setAddDeviceOpen(false);
    setNewDevicePosition(null);
    setEditingDevice(null);
  };

  // Update existing device
  const handleUpdateDevice = (deviceData) => {
    const devices = getAllDevices();
    const updatedDevices = devices.map(device => 
      device.id === editingDevice.id 
        ? { ...device, ...deviceData, coordinates: newDevicePosition || deviceData.coordinates }
        : device
    );
    
    saveDevices(updatedDevices);
    setAddDeviceOpen(false);
    setNewDevicePosition(null);
    setEditingDevice(null);
  };

  // Delete device
  const handleDeleteDevice = (deviceId) => {
    const devices = getAllDevices();
    const updatedDevices = devices.filter(device => device.id !== deviceId);
    saveDevices(updatedDevices);
  };

  // Move device
  const handleMoveDevice = (device, newPosition) => {
    const devices = getAllDevices();
    const updatedDevices = devices.map(d => 
      d.id === device.id 
        ? { ...d, coordinates: { lat: newPosition.lat, lng: newPosition.lng } }
        : d
    );
    
    saveDevices(updatedDevices);
  };

  // Get icon color based on theme
  const getIconColor = () => {
    return theme.palette.mode === 'dark' ? 'white' : 'inherit';
  };

  return (
    <Box sx={{ position: 'relative', height: '500px', width: '100%' }}>
      {/* Control Panel */}
      <Box sx={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1000,
        background: theme.palette.background.paper,
        padding: 2,
        borderRadius: 2,
        boxShadow: 3,
        minWidth: 200,
        color: theme.palette.text.primary,
        border: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>
          Map Controls
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
              color="primary"
            />
          }
          label="Show Heatmap"
          sx={{ color: theme.palette.text.primary }}
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={showDevices}
              onChange={(e) => setShowDevices(e.target.checked)}
              color="primary"
            />
          }
          label="Show Devices"
          sx={{ color: theme.palette.text.primary }}
        />

        <Button 
          variant="contained" 
          size="small" 
          startIcon={<Add />}
          onClick={() => setAddDeviceOpen(true)}
          sx={{ 
            mt: 1,
            width: '100%'
          }}
        >
          Add Device
        </Button>
        
        {zoomedArea && (
          <Button 
            variant="outlined" 
            size="small" 
            onClick={handleResetZoom}
            sx={{ 
              mt: 1,
              width: '100%',
              color: theme.palette.text.primary,
              borderColor: theme.palette.divider,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: theme.palette.action.hover
              }
            }}
          >
            Reset View
          </Button>
        )}
      </Box>

      {/* Statistics Panel */}
      <Box sx={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 1000,
        background: theme.palette.background.paper,
        padding: 2,
        borderRadius: 2,
        boxShadow: 3,
        minWidth: 200,
        color: theme.palette.text.primary,
        border: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>
          Device Stats
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
          Total Locations: {locations.length}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
          Total Devices: {getAllDevices().length}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
          Fire Alerts: {getAllDevices().filter(d => d.status === 'alert').length}
        </Typography>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={() => setDeviceDetailsOpen(true)}
          sx={{ 
            mt: 1,
            width: '100%',
            color: theme.palette.text.primary,
            borderColor: theme.palette.divider,
            '&:hover': {
              borderColor: theme.palette.primary.main,
              backgroundColor: theme.palette.action.hover
            }
          }}
        >
          View All Devices
        </Button>
      </Box>

      <MapContainer 
        center={zoomedArea?.center || defaultCenter} 
        zoom={zoomedArea ? 15 : defaultZoom} 
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        onClick={handleMapClick}
      >
        <MapController 
          center={zoomedArea?.center} 
          zoomLevel={zoomedArea ? 15 : defaultZoom} 
        />
        
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Heatmap Circles */}
        {showHeatmap && locations.map((location) => {
          if (location.coordinates && location.coordinates.lat && location.coordinates.lng) {
            const intensity = calculateRiskIntensity(location);
            
            return (
              <React.Fragment key={`heat-main-${location.id}`}>
                <Circle
                  center={[location.coordinates.lat, location.coordinates.lng]}
                  radius={getHeatmapRadius(intensity, 'main')}
                  pathOptions={{
                    fillColor: getHeatmapColor(intensity),
                    color: getHeatmapColor(intensity),
                    weight: 2,
                    opacity: 0.6,
                    fillOpacity: getHeatmapOpacity(intensity)
                  }}
                  eventHandlers={{
                    click: () => handleZoomToLocation(location, false)
                  }}
                >
                  <Popup>
                    <Box sx={{ 
                      minWidth: 200, 
                      color: theme.palette.text.primary,
                      bgcolor: theme.palette.background.paper
                    }}>
                      <Typography variant="h6">{location.name}</Typography>
                      <Typography variant="body2">
                        Risk Intensity: {Math.round(intensity * 100)}%
                      </Typography>
                      <Typography variant="body2">
                        Fire Devices: {getAllDevices().filter(d => d.locationId === location.id && d.type === 'fire').length}
                      </Typography>
                      <Typography variant="body2">
                        Cameras: {getAllDevices().filter(d => d.locationId === location.id && d.type === 'camera').length}
                      </Typography>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={() => handleZoomToLocation(location, false)}
                        startIcon={<ZoomIn sx={{ color: getIconColor() }} />}
                        sx={{ 
                          mt: 1,
                          color: theme.palette.text.primary,
                          borderColor: theme.palette.divider,
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            backgroundColor: theme.palette.action.hover
                          }
                        }}
                      >
                        Zoom to Area
                      </Button>
                    </Box>
                  </Popup>
                </Circle>
              </React.Fragment>
            );
          }
          return null;
        })}

        {/* Device Markers */}
        {showDevices && getAllDevices().map((device) => (
          <Marker
            key={device.id}
            position={[device.coordinates.lat, device.coordinates.lng]}
            icon={getDeviceIcon(device)}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                handleMoveDevice(device, position);
              },
              click: (e) => {
                // Prevent popup when in edit mode
                if (!addDeviceOpen) {
                  e.target.openPopup();
                }
              }
            }}
          >
            <Popup>
              <Box sx={{ 
                minWidth: 200, 
                color: theme.palette.text.primary,
                bgcolor: theme.palette.background.paper
              }}>
                <Typography variant="h6" gutterBottom>
                  {device.type === 'fire' ? '🔥 ' : '📹 '}{device.name}
                </Typography>
                <Chip 
                  label={device.status.toUpperCase()} 
                  color={
                    device.status === 'alert' ? 'error' : 
                    device.status === 'offline' ? 'default' : 'success'
                  }
                  size="small"
                  sx={{
                    '& .MuiChip-label': {
                      color: theme.palette.mode === 'dark' ? 'white' : 'inherit'
                    }
                  }}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Location: {device.location}
                </Typography>
                {device.type === 'fire' && (
                  <Typography variant="body2">
                    Intensity: {Math.round(device.intensity * 100)}%
                  </Typography>
                )}
                {device.type === 'camera' && (
                  <Typography variant="body2">
                    Coverage: {device.coverage}m
                  </Typography>
                )}
                
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => {
                      setEditingDevice(device);
                      setAddDeviceOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => handleDeleteDevice(device.id)}
                  >
                    Delete
                  </Button>
                </Box>
                
                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                  Drag to move device
                </Typography>
              </Box>
            </Popup>
          </Marker>
        ))}

        {/* New Device Position Marker */}
        {newDevicePosition && (
          <Marker
            position={[newDevicePosition.lat, newDevicePosition.lng]}
            icon={createCustomIcon('#ff4081', 'device')}
          >
            <Popup>
              <Typography>New device position</Typography>
            </Popup>
          </Marker>
        )}

        {/* Zoomed Area Boundary */}
        {zoomedArea && (
          <Circle
            center={zoomedArea.center}
            radius={zoomedArea.radius}
            pathOptions={{
              fillColor: '#667eea',
              color: '#667eea',
              weight: 3,
              opacity: 0.6,
              fillOpacity: 0.1,
              dashArray: '10, 5'
            }}
          >
            <Popup>
              <Box sx={{ 
                color: theme.palette.text.primary,
                bgcolor: theme.palette.background.paper
              }}>
                <Typography variant="h6">
                  {zoomedArea.location} - Focus Area
                </Typography>
              </Box>
            </Popup>
          </Circle>
        )}
      </MapContainer>

      {/* Add/Edit Device Dialog */}
      <AddDeviceDialog
        open={addDeviceOpen}
        onClose={() => {
          setAddDeviceOpen(false);
          setEditingDevice(null);
          setNewDevicePosition(null);
        }}
        onSave={editingDevice ? handleUpdateDevice : handleAddDevice}
        locations={locations}
        editingDevice={editingDevice}
        newDevicePosition={newDevicePosition}
      />

      {/* Device Details Dialog */}
      <DeviceDetailsDialog
        open={deviceDetailsOpen}
        onClose={() => setDeviceDetailsOpen(false)}
        devices={getAllDevices()}
        onEditDevice={(device) => {
          setEditingDevice(device);
          setDeviceDetailsOpen(false);
          setAddDeviceOpen(true);
        }}
        onDeleteDevice={handleDeleteDevice}
        theme={theme}
      />

      {/* Heatmap Legend */}
      {showHeatmap && (
        <Box sx={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          zIndex: 1000,
          background: theme.palette.background.paper,
          padding: 2,
          borderRadius: 2,
          boxShadow: 3,
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.divider}`
        }}>
          <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>
            Risk Intensity
          </Typography>
          {[
            { color: '#4CAF50', label: 'Low (0-30%)' },
            { color: '#FFEB3B', label: 'Medium (30-50%)' },
            { color: '#FF9800', label: 'High (50-70%)' },
            { color: '#F44336', label: 'Very High (70-80%)' },
            { color: '#D32F2F', label: 'Critical (80-100%)' }
          ].map((item, index) => (
            <Box key={index} display="flex" alignItems="center" sx={{ mb: 1 }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  backgroundColor: item.color,
                  borderRadius: '50%',
                  mr: 1,
                  border: '1px solid #ccc'
                }}
              />
              <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

// Add/Edit Device Dialog Component
const AddDeviceDialog = ({ open, onClose, onSave, locations, editingDevice, newDevicePosition }) => {
  const theme = useTheme();
  const [deviceData, setDeviceData] = useState({
    name: '',
    type: 'fire',
    locationId: '',
    status: 'normal',
    intensity: 0.5,
    coverage: 100
  });

  useEffect(() => {
    if (editingDevice) {
      setDeviceData(editingDevice);
    } else {
      setDeviceData({
        name: '',
        type: 'fire',
        locationId: locations[0]?.id || '',
        status: 'normal',
        intensity: 0.5,
        coverage: 100
      });
    }
  }, [editingDevice, locations]);

  const handleSave = () => {
    if (!deviceData.name || !deviceData.locationId) {
      alert('Please fill in all required fields');
      return;
    }

    const selectedLocation = locations.find(loc => loc.id === deviceData.locationId);
    const deviceWithLocation = {
      ...deviceData,
      location: selectedLocation?.name || 'Unknown',
      coordinates: newDevicePosition || selectedLocation?.coordinates || { lat: 6.9271, lng: 79.8612 }
    };

    onSave(deviceWithLocation);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: theme.palette.text.primary }}>
        {editingDevice ? 'Edit Device' : 'Add New Device'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Device Name"
              value={deviceData.name}
              onChange={(e) => setDeviceData({ ...deviceData, name: e.target.value })}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Device Type"
              value={deviceData.type}
              onChange={(e) => setDeviceData({ ...deviceData, type: e.target.value })}
            >
              <MenuItem value="fire">Fire Sensor</MenuItem>
              <MenuItem value="camera">Camera</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Location"
              value={deviceData.locationId}
              onChange={(e) => setDeviceData({ ...deviceData, locationId: e.target.value })}
            >
              {locations.map((location) => (
                <MenuItem key={location.id} value={location.id}>
                  {location.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Status"
              value={deviceData.status}
              onChange={(e) => setDeviceData({ ...deviceData, status: e.target.value })}
            >
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="alert">Alert</MenuItem>
              <MenuItem value="offline">Offline</MenuItem>
            </TextField>
          </Grid>
          
          {deviceData.type === 'fire' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Intensity"
                value={deviceData.intensity}
                onChange={(e) => setDeviceData({ ...deviceData, intensity: parseFloat(e.target.value) })}
                inputProps={{ min: 0, max: 1, step: 0.1 }}
              />
            </Grid>
          )}
          
          {deviceData.type === 'camera' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Coverage (meters)"
                value={deviceData.coverage}
                onChange={(e) => setDeviceData({ ...deviceData, coverage: parseInt(e.target.value) })}
              />
            </Grid>
          )}
          
          {newDevicePosition && (
            <Grid item xs={12}>
              <Alert severity="info">
                New position: {newDevicePosition.lat.toFixed(4)}, {newDevicePosition.lng.toFixed(4)}
              </Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {editingDevice ? 'Update' : 'Add'} Device
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Device Details Dialog Component
const DeviceDetailsDialog = ({ open, onClose, devices, onEditDevice, onDeleteDevice, theme }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          backgroundImage: 'none'
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
            All Devices Overview
          </Typography>
          <IconButton 
            onClick={onClose}
            sx={{ color: theme.palette.text.primary }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: theme.palette.background.paper }}>
        <List>
          {devices.map((device) => (
            <ListItem 
              key={device.id} 
              divider
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                '&:last-child': {
                  borderBottom: 'none'
                }
              }}
            >
              <ListItemIcon>
                {device.type === 'fire' ? 
                  <LocalFireDepartment sx={{ color: theme.palette.text.primary }} /> : 
                  <CameraAlt sx={{ color: theme.palette.text.primary }} />
                }
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ color: theme.palette.text.primary }}>
                    {device.name}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Location: {device.location}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Status: {device.status}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Coordinates: {device.coordinates.lat.toFixed(4)}, {device.coordinates.lng.toFixed(4)}
                    </Typography>
                  </Box>
                }
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  size="small"
                  onClick={() => onEditDevice(device)}
                  sx={{ color: theme.palette.text.primary }}
                >
                  <Edit />
                </IconButton>
                <IconButton 
                  size="small"
                  onClick={() => onDeleteDevice(device.id)}
                  sx={{ color: theme.palette.error.main }}
                >
                  <Delete />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions sx={{ 
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        padding: '16px 24px'
      }}>
        <Button 
          onClick={onClose}
          sx={{
            color: theme.palette.text.primary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LocationMap;