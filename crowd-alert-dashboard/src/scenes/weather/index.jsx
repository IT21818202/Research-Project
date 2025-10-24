import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Paper, 
  Divider, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  WbSunny as SunnyIcon,
  Air as WindIcon,
  Water as HumidityIcon,
  LocationOn as LocationIcon,
  Notifications as NotificationIcon,
  Thermostat as FeelsLikeIcon
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';

const API_KEY = 'a8927c216016b945b6ef3d9329f0cd0c'; // Replace with your API key

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Styled components
const MainWeatherCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #0f1a30 0%, #1a2a4c 100%)',
  backgroundSize: '200% 200%',
  animation: `${gradientShift} 10s ease infinite`,
  color: '#e6f7ff',
  borderRadius: '20px',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
  animation: `${fadeIn} 0.6s ease-out`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    right: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(41, 98, 255, 0.1) 0%, transparent 60%)',
    transform: 'rotate(30deg)'
  }
}));

const WeatherIcon = styled('img')({
  animation: `${pulse} 3s infinite ease-in-out`,
  filter: 'drop-shadow(0 5px 5px rgba(0,0,0,0.3))'
});

const WeatherDetail = ({ icon, title, value, color = "#e6f7ff" }) => (
  <Box sx={{ textAlign: 'center', minWidth: 120, p: 1 }}>
    <Box sx={{ color, fontSize: '2rem', mb: 1 }}>{icon}</Box>
    <Typography variant="subtitle2" sx={{ color, opacity: 0.9, fontWeight: 500 }}>
      {title}
    </Typography>
    <Typography variant="h6" sx={{ color, fontWeight: 'bold' }}>{value}</Typography>
  </Box>
);

const WeatherPage = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      try {
        // Fetch current weather
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        if (!weatherResponse.ok) throw new Error('Current weather data not available');
        
        const weather = await weatherResponse.json();
        
        setWeatherData(weather);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });
            fetchWeather(position.coords.latitude, position.coords.longitude);
          },
          (err) => {
            setError('Location access denied. Using default location.');
            // Fallback to a default location (e.g., London)
            fetchWeather(51.5074, -0.1278);
          }
        );
      } else {
        setError('Geolocation is not supported by this browser.');
        // Fallback to a default location
        fetchWeather(51.5074, -0.1278);
      }
    };

    getLocation();
  }, []);

  const handleNotification = () => {
    if (!weatherData) return;
    
    const temp = Math.round(weatherData.main.temp);
    const condition = weatherData.weather[0].main;
    const location = `${weatherData.name}, ${weatherData.sys?.country}`;
    
    let message = `Current weather in ${location}: ${temp}°C, ${condition}. `;
    
    // Check for extreme conditions
    if (temp > 30) {
      message += "It's very hot today! Stay hydrated.";
    } else if (temp < 5) {
      message += "It's very cold today! Dress warmly.";
    } else if (condition.toLowerCase().includes('rain')) {
      message += "Don't forget your umbrella!";
    } else if (condition.toLowerCase().includes('snow')) {
      message += "Snow expected! Drive carefully.";
    } else {
      message += "Have a nice day!";
    }
    
    setNotificationMessage(message);
    setNotificationOpen(true);
  };

  const getBackgroundGradient = () => {
    if (!weatherData) return 'linear-gradient(135deg, #0f1a30 0%, #1a2a4c 100%)';
    
    const temp = Math.round(weatherData.main.temp);
    const condition = weatherData.weather[0].main.toLowerCase();
    
    if (condition.includes('rain')) {
      return 'linear-gradient(135deg, #1a2a4c 0%, #2a3c6e 100%)';
    } else if (condition.includes('cloud')) {
      return 'linear-gradient(135deg, #1a2a4c 0%, #2a3c6e 100%)';
    } else if (condition.includes('snow')) {
      return 'linear-gradient(135deg, #1a2a4c 0%, #2a3c6e 100%)';
    } else if (temp > 30) {
      return 'linear-gradient(135deg, #2a1a4c 0%, #3a2c6e 100%)';
    } else if (temp < 5) {
      return 'linear-gradient(135deg, #1a2a4c 0%, #2a3c6e 100%)';
    } else {
      return 'linear-gradient(135deg, #0f1a30 0%, #1a2a4c 100%)';
    }
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ 
        background: 'linear-gradient(135deg, #0f1a30 0%, #1a2a4c 100%)' 
      }}>
        <CircularProgress size={60} thickness={4} sx={{ color: '#4a90e2', mb: 2 }} />
        <Typography variant="h6" color="#e6f7ff" fontWeight="500">
          Loading weather data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ 
        background: 'linear-gradient(135deg, #0f1a30 0%, #1a2a4c 100%)' 
      }}>
        <Paper elevation={3} sx={{ 
          p: 4, 
          textAlign: 'center', 
          maxWidth: 400, 
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #1a2a4c 0%, #2a3c6e 100%)',
          color: '#e6f7ff'
        }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Error
          </Typography>
          <Typography paragraph>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            sx={{ 
              background: 'linear-gradient(135deg, #2962ff 0%, #0039cb 100%)',
              borderRadius: '20px',
              px: 3,
              py: 1,
              color: 'white'
            }}
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0f1a30 0%, #1a2a4c 100%)',
      pb: 4
    }}>
      <AppBar position="static" elevation={0} sx={{ 
        background: 'rgba(15, 26, 48, 0.9)', 
        backdropFilter: 'blur(10px)',
        color: '#e6f7ff',
        mb: 3,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
      }}>
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ 
            flexGrow: 1, 
            fontWeight: 'bold',
          }}>
            Weather Dashboard
          </Typography>
          <Button 
            variant="contained"
            startIcon={<NotificationIcon />}
            onClick={handleNotification}
            sx={{ 
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #2962ff 0%, #0039cb 100%)',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #0039cb 0%, #002699 100%)',
                boxShadow: '0 6px 12px rgba(0, 0, 0, 0.4)'
              }
            }}
          >
            Weather Alert
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ px: isMobile ? 2 : 4 }}>
        {weatherData && (
          <MainWeatherCard sx={{ background: getBackgroundGradient() }}>
            <Box display="flex" alignItems="center" mb={2}>
              <LocationIcon sx={{ mr: 1, fontSize: '2rem' }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {weatherData.name}, {weatherData.sys?.country}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" mb={3}>
              <Box>
                <Typography variant="h1" sx={{ fontWeight: 'bold', fontSize: { xs: '3rem', md: '4rem' } }}>
                  {Math.round(weatherData.main.temp)}°C
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  {weatherData.weather[0].description}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                  H: {Math.round(weatherData.main.temp_max)}° L: {Math.round(weatherData.main.temp_min)}°
                </Typography>
              </Box>
              <Box>
                <WeatherIcon
                  src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`}
                  alt={weatherData.weather[0].description}
                  style={{ width: 140, height: 140 }}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.3)' }} />

            <Box display="flex" justifyContent="space-around" flexWrap="wrap">
              <WeatherDetail
                icon={<FeelsLikeIcon fontSize="large" />}
                title="Feels Like"
                value={`${Math.round(weatherData.main.feels_like)}°C`}
              />
              <WeatherDetail
                icon={<WindIcon fontSize="large" />}
                title="Wind"
                value={`${Math.round(weatherData.wind.speed * 3.6)} km/h`}
              />
              <WeatherDetail
                icon={<HumidityIcon fontSize="large" />}
                title="Rainfall"
                value={`${weatherData.rain ? weatherData.rain['1h'] || '0' : '0'} mm`}
              />
            </Box>
          </MainWeatherCard>
        )}

        <Dialog
          open={notificationOpen}
          onClose={() => setNotificationOpen(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          PaperProps={{ 
            sx: { 
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #1a2a4c 0%, #2a3c6e 100%)',
              color: '#e6f7ff'
            } 
          }}
        >
          <DialogTitle id="alert-dialog-title" sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #2962ff 0%, #0039cb 100%)',
            color: 'white'
          }}>
            Weather Alert
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <DialogContentText id="alert-dialog-description" sx={{ color: '#e6f7ff', fontSize: '1.1rem' }}>
              {notificationMessage}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setNotificationOpen(false)} 
              variant="contained"
              sx={{ 
                borderRadius: '20px', 
                mx: 2, 
                mb: 1,
                background: 'linear-gradient(135deg, #2962ff 0%, #0039cb 100%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0039cb 0%, #002699 100%)'
                }
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default WeatherPage;