import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  IconButton,
  Card,
  CardContent,
  Chip,
  Divider,
  useTheme
} from '@mui/material';
import { Delete, Add, Whatshot, Videocam, Sensors } from '@mui/icons-material';

const DeviceManagementDialog = ({ open, location, onClose, onSave }) => {
  const theme = useTheme();
  const [fireDevices, setFireDevices] = useState([]);
  const [cameraDevices, setCameraDevices] = useState([]);
  const [newFireDevice, setNewFireDevice] = useState({ name: '', type: 'smoke', status: 'active' });
  const [newCameraDevice, setNewCameraDevice] = useState({ name: '', resolution: '1080p', status: 'active' });

  useEffect(() => {
    if (location) {
      setFireDevices(location.fireDevices || []);
      setCameraDevices(location.cameraDevices || []);
    }
  }, [location]);

  const handleAddFireDevice = () => {
    if (newFireDevice.name.trim()) {
      const device = {
        id: Date.now().toString(),
        ...newFireDevice,
        lastMaintenance: new Date().toISOString().split('T')[0]
      };
      setFireDevices(prev => [...prev, device]);
      setNewFireDevice({ name: '', type: 'smoke', status: 'active' });
    }
  };

  const handleAddCameraDevice = () => {
    if (newCameraDevice.name.trim()) {
      const device = {
        id: Date.now().toString(),
        ...newCameraDevice,
        installationDate: new Date().toISOString().split('T')[0]
      };
      setCameraDevices(prev => [...prev, device]);
      setNewCameraDevice({ name: '', resolution: '1080p', status: 'active' });
    }
  };

  const handleDeleteFireDevice = (deviceId) => {
    setFireDevices(prev => prev.filter(device => device.id !== deviceId));
  };

  const handleDeleteCameraDevice = (deviceId) => {
    setCameraDevices(prev => prev.filter(device => device.id !== deviceId));
  };

  const handleSave = () => {
    const updatedLocation = {
      ...location,
      fireDevices,
      cameraDevices,
      fireDevicesCount: fireDevices.length,
      cameraAreasCount: cameraDevices.length
    };
    onSave(updatedLocation);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'maintenance': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getDeviceTypeColor = (type) => {
    switch (type) {
      case 'smoke': return 'error';
      case 'heat': return 'warning';
      case 'flame': return 'error';
      default: return 'primary';
    }
  };

  if (!location) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Sensors />
          Device Management - {location.name}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Fire Devices Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Whatshot color="error" />
            Fire Detection Devices ({fireDevices.length})
          </Typography>
          
          {/* Add New Fire Device */}
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>Add New Fire Device</Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Device Name"
                    value={newFireDevice.name}
                    onChange={(e) => setNewFireDevice({ ...newFireDevice, name: e.target.value })}
                    placeholder="e.g., Smoke Detector 01"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Type"
                    value={newFireDevice.type}
                    onChange={(e) => setNewFireDevice({ ...newFireDevice, type: e.target.value })}
                    SelectProps={{ native: true }}
                  >
                    <option value="smoke">Smoke Detector</option>
                    <option value="heat">Heat Detector</option>
                    <option value="flame">Flame Detector</option>
                    <option value="sprinkler">Sprinkler System</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Status"
                    value={newFireDevice.status}
                    onChange={(e) => setNewFireDevice({ ...newFireDevice, status: e.target.value })}
                    SelectProps={{ native: true }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleAddFireDevice}
                    disabled={!newFireDevice.name.trim()}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Fire Devices List */}
          <Grid container spacing={2}>
            {fireDevices.map((device) => (
              <Grid item xs={12} sm={6} key={device.id}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    backgroundColor: theme.palette.background.default,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover
                    }
                  }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="between" alignItems="start" mb={1}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {device.name}
                      </Typography>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteFireDevice(device.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                    
                    <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                      <Chip 
                        label={device.type} 
                        size="small"
                        color={getDeviceTypeColor(device.type)}
                        variant="outlined"
                      />
                      <Chip 
                        label={device.status} 
                        size="small"
                        color={getStatusColor(device.status)}
                      />
                    </Box>
                    
                    <Typography variant="caption" color="textSecondary">
                      Last Maintenance: {device.lastMaintenance}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            
            {fireDevices.length === 0 && (
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary" textAlign="center" py={2}>
                  No fire devices added yet
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Camera Devices Section */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Videocam color="primary" />
            Camera Devices ({cameraDevices.length})
          </Typography>
          
          {/* Add New Camera Device */}
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>Add New Camera</Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Camera Name"
                    value={newCameraDevice.name}
                    onChange={(e) => setNewCameraDevice({ ...newCameraDevice, name: e.target.value })}
                    placeholder="e.g., Entrance Camera 01"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Resolution"
                    value={newCameraDevice.resolution}
                    onChange={(e) => setNewCameraDevice({ ...newCameraDevice, resolution: e.target.value })}
                    SelectProps={{ native: true }}
                  >
                    <option value="720p">720p HD</option>
                    <option value="1080p">1080p Full HD</option>
                    <option value="4k">4K Ultra HD</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Status"
                    value={newCameraDevice.status}
                    onChange={(e) => setNewCameraDevice({ ...newCameraDevice, status: e.target.value })}
                    SelectProps={{ native: true }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleAddCameraDevice}
                    disabled={!newCameraDevice.name.trim()}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Camera Devices List */}
          <Grid container spacing={2}>
            {cameraDevices.map((device) => (
              <Grid item xs={12} sm={6} key={device.id}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    backgroundColor: theme.palette.background.default,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover
                    }
                  }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="between" alignItems="start" mb={1}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {device.name}
                      </Typography>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteCameraDevice(device.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                    
                    <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                      <Chip 
                        label={device.resolution} 
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                      <Chip 
                        label={device.status} 
                        size="small"
                        color={getStatusColor(device.status)}
                      />
                    </Box>
                    
                    <Typography variant="caption" color="textSecondary">
                      Installed: {device.installationDate}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            
            {cameraDevices.length === 0 && (
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary" textAlign="center" py={2}>
                  No camera devices added yet
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Devices
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeviceManagementDialog;