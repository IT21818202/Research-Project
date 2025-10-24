import React, { useState } from 'react';
import {
  Box, Typography, Paper, List, ListItem, ListItemText,
  ListItemIcon, IconButton, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Divider, Grid
} from '@mui/material';
import {
  LocalFireDepartment, CameraAlt, Edit, Delete,
  Add, Warning, SignalCellularAlt, Build
} from '@mui/icons-material';

const DeviceList = ({ devices, onEditDevice, onDeleteDevice, onAddDevice, location }) => {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'alert': return <Warning color="error" />;
      case 'offline': return <SignalCellularAlt color="disabled" />;
      case 'maintenance': return <Build color="warning" />;
      default: return <SignalCellularAlt color="success" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'alert': return 'error';
      case 'offline': return 'default';
      case 'maintenance': return 'warning';
      default: return 'success';
    }
  };

  const handleDeviceClick = (device) => {
    setSelectedDevice(device);
    setDetailDialogOpen(true);
  };

  const handleEdit = (device) => {
    setDetailDialogOpen(false);
    onEditDevice(device);
  };

  const handleDelete = (deviceId) => {
    setDetailDialogOpen(false);
    onDeleteDevice(deviceId);
  };

  if (!devices || devices.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Devices Found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Add devices to monitor this location
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<Add />}
          onClick={() => onAddDevice(location)}
        >
          Add First Device
        </Button>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">
          Devices ({devices.length})
        </Typography>
        <Button 
          variant="contained" 
          size="small" 
          startIcon={<Add />}
          onClick={() => onAddDevice(location)}
        >
          Add Device
        </Button>
      </Box>

      {/* Devices List */}
      <List sx={{ maxHeight: 400, overflow: 'auto' }}>
        {devices.map((device, index) => (
          <React.Fragment key={device.id}>
            <ListItem 
              sx={{ 
                border: 1, 
                borderColor: 'divider', 
                borderRadius: 2, 
                mb: 1,
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <ListItemIcon>
                {device.type === 'fire' ? 
                  <LocalFireDepartment color="error" /> : 
                  <CameraAlt color="primary" />
                }
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle1" fontWeight="500">
                      {device.name}
                    </Typography>
                    <Chip 
                      label={device.status} 
                      size="small"
                      color={getStatusColor(device.status)}
                      icon={getStatusIcon(device.status)}
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {device.type === 'fire' ? 'Fire Detection Device' : 'Surveillance Camera'}
                    </Typography>
                    {device.description && (
                      <Typography variant="body2" color="text.secondary">
                        {device.description}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      Coordinates: {device.coordinates?.lat?.toFixed(4) || 'N/A'}, {device.coordinates?.lng?.toFixed(4) || 'N/A'}
                    </Typography>
                  </Box>
                }
              />
              
              <Box display="flex" gap={1}>
                <IconButton 
                  size="small" 
                  onClick={() => handleDeviceClick(device)}
                  color="info"
                >
                  <Edit />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this device?')) {
                      onDeleteDevice(device.id);
                    }
                  }}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </Box>
            </ListItem>
            {index < devices.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>

      {/* Device Detail Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            {selectedDevice?.type === 'fire' ? 
              <LocalFireDepartment color="error" /> : 
              <CameraAlt color="primary" />
            }
            Device Details
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedDevice && (
            <Box>
              <Typography variant="h6" gutterBottom>{selectedDevice.name}</Typography>
              
              <Box display="flex" gap={1} sx={{ mb: 2 }}>
                <Chip 
                  label={selectedDevice.type} 
                  color={selectedDevice.type === 'fire' ? 'error' : 'primary'}
                  variant="outlined"
                />
                <Chip 
                  label={selectedDevice.status} 
                  color={getStatusColor(selectedDevice.status)}
                  icon={getStatusIcon(selectedDevice.status)}
                />
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Location</Typography>
                  <Typography variant="body1">{location?.name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Coordinates</Typography>
                  <Typography variant="body1">
                    {selectedDevice.coordinates?.lat?.toFixed(4) || 'N/A'}, {selectedDevice.coordinates?.lng?.toFixed(4) || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>

              {selectedDevice.type === 'fire' && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Sensitivity Intensity</Typography>
                  <Typography variant="body1">{Math.round((selectedDevice.intensity || 0) * 100)}%</Typography>
                </Box>
              )}

              {selectedDevice.type === 'camera' && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Coverage Radius</Typography>
                  <Typography variant="body1">{selectedDevice.coverage || 100} meters</Typography>
                </Box>
              )}

              {selectedDevice.description && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Description</Typography>
                  <Typography variant="body1">{selectedDevice.description}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          <Button 
            variant="outlined" 
            onClick={() => handleEdit(selectedDevice)}
            startIcon={<Edit />}
          >
            Edit Device
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this device?')) {
                handleDelete(selectedDevice.id);
              }
            }}
            startIcon={<Delete />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeviceList;