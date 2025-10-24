import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Chip, Box, Typography, Card, CardContent,
  Grid, Collapse, Button, Dialog, DialogTitle, DialogContent,
  useTheme
} from '@mui/material';
import { Delete, Add, LocationOn, Whatshot, ExpandMore, ExpandLess, Map } from '@mui/icons-material';
import LocationMap from './LocationMap';

const LocationsTable = ({ 
  locations, 
  onDeleteLocation, 
  onDeleteSubLocation,
  onAddSubLocation 
}) => {
  const theme = useTheme();
  const [expandedLocation, setExpandedLocation] = useState(null);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Calculate risk score for a location
  const calculateRiskScore = (location) => {
    const baseScore = 
      (location.fireDevicesCount * 0.1) + 
      (location.cameraAreasCount * 0.05) + 
      (location.subLocations?.length || 0) * 0.2;
    return Math.min(Math.round(baseScore * 100), 100);
  };

  const calculateSubLocationRiskScore = (subLocation) => {
    const baseScore = (subLocation.deviceAssignments?.length || 0) * 0.4;
    return Math.min(Math.round(baseScore * 100), 100);
  };

  const getRiskColor = (score) => {
    if (score < 30) return 'success';
    if (score < 70) return 'warning';
    return 'error';
  };

  const toggleExpand = (locationId) => {
    setExpandedLocation(expandedLocation === locationId ? null : locationId);
  };

  const handleMapClick = (location) => {
    setSelectedLocation(location);
    setMapDialogOpen(true);
  };

  const handleCloseMapDialog = () => {
    setMapDialogOpen(false);
    setSelectedLocation(null);
  };

  // Get icon color based on theme
  const getIconColor = () => {
    return theme.palette.mode === 'dark' ? 'white' : 'inherit';
  };

  return (
    <Box>
      {/* Map Dialog */}
      <Dialog 
        open={mapDialogOpen} 
        onClose={handleCloseMapDialog}
        maxWidth="lg"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: theme.palette.background.paper,
          }
        }}
      >
        <DialogTitle sx={{ color: theme.palette.text.primary }}>
          📍 {selectedLocation?.name} - Location Map
          {selectedLocation?.coordinates && (
            <Typography variant="body2" color="textSecondary">
              Coordinates: {selectedLocation.coordinates.lat?.toFixed(4)}, {selectedLocation.coordinates.lng?.toFixed(4)}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: '500px', width: '100%' }}>
            <LocationMap locations={selectedLocation ? [selectedLocation] : []} />
          </Box>
          {selectedLocation && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: theme.palette.background.default, 
              borderRadius: 1,
              color: theme.palette.text.primary 
            }}>
              <Typography variant="h6">Location Details</Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Fire Devices:</strong> {selectedLocation.fireDevicesCount}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Camera Areas:</strong> {selectedLocation.cameraAreasCount}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Sub-locations:</strong> {selectedLocation.subLocations?.length || 0}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Risk Score:</strong> {calculateRiskScore(selectedLocation)}%
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Risk Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: theme.palette.background.paper }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Locations
              </Typography>
              <Typography variant="h5" component="div" sx={{ color: theme.palette.text.primary }}>
                {locations.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: theme.palette.background.paper }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Risk Score
              </Typography>
              <Typography variant="h5" component="div" color="warning.main">
                {locations.length > 0 
                  ? Math.round(locations.reduce((acc, loc) => acc + calculateRiskScore(loc), 0) / locations.length)
                  : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: theme.palette.background.paper }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                High Risk Locations
              </Typography>
              <Typography variant="h5" component="div" color="error.main">
                {locations.filter(loc => calculateRiskScore(loc) >= 70).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: theme.palette.background.paper }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Sub-locations
              </Typography>
              <Typography variant="h5" component="div" color="info.main">
                {locations.reduce((acc, loc) => acc + (loc.subLocations?.length || 0), 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Locations Table */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          backgroundColor: theme.palette.background.paper,
          '& .MuiTableCell-root': {
            color: theme.palette.text.primary,
            borderColor: theme.palette.divider
          }
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="5%"></TableCell>
              <TableCell width="20%">Location Name</TableCell>
              <TableCell width="15%">Coordinates</TableCell>
              <TableCell width="10%">Fire Devices</TableCell>
              <TableCell width="10%">Camera Areas</TableCell>
              <TableCell width="10%">Sub-locations</TableCell>
              <TableCell width="15%">Risk Score</TableCell>
              <TableCell width="15%">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {locations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="h6" color="textSecondary">
                    No locations added yet
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Click "Add Main Location" to get started
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              locations.map((location) => {
                const riskScore = calculateRiskScore(location);
                const hasSubLocations = location.subLocations && location.subLocations.length > 0;
                const hasCoordinates = location.coordinates && location.coordinates.lat && location.coordinates.lng;
                
                return (
                  <React.Fragment key={location.id}>
                    <TableRow 
                      hover 
                      sx={{ 
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover
                        }
                      }}
                    >
                      <TableCell>
                        {hasSubLocations && (
                          <IconButton 
                            size="small" 
                            onClick={() => toggleExpand(location.id)}
                            sx={{ color: getIconColor() }}
                          >
                            {expandedLocation === location.id ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationOn sx={{ color: getIconColor() }} />
                          <Typography fontWeight="bold" sx={{ color: theme.palette.text.primary }}>
                            {location.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        {hasCoordinates ? (
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip 
                              size="small"
                              label={`${location.coordinates.lat.toFixed(4)}, ${location.coordinates.lng.toFixed(4)}`}
                              variant="outlined"
                              onClick={() => handleMapClick(location)}
                              clickable
                              sx={{ 
                                color: theme.palette.text.primary,
                                borderColor: theme.palette.divider,
                                '&:hover': {
                                  borderColor: theme.palette.primary.main,
                                  backgroundColor: theme.palette.action.hover
                                }
                              }}
                            />
                            <IconButton 
                              size="small" 
                              onClick={() => handleMapClick(location)}
                              title="View on Map"
                              sx={{ color: getIconColor() }}
                            >
                              <Map />
                            </IconButton>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            No coordinates
                          </Typography>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Chip 
                          label={location.fireDevicesCount} 
                          variant="outlined"
                          sx={{
                            color: theme.palette.text.primary,
                            borderColor: theme.palette.error.main,
                            '& .MuiChip-label': {
                              color: theme.palette.text.primary
                            }
                          }}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Chip 
                          label={location.cameraAreasCount} 
                          variant="outlined"
                          sx={{
                            color: theme.palette.text.primary,
                            borderColor: theme.palette.secondary.main,
                            '& .MuiChip-label': {
                              color: theme.palette.text.primary
                            }
                          }}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Chip 
                          label={location.subLocations?.length || 0} 
                          variant="outlined"
                          sx={{
                            color: theme.palette.text.primary,
                            borderColor: hasSubLocations ? theme.palette.primary.main : theme.palette.divider,
                            '& .MuiChip-label': {
                              color: theme.palette.text.primary
                            }
                          }}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip 
                            label={`${riskScore}%`}
                            color={getRiskColor(riskScore)}
                            size="small"
                            sx={{
                              '& .MuiChip-label': {
                                color: theme.palette.mode === 'dark' ? 'white' : 'inherit'
                              }
                            }}
                          />
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <IconButton 
                            size="small"
                            onClick={() => onDeleteLocation(location.id)}
                            title="Delete Location"
                            sx={{ color: getIconColor() }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>

                    {/* Sub-locations */}
                    {hasSubLocations && (
                      <TableRow>
                        <TableCell colSpan={8} sx={{ p: 0, border: 0 }}>
                          <Collapse in={expandedLocation === location.id} timeout="auto" unmountOnExit>
                            <Box sx={{ 
                              bgcolor: theme.palette.background.default, 
                              p: 2,
                              color: theme.palette.text.primary
                            }}>
                              <Typography variant="h6" gutterBottom>
                                Sub-locations of {location.name}
                              </Typography>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ color: theme.palette.text.primary }}>Name</TableCell>
                                    <TableCell sx={{ color: theme.palette.text.primary }}>Coordinates</TableCell>
                                    <TableCell sx={{ color: theme.palette.text.primary }}>Device Assignments</TableCell>
                                    <TableCell sx={{ color: theme.palette.text.primary }}>Risk Score</TableCell>
                                    <TableCell sx={{ color: theme.palette.text.primary }}>Actions</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {location.subLocations.map((subLocation) => {
                                    const subRiskScore = calculateSubLocationRiskScore(subLocation);
                                    const subHasCoordinates = subLocation.coordinates && subLocation.coordinates.lat && subLocation.coordinates.lng;
                                    
                                    return (
                                      <TableRow 
                                        key={subLocation.id} 
                                        hover
                                        sx={{ 
                                          '&:hover': {
                                            backgroundColor: theme.palette.action.hover
                                          }
                                        }}
                                      >
                                        <TableCell>
                                          <Box display="flex" alignItems="center" gap={1}>
                                            <LocationOn sx={{ color: getIconColor() }} />
                                            <Typography sx={{ color: theme.palette.text.primary }}>
                                              {subLocation.name}
                                            </Typography>
                                          </Box>
                                        </TableCell>
                                        <TableCell>
                                          {subHasCoordinates ? (
                                            <Box display="flex" alignItems="center" gap={1}>
                                              <Chip 
                                                size="small"
                                                label={`${subLocation.coordinates.lat.toFixed(4)}, ${subLocation.coordinates.lng.toFixed(4)}`}
                                                variant="outlined"
                                                onClick={() => handleMapClick({
                                                  ...subLocation,
                                                  name: `${subLocation.name} (${location.name})`,
                                                  fireDevicesCount: 0,
                                                  cameraAreasCount: 0,
                                                  subLocations: []
                                                })}
                                                clickable
                                                sx={{ 
                                                  color: theme.palette.text.primary,
                                                  borderColor: theme.palette.divider,
                                                  '&:hover': {
                                                    borderColor: theme.palette.primary.main,
                                                    backgroundColor: theme.palette.action.hover
                                                  }
                                                }}
                                              />
                                              <IconButton 
                                                size="small" 
                                                onClick={() => handleMapClick({
                                                  ...subLocation,
                                                  name: `${subLocation.name} (${location.name})`,
                                                  fireDevicesCount: 0,
                                                  cameraAreasCount: 0,
                                                  subLocations: []
                                                })}
                                                title="View on Map"
                                                sx={{ color: getIconColor() }}
                                              >
                                                <Map />
                                              </IconButton>
                                            </Box>
                                          ) : (
                                            <Typography variant="body2" color="textSecondary">
                                              No coordinates
                                            </Typography>
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          <Chip 
                                            label={subLocation.deviceAssignments?.length || 0} 
                                            variant="outlined"
                                            size="small"
                                            sx={{
                                              color: theme.palette.text.primary,
                                              borderColor: theme.palette.divider,
                                              '& .MuiChip-label': {
                                                color: theme.palette.text.primary
                                              }
                                            }}
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Chip 
                                            label={`${subRiskScore}%`}
                                            color={getRiskColor(subRiskScore)}
                                            size="small"
                                            sx={{
                                              '& .MuiChip-label': {
                                                color: theme.palette.mode === 'dark' ? 'white' : 'inherit'
                                              }
                                            }}
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <IconButton 
                                            size="small"
                                            onClick={() => onDeleteSubLocation && onDeleteSubLocation(location.id, subLocation.id)}
                                            title="Delete Sub-location"
                                            sx={{ color: getIconColor() }}
                                          >
                                            <Delete />
                                          </IconButton>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Heatmap Legend */}
      <Box sx={{ 
        mt: 2, 
        p: 2, 
        bgcolor: theme.palette.background.default, 
        borderRadius: 1,
        color: theme.palette.text.primary 
      }}>
        <Typography variant="h6" gutterBottom>Risk Score Legend</Typography>
        <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
          <Box display="flex" alignItems="center">
            <Chip 
              label="0-30%" 
              color="success" 
              size="small" 
              sx={{
                '& .MuiChip-label': {
                  color: theme.palette.mode === 'dark' ? 'white' : 'inherit'
                }
              }}
            />
            <Typography variant="body2" sx={{ ml: 1 }}>Low Risk</Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <Chip 
              label="30-70%" 
              color="warning" 
              size="small" 
              sx={{
                '& .MuiChip-label': {
                  color: theme.palette.mode === 'dark' ? 'white' : 'inherit'
                }
              }}
            />
            <Typography variant="body2" sx={{ ml: 1 }}>Medium Risk</Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <Chip 
              label="70-100%" 
              color="error" 
              size="small" 
              sx={{
                '& .MuiChip-label': {
                  color: theme.palette.mode === 'dark' ? 'white' : 'inherit'
                }
              }}
            />
            <Typography variant="body2" sx={{ ml: 1 }}>High Risk</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LocationsTable;