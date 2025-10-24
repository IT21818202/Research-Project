import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Button, Box, Grid, Snackbar, Alert,
  CircularProgress
} from '@mui/material';
import { AddLocation, Refresh } from '@mui/icons-material';
import AddMainLocationDialog from './AddMainLocationDialog';
import LocationsTable from './LocationsTable';
import LocationMap from './LocationMap';

const LocationManagement = () => {
  const [locations, setLocations] = useState([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  // Debug: Log when component mounts and state changes
  useEffect(() => {
    console.log('📍 LocationManagement Component Mounted');
    console.log('📍 Current locations state:', locations);
  }, [locations]);

  // Fetch locations from backend
  const fetchLocations = async () => {
    try {
      console.log('🔄 Starting to fetch locations...');
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/locations');
      console.log('📡 API Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Locations fetched successfully:', data);
        setLocations(data);
      } else {
        console.error('❌ API Error:', response.status, response.statusText);
        throw new Error(`Failed to fetch locations: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error fetching locations:', error);
      showSnackbar('Error loading locations: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load locations on component mount
  useEffect(() => {
    console.log('🚀 Component mounted, fetching locations...');
    fetchLocations();
  }, []);

  const handleAddMainLocation = async (newLocation) => {
    try {
      console.log('➕ Adding new location:', newLocation);
      const response = await fetch('http://localhost:5000/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLocation),
      });

      console.log('📡 Add location response status:', response.status);

      if (response.ok) {
        const savedLocation = await response.json();
        console.log('✅ Location saved successfully:', savedLocation);
        setLocations(prev => [...prev, savedLocation]);
        setAddDialogOpen(false);
        showSnackbar('Location added successfully!', 'success');
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to save location:', errorText);
        throw new Error('Failed to save location: ' + errorText);
      }
    } catch (error) {
      console.error('❌ Error adding location:', error);
      showSnackbar('Error adding location: ' + error.message, 'error');
    }
  };

  const handleDeleteLocation = async (locationId) => {
    try {
      console.log('🗑️ Deleting location:', locationId);
      const response = await fetch(`http://localhost:5000/api/locations/${locationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('✅ Location deleted successfully');
        setLocations(prev => prev.filter(loc => loc.id !== locationId));
        showSnackbar('Location deleted successfully!', 'info');
      } else {
        throw new Error('Failed to delete location');
      }
    } catch (error) {
      console.error('❌ Error deleting location:', error);
      showSnackbar('Error deleting location', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    console.log('📢 Snackbar:', message, severity);
    setSnackbar({ open: true, message, severity });
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading locations...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Debug Info Box */}
     
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Location Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchLocations}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddLocation />}
            onClick={() => setAddDialogOpen(true)}
          >
            Add Main Location
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Map Section */}
       

        {/* Stats Sidebar */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="h6" gutterBottom>Location Statistics</Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">Total Locations</Typography>
              <Typography variant="h5">{locations.length}</Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">Total Sub-locations</Typography>
              <Typography variant="h5">
                {locations.reduce((acc, loc) => acc + (loc.subLocations?.length || 0), 0)}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">Total Fire Devices</Typography>
              <Typography variant="h5" color="error.main">
                {locations.reduce((acc, loc) => acc + loc.fireDevicesCount, 0)}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="textSecondary">Total Camera Areas</Typography>
              <Typography variant="h5" color="primary.main">
                {locations.reduce((acc, loc) => acc + loc.cameraAreasCount, 0)}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Table Section */}
        <Grid item xs={12}>
          <LocationsTable
            locations={locations}
            onDeleteLocation={handleDeleteLocation}
            onAddSubLocation={() => {
              console.log('Add sub-location clicked');
            }}
          />
        </Grid>
      </Grid>

      {/* Dialogs */}
      <AddMainLocationDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleAddMainLocation}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LocationManagement;