import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Button, Box, Grid, Snackbar, Alert
} from '@mui/material';
import { AddLocation } from '@mui/icons-material';
import AddMainLocationDialog from './AddMainLocationDialog';
import AddSubLocationDialog from './AddSubLocationDialog';
import LocationsTable from './LocationsTable';
import LocationMap from './LocationMap';

const LocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addSubDialogOpen, setAddSubDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load locations from localStorage on component mount
  useEffect(() => {
    console.log('Component mounted - loading from localStorage');
    const savedLocations = localStorage.getItem('locations');
    if (savedLocations) {
      console.log('Found saved locations:', JSON.parse(savedLocations));
      setLocations(JSON.parse(savedLocations));
    } else {
      console.log('No saved locations found');
    }
  }, []);

  // Save locations to localStorage whenever locations change
  useEffect(() => {
    console.log('Locations updated, saving to localStorage:', locations);
    localStorage.setItem('locations', JSON.stringify(locations));
  }, [locations]);

  const handleAddMainLocation = (newLocation) => {
    console.log('handleAddMainLocation called with:', newLocation);
    
    const locationWithId = {
      ...newLocation,
      id: Date.now().toString(),
      subLocations: newLocation.subLocations || []
    };
    
    console.log('Adding location with ID:', locationWithId);
    
    setLocations(prevLocations => {
      const updatedLocations = [...prevLocations, locationWithId];
      console.log('Updated locations array:', updatedLocations);
      return updatedLocations;
    });
    
    setAddDialogOpen(false);
    showSnackbar('Location added successfully!', 'success');
  };

  const handleDeleteLocation = (locationId) => {
    console.log('Deleting location:', locationId);
    setLocations(prevLocations => prevLocations.filter(loc => loc.id !== locationId));
    showSnackbar('Location deleted successfully!', 'info');
  };

  const showSnackbar = (message, severity = 'success') => {
    console.log('Showing snackbar:', message, severity);
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Location Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddLocation />}
          onClick={() => {
            console.log('Add location button clicked');
            setAddDialogOpen(true);
          }}
        >
          Add Main Location
        </Button>
      </Box>

      {/* Debug Info */}
      <Box sx={{ mb: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
        <Typography variant="h6">Debug Information</Typography>
        <Typography>Total Locations: {locations.length}</Typography>
        <Typography>Locations in state: {JSON.stringify(locations.map(l => l.name))}</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Map Section */}
        <Grid item xs={12} lg={8}>
          <LocationMap locations={locations} />
        </Grid>

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
            onAddSubLocation={(location) => {
              console.log('Add sub-location for:', location);
              setSelectedLocation(location);
              setAddSubDialogOpen(true);
            }}
          />
        </Grid>
      </Grid>

      {/* Dialogs */}
      <AddMainLocationDialog
        open={addDialogOpen}
        onClose={() => {
          console.log('Dialog closed');
          setAddDialogOpen(false);
        }}
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

export default LocationsPage;