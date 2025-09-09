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
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  WbSunny as SunnyIcon,
  Air as WindIcon,
  Water as HumidityIcon,
  Umbrella as PressureIcon,
  LocationOn as LocationIcon,
  Notifications as NotificationIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const API_KEY = 'a8927c216016b945b6ef3d9329f0cd0c'; // Replace with your API key

const WeatherCard = styled(Card)(({ theme }) => ({
  minWidth: 120,
  textAlign: 'center',
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[4]
  }
}));

const WeatherDetail = ({ icon, title, value }) => (
  <Box sx={{ textAlign: 'center', minWidth: 120, p: 1 }}>
    <Box sx={{ color: 'primary.main' }}>{icon}</Box>
    <Typography variant="subtitle2" color="text.secondary">
      {title}
    </Typography>
    <Typography variant="h6">{value}</Typography>
  </Box>
);

const WeatherPage = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      try {
        // Fetch current weather
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        if (!weatherResponse.ok) throw new Error('Current weather data not available');
        
        // Fetch forecast
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        if (!forecastResponse.ok) throw new Error('Forecast data not available');

        const weather = await weatherResponse.json();
        const forecast = await forecastResponse.json();
        
        setWeatherData(weather);
        setForecastData(forecast);
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

  const formatTime = (dt_txt) => {
    const date = new Date(dt_txt);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dt_txt) => {
    const date = new Date(dt_txt);
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
        <Typography variant="h6" ml={2}>Loading weather data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error" variant="h6">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Weather Forecast
      </Typography>

      {weatherData && (
        <>
          <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mb: 4 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <LocationIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h5">
                {weatherData.name}, {weatherData.sys?.country}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Box>
                <Typography variant="h2" sx={{ fontWeight: 'bold' }}>
                  {Math.round(weatherData.main.temp)}°C
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {weatherData.weather[0].description}
                </Typography>
              </Box>
              <Box>
                <img
                  src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                  alt={weatherData.weather[0].description}
                  style={{ width: 100, height: 100 }}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box display="flex" justifyContent="space-between" flexWrap="wrap">
              <WeatherDetail
                icon={<SunnyIcon />}
                title="Feels Like"
                value={`${Math.round(weatherData.main.feels_like)}°C`}
              />
              <WeatherDetail
                icon={<WindIcon />}
                title="Wind"
                value={`${Math.round(weatherData.wind.speed * 3.6)} km/h`}
              />
              <WeatherDetail
                icon={<HumidityIcon />}
                title="Humidity"
                value={`${weatherData.main.humidity}%`}
              />
              <WeatherDetail
                icon={<PressureIcon />}
                title="Pressure"
                value={`${weatherData.main.pressure} hPa`}
              />
            </Box>

            <Box mt={3} display="flex" justifyContent="center">
              <Button
                variant="contained"
                color="primary"
                startIcon={<NotificationIcon />}
                onClick={handleNotification}
              >
                Get Weather Alert
              </Button>
            </Box>
          </Paper>

          {forecastData && (
            <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                3-Hourly Forecast
              </Typography>
              
              <Grid container spacing={2}>
                {forecastData.list.slice(0, 8).map((forecast, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <WeatherCard>
                      <CardContent>
                        <Typography variant="subtitle1" color="text.secondary">
                          {index === 0 ? 'Now' : formatTime(forecast.dt_txt)}
                        </Typography>
                        <Typography variant="subtitle2">
                          {formatDate(forecast.dt_txt)}
                        </Typography>
                        <img
                          src={`https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`}
                          alt={forecast.weather[0].description}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {Math.round(forecast.main.temp)}°C
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {forecast.weather[0].description}
                        </Typography>
                        <Box mt={1}>
                          <Typography variant="caption">
                            <WindIcon fontSize="small" /> {Math.round(forecast.wind.speed * 3.6)} km/h
                          </Typography>
                          <Typography variant="caption" display="block">
                            <HumidityIcon fontSize="small" /> {forecast.main.humidity}%
                          </Typography>
                        </Box>
                      </CardContent>
                    </WeatherCard>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
        </>
      )}

      <Dialog
        open={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 'bold' }}>
          Weather Alert
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {notificationMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotificationOpen(false)} color="primary" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WeatherPage;