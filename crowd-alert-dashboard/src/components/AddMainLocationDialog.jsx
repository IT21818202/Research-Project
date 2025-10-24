import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Typography, Card,
  Chip, Alert, CircularProgress, List, ListItem, ListItemText,
  ListItemIcon, Divider, IconButton,
  useTheme
} from '@mui/material';
import { 
  LocationOn, 
  MyLocation, 
  Search, 
  Place, 
  Close,
  Add,
  GpsFixed
} from '@mui/icons-material';

const AddMainLocationDialog = ({ open, onClose, onSave }) => {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [fireDevicesCount, setFireDevicesCount] = useState(1);
  const [cameraAreasCount, setCameraAreasCount] = useState(1);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const searchTimeoutRef = useRef(null);

  // Check if dark mode is active
  const isDarkMode = theme.palette.mode === 'dark';

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setName('');
      setFireDevicesCount(1);
      setCameraAreasCount(1);
      setLat('');
      setLng('');
      setSearchResults([]);
      setSearchError("");
    }
  }, [open]);

  // Debounced geocoding search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (name && name.length > 2) {
      setIsSearching(true);
      setSearchError("");
      
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/api/geocode?q=${encodeURIComponent(name)}`
          );
          
          if (response.ok) {
            const data = await response.json();
            setSearchResults(data.results || []);
          } else {
            const errorData = await response.json();
            setSearchError(errorData.error || "Search failed");
            setSearchResults([]);
          }
        } catch (error) {
          setSearchError("Search service unavailable");
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 800);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [name]);

  const handleLocationSelect = (result) => {
    const shortName = result.name.split(',')[0];
    setName(shortName);
    setLat(result.lat.toString());
    setLng(result.lng.toString());
    setSearchResults([]);
  };

  const handleSave = () => {
    const coordinates = lat && lng ? { 
      lat: parseFloat(lat), 
      lng: parseFloat(lng) 
    } : {};
    
    const newLocation = {
      name: name.trim(),
      fireDevicesCount: parseInt(fireDevicesCount),
      cameraAreasCount: parseInt(cameraAreasCount),
      subLocations: [],
      coordinates
    };
    
    onSave(newLocation);
    
    // Reset form
    setName('');
    setFireDevicesCount(1);
    setCameraAreasCount(1);
    setLat('');
    setLng('');
    setSearchResults([]);
    setSearchError("");
  };

  const quickLocations = [
    { name: "Colombo", lat: 6.9271, lng: 79.8612 },
    { name: "Kandy", lat: 7.2906, lng: 80.6337 },
    { name: "Galle", lat: 6.0535, lng: 80.2210 },
    { name: "Jaffna", lat: 9.6615, lng: 80.0255 }
  ];

  // Dynamic styles based on theme
  const getDialogBackground = () => {
    return isDarkMode 
      ? 'linear-gradient(135deg, rgba(30,30,40,0.95) 0%, rgba(25,25,35,0.98) 100%)'
      : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.98) 100%)';
  };

  const getCardBackground = () => {
    return isDarkMode
      ? 'linear-gradient(135deg, rgba(50,50,60,0.8) 0%, rgba(45,45,55,0.9) 100%)'
      : 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.9) 100%)';
  };

  const getCardBorder = () => {
    return isDarkMode 
      ? '1px solid rgba(255,255,255,0.1)'
      : '1px solid rgba(255,255,255,0.5)';
  };

  const getInputBackground = () => {
    return isDarkMode 
      ? 'rgba(255,255,255,0.05)'
      : 'rgba(255,255,255,0.6)';
  };

  const getHoverBackground = () => {
    return isDarkMode
      ? 'linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.15) 100%)'
      : 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)';
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          background: getDialogBackground(),
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          boxShadow: isDarkMode 
            ? '0 20px 60px rgba(0,0,0,0.4)'
            : '0 20px 60px rgba(0,0,0,0.15)',
          border: isDarkMode 
            ? '1px solid rgba(255,255,255,0.1)'
            : '1px solid rgba(255,255,255,0.3)',
          overflow: 'hidden'
        }
      }}
    >
      {/* Header with Gradient Background */}
      <DialogTitle sx={{ 
        p: 0,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <Box sx={{ p: 3, pb: 2.5 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <Box sx={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 2,
                p: 1,
                backdropFilter: 'blur(10px)'
              }}>
                <LocationOn sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight="700" sx={{ mb: 0.5 }}>
                  Add New Location
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Search and configure your location details
                </Typography>
              </Box>
            </Box>
            <IconButton 
              onClick={onClose} 
              size="small"
              sx={{ 
                color: 'white',
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  background: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Search Section with Glassmorphism */}
        <Box sx={{ p: 3, pb: 2 }}>
          <Card sx={{
            background: getCardBackground(),
            backdropFilter: 'blur(10px)',
            border: getCardBorder(),
            borderRadius: 2,
            boxShadow: isDarkMode 
              ? '0 8px 32px rgba(0,0,0,0.3)'
              : '0 8px 32px rgba(0,0,0,0.1)',
            p: 2.5,
            mb: 2
          }}>
            <Typography variant="subtitle1" fontWeight="600" color="text.primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Search color="primary" />
              Search Location
            </Typography>
            
            <TextField
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter location name (e.g., SLIIT Malabe, Kandy HNB)..."
              sx={{ 
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  background: getInputBackground(),
                  backdropFilter: 'blur(10px)',
                  borderRadius: 1.5,
                  color: 'text.primary',
                  '& fieldset': {
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                    boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.1)'
                  }
                },
                '& .MuiInputBase-input::placeholder': {
                  color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
                  opacity: 1,
                }
              }}
              InputProps={{
                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1, opacity: 0.7 }} />,
                endAdornment: isSearching && (
                  <CircularProgress size={20} sx={{ color: 'primary.main' }} />
                )
              }}
            />

            {searchError && (
              <Alert severity="warning" sx={{ 
                mt: 1,
                background: isDarkMode ? 'rgba(255,152,0,0.1)' : 'rgba(255,152,0,0.1)',
                border: isDarkMode ? '1px solid rgba(255,152,0,0.3)' : '1px solid rgba(255,152,0,0.2)',
                borderRadius: 1.5,
                color: 'text.primary'
              }}>
                {searchError}
              </Alert>
            )}
          </Card>

          {/* Search Results with Animated Appearance */}
          {searchResults.length > 0 && (
            <Card sx={{ 
              mb: 2,
              background: getCardBackground(),
              backdropFilter: 'blur(10px)',
              border: getCardBorder(),
              borderRadius: 2,
              boxShadow: isDarkMode 
                ? '0 8px 32px rgba(0,0,0,0.3)'
                : '0 8px 32px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              animation: 'slideDown 0.3s ease-out',
              '@keyframes slideDown': {
                from: { opacity: 0, transform: 'translateY(-10px)' },
                to: { opacity: 1, transform: 'translateY(0)' }
              }
            }}>
              <Box sx={{ 
                p: 2, 
                borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                background: 'linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.08) 100%)'
              }}>
                <Typography variant="subtitle2" color="text.primary" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Place fontSize="small" />
                  Select Location ({searchResults.length} found)
                </Typography>
              </Box>
              <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                {searchResults.map((result, index) => (
                  <React.Fragment key={index}>
                    <ListItem 
                      button 
                      onClick={() => handleLocationSelect(result)}
                      sx={{ 
                        py: 1.5,
                        transition: 'all 0.2s ease',
                        color: 'text.primary',
                        '&:hover': { 
                          background: getHoverBackground(),
                          transform: 'translateX(4px)'
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 44 }}>
                        <Box sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: 1.5,
                          p: 0.75,
                          color: 'white'
                        }}>
                          <Place fontSize="small" />
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" color="text.primary" fontWeight="500">
                            {result.name.split(',')[0]}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {result.lat.toFixed(4)}, {result.lng.toFixed(4)}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < searchResults.length - 1 && (
                      <Divider sx={{ opacity: isDarkMode ? 0.2 : 0.3 }} />
                    )}
                  </React.Fragment>
                ))}
              </List>
            </Card>
          )}

          {/* Selected Location with Gradient Border */}
          {(lat && lng) && (
            <Card sx={{
              mb: 2,
              background: getCardBackground(),
              border: '2px solid transparent',
              backgroundImage: isDarkMode 
                ? 'linear-gradient(rgba(30,30,40,0.9), rgba(30,30,40,0.9)), linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(white, white), linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(102,126,234,0.15)',
              p: 2.5
            }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 2,
                  p: 1,
                  color: 'white'
                }}>
                  <MyLocation fontSize="small" />
                </Box>
                <Box flex={1}>
                  <Typography variant="subtitle2" fontWeight="600" color="text.primary">
                    Location Selected
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {name}
                  </Typography>
                  <Chip 
                    size="small" 
                    label={`${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`}
                    sx={{ 
                      mt: 0.5,
                      background: getHoverBackground(),
                      color: 'primary.main',
                      fontWeight: 500,
                      border: isDarkMode ? '1px solid rgba(102,126,234,0.3)' : 'none'
                    }}
                  />
                </Box>
              </Box>
            </Card>
          )}

          {/* Quick Locations */}
          <Card sx={{
            background: getCardBackground(),
            backdropFilter: 'blur(10px)',
            border: getCardBorder(),
            borderRadius: 2,
            boxShadow: isDarkMode 
              ? '0 8px 32px rgba(0,0,0,0.3)'
              : '0 8px 32px rgba(0,0,0,0.1)',
            p: 2.5,
            mb: 2
          }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <GpsFixed fontSize="small" />
              Quick Locations
            </Typography>
            <Box display="flex" gap={1.5} flexWrap="wrap">
              {quickLocations.map((location) => (
                <Chip
                  key={location.name}
                  label={location.name}
                  size="small"
                  onClick={() => {
                    setName(location.name);
                    setLat(location.lat.toString());
                    setLng(location.lng.toString());
                  }}
                  sx={{
                    background: getHoverBackground(),
                    border: isDarkMode 
                      ? '1px solid rgba(102,126,234,0.4)'
                      : '1px solid rgba(102,126,234,0.2)',
                    color: 'primary.main',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(102,126,234,0.3)'
                    }
                  }}
                />
              ))}
            </Box>
          </Card>

          {/* Manual Coordinates & Device Configuration */}
          <Box display="flex" gap={2}>
            {/* Manual Coordinates */}
            <Card sx={{
              flex: 1,
              background: getCardBackground(),
              backdropFilter: 'blur(10px)',
              border: getCardBorder(),
              borderRadius: 2,
              boxShadow: isDarkMode 
                ? '0 8px 32px rgba(0,0,0,0.3)'
                : '0 8px 32px rgba(0,0,0,0.1)',
              p: 2.5
            }}>
              <Typography variant="subtitle2" fontWeight="600" color="text.primary" gutterBottom>
                Manual Coordinates
              </Typography>
              <Box display="flex" gap={1.5}>
                <TextField
                  label="Latitude"
                  type="number"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="6.9271"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: getInputBackground(),
                      borderRadius: 1.5,
                      color: 'text.primary',
                      '& fieldset': {
                        borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'text.secondary',
                    }
                  }}
                />
                <TextField
                  label="Longitude"
                  type="number"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="79.8612"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: getInputBackground(),
                      borderRadius: 1.5,
                      color: 'text.primary',
                      '& fieldset': {
                        borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'text.secondary',
                    }
                  }}
                />
              </Box>
            </Card>

            {/* Device Configuration */}
            <Card sx={{
              flex: 1,
              background: getCardBackground(),
              backdropFilter: 'blur(10px)',
              border: getCardBorder(),
              borderRadius: 2,
              boxShadow: isDarkMode 
                ? '0 8px 32px rgba(0,0,0,0.3)'
                : '0 8px 32px rgba(0,0,0,0.1)',
              p: 2.5
            }}>
              <Typography variant="subtitle2" fontWeight="600" color="text.primary" gutterBottom>
                Device Config
              </Typography>
              <Box display="flex" gap={1.5}>
                <TextField
                  label="Fire Devices"
                  type="number"
                  value={fireDevicesCount}
                  onChange={(e) => setFireDevicesCount(e.target.value)}
                  fullWidth
                  size="small"
                  inputProps={{ min: 0, max: 50 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: getInputBackground(),
                      borderRadius: 1.5,
                      color: 'text.primary',
                      '& fieldset': {
                        borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'text.secondary',
                    }
                  }}
                />
                <TextField
                  label="Cameras"
                  type="number"
                  value={cameraAreasCount}
                  onChange={(e) => setCameraAreasCount(e.target.value)}
                  fullWidth
                  size="small"
                  inputProps={{ min: 0, max: 50 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: getInputBackground(),
                      borderRadius: 1.5,
                      color: 'text.primary',
                      '& fieldset': {
                        borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'text.secondary',
                    }
                  }}
                />
              </Box>
            </Card>
          </Box>
        </Box>
      </DialogContent>

      {/* Footer Actions */}
      <DialogActions sx={{ 
        p: 3, 
        borderTop: isDarkMode 
          ? '1px solid rgba(255,255,255,0.1)' 
          : '1px solid rgba(0,0,0,0.05)',
        background: getCardBackground()
      }}>
        <Button 
          onClick={onClose}
          color="inherit"
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            color: 'text.primary'
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={!name || !lat || !lng}
          startIcon={<Add />}
          sx={{ 
            minWidth: 140,
            borderRadius: 2,
            px: 3,
            py: 1,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 15px rgba(102,126,234,0.3)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(102,126,234,0.4)',
              transform: 'translateY(-1px)'
            },
            '&:disabled': {
              background: isDarkMode ? 'grey.700' : 'grey.300',
              color: isDarkMode ? 'grey.400' : 'grey.500',
              boxShadow: 'none'
            }
          }}
        >
          Add Location
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMainLocationDialog;