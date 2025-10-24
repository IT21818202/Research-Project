// AddSubLocationDialog.js - Updated version with coordinate input
import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Typography, Chip,
  FormControl, InputLabel, Select, MenuItem, Grid
} from '@mui/material';

const AddSubLocationDialog = ({ open, onClose, onSave, location }) => {
  const [name, setName] = useState('');
  const [deviceAssignments, setDeviceAssignments] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [selectedCamera, setSelectedCamera] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  const generateDeviceOptions = () => {
    if (!location) return [];
    return Array.from({ length: location.fireDevicesCount }, (_, i) => `Device ${i + 1}`);
  };

  const generateCameraOptions = () => {
    if (!location) return [];
    return Array.from({ length: location.cameraAreasCount }, (_, i) => `Area ${String.fromCharCode(65 + i)}`);
  };

  const handleAddAssignment = () => {
    if (selectedDevice && selectedCamera) {
      setDeviceAssignments([
        ...deviceAssignments,
        { device: selectedDevice, cameraArea: selectedCamera }
      ]);
      setSelectedDevice('');
      setSelectedCamera('');
    }
  };

  const handleRemoveAssignment = (index) => {
    setDeviceAssignments(deviceAssignments.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const coordinates = lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : {};
    
    onSave({
      name,
      deviceAssignments,
      coordinates
    });
    
    // Reset form
    setName('');
    setDeviceAssignments([]);
    setLat('');
    setLng('');
  };

  if (!location) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Add Sub-Location to {location.name}
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3} mt={1}>
          <TextField
            label="Sub-Location Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />
          
          <Typography variant="h6">Coordinates (Optional)</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Latitude"
                type="number"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                fullWidth
                placeholder="e.g., 6.9271"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Longitude"
                type="number"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                fullWidth
                placeholder="e.g., 79.8612"
              />
            </Grid>
          </Grid>
          
          <Typography variant="h6">Device Assignments</Typography>
          
          <Box display="flex" gap={2} alignItems="flex-end">
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Device</InputLabel>
              <Select
                value={selectedDevice}
                label="Device"
                onChange={(e) => setSelectedDevice(e.target.value)}
              >
                {generateDeviceOptions().map(device => (
                  <MenuItem key={device} value={device}>{device}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Camera Area</InputLabel>
              <Select
                value={selectedCamera}
                label="Camera Area"
                onChange={(e) => setSelectedCamera(e.target.value)}
              >
                {generateCameraOptions().map(area => (
                  <MenuItem key={area} value={area}>{area}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button 
              variant="outlined" 
              onClick={handleAddAssignment}
              disabled={!selectedDevice || !selectedCamera}
            >
              Add Assignment
            </Button>
          </Box>
          
          {deviceAssignments.length > 0 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Current Assignments:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {deviceAssignments.map((assignment, index) => (
                  <Chip
                    key={index}
                    label={`${assignment.device} → ${assignment.cameraArea}`}
                    onDelete={() => handleRemoveAssignment(index)}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={!name}
        >
          Save Sub-Location
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSubLocationDialog;