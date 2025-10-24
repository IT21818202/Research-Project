import { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
  useTheme,
  Fab,
  Dialog,
  DialogContent,
  AppBar,
  Toolbar,
  TextField,
  Avatar,
  Chip,
  CircularProgress,
  Badge,
} from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import MicIcon from "@mui/icons-material/Mic";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import BarChart from "../../components/BarChart";
import ProgressCircle from "../../components/ProgressCircle";
import axios from "axios";

// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default icon issue in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Chatbot component (enhanced with professional styling)
const Chatbot = ({ open, onClose }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hello! I'm your Weather & Emergency Assistant. Ask me about weather conditions or emergency situations in Sri Lankan cities. You can type or use voice commands.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const CITY_COORDINATES = {
    colombo: { lat: 6.9271, lng: 79.8612 },
    kandy: { lat: 7.2906, lng: 80.6337 },
    hatton: { lat: 6.8941, lng: 80.5937 },
    galle: { lat: 6.0535, lng: 80.221 },
    negombo: { lat: 7.2083, lng: 79.8358 },
    trincomalee: { lat: 8.5874, lng: 81.2152 },
    "nuwara eliya": { lat: 6.9707, lng: 80.7829 },
    anuradhapura: { lat: 8.3114, lng: 80.4037 },
    jaffna: { lat: 9.6615, lng: 80.0255 },
    batticaloa: { lat: 7.7102, lng: 81.6924 },
    matara: { lat: 5.9549, lng: 80.5549 },
    polonnaruwa: { lat: 7.9403, lng: 81.0188 },
    ratnapura: { lat: 6.6828, lng: 80.399 },
    dambulla: { lat: 7.8569, lng: 80.6521 },
    badulla: { lat: 6.9895, lng: 81.055 },
    malabe: { lat: 6.9279, lng: 79.9995 },
  };

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;

  useEffect(() => {
    let recognition;
    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        setInput(speechResult);
        setListening(false);
        sendMessage(speechResult);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setListening(false);
      };
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const detectCity = (text) => {
    const lower = text.toLowerCase();
    for (const city in CITY_COORDINATES) {
      if (lower.includes(city)) {
        return { ...CITY_COORDINATES[city], city };
      }
    }
    return null;
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (messageText) => {
    const text = messageText || input;
    if (!text.trim()) return;

    setMessages((msgs) => [...msgs, { from: "user", text }]);
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/nlp_query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json();

      setMessages((msgs) => [...msgs, { from: "bot", text: data.message }]);
      speak(data.message);
    } catch (err) {
      alert("Server error");
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Speech Recognition API not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setInput(speechResult);
      setListening(false);
      sendMessage(speechResult);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };

    try {
      recognition.start();
      setListening(true);
    } catch (err) {
      console.error("Speech recognition start error", err);
    }
  };

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          height: '500px',
          maxHeight: '80vh'
        }
      }}
    >
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: `linear-gradient(135deg, ${colors.blueAccent[700]}, ${colors.greenAccent[600]})`,
          py: 1
        }}
      >
        <Toolbar>
          <Avatar sx={{ mr: 2, bgcolor: 'white' }}>
            <SmartToyIcon sx={{ color: colors.blueAccent[700] }} />
          </Avatar>
          <Box>
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, fontWeight: 600, color: 'black' }}
            >
              Weather & Emergency Assistant
            </Typography>
            <Chip 
              label="Online" 
              size="small" 
              sx={{ 
                height: '16px', 
                fontSize: '0.7rem', 
                bgcolor: colors.greenAccent[500],
                color: 'black'
              }} 
            />
          </Box>
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={onClose} 
            aria-label="close"
            sx={{ 
              ml: 'auto',
              color: 'black',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
            backgroundColor: colors.primary[100],
            backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.1) 0%, transparent 20%)',
          }}
        >
          {messages.map((msg, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                justifyContent: msg.from === "user" ? "flex-end" : "flex-start",
                alignItems: "flex-start",
                mb: 2,
                gap: 1,
              }}
            >
              {msg.from === "bot" && (
                <Avatar sx={{ width: 32, height: 32, bgcolor: colors.blueAccent[600] }}>
                  <SmartToyIcon sx={{ fontSize: 18 }} />
                </Avatar>
              )}
              <Box
                sx={{
                  maxWidth: "70%",
                  p: 2,
                  borderRadius: 3,
                  borderBottomLeftRadius: msg.from === "bot" ? 4 : 16,
                  borderBottomRightRadius: msg.from === "user" ? 4 : 16,
                  backgroundColor:
                    msg.from === "user"
                      ? colors.blueAccent[600]
                      : colors.grey[200],
                  color: 'black',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  position: 'relative',
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: msg.from === "bot" ? '-8px' : 'auto',
                    right: msg.from === "user" ? '-8px' : 'auto',
                    width: 0,
                    height: 0,
                    border: `8px solid transparent`,
                    borderBottomColor: msg.from === "user" ? colors.blueAccent[600] : colors.grey[200],
                    borderTop: 0,
                    marginLeft: msg.from === "bot" ? '-8px' : 'auto',
                    marginRight: msg.from === "user" ? '-8px' : 'auto',
                  }
                }}
              >
                <Typography variant="body1" sx={{ lineHeight: 1.4, color: 'black' }}>
                  {msg.text}
                </Typography>
              </Box>
              {msg.from === "user" && (
                <Avatar sx={{ width: 32, height: 32, bgcolor: colors.greenAccent[600] }}>
                  <PersonIcon sx={{ fontSize: 18 }} />
                </Avatar>
              )}
            </Box>
          ))}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', mb: 2, gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: colors.blueAccent[600] }}>
                <SmartToyIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Box sx={{ p: 2, borderRadius: 3, bgcolor: colors.grey[200] }}>
                <CircularProgress size={16} sx={{ color: colors.blueAccent[600] }} />
              </Box>
            </Box>
          )}
        </Box>
        <Box sx={{ p: 2, borderTop: `1px solid ${colors.grey[300]}`, bgcolor: 'white' }}>
          <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your question about weather or emergencies..."
              disabled={loading || listening}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '20px',
                  backgroundColor: colors.grey[100],
                },
                '& .MuiInputBase-input': {
                  color: 'black',
                },
                '& .MuiInputLabel-root': {
                  color: 'black',
                }
              }}
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              sx={{ 
                minWidth: 'auto', 
                borderRadius: '50%', 
                width: '40px', 
                height: '40px',
                bgcolor: colors.blueAccent[600],
                color: 'black',
                '&:hover': {
                  bgcolor: colors.blueAccent[700],
                }
              }}
            >
              <SendIcon sx={{ fontSize: 18 }} />
            </Button>
          </Box>
          <Button
            fullWidth
            variant="outlined"
            onClick={startListening}
            disabled={loading || listening}
            startIcon={listening ? <CircularProgress size={16} /> : <MicIcon />}
            sx={{ 
              borderRadius: '20px',
              textTransform: 'none',
              fontWeight: 500,
              borderColor: listening ? colors.greenAccent[500] : colors.grey[300],
              color: 'black',
              '&:hover': {
                borderColor: colors.greenAccent[500],
                bgcolor: colors.greenAccent[50],
              }
            }}
          >
            {listening ? "Listening..." : "Speak your question"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Live location state
  const [position, setPosition] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // Live date-time state
  const [liveDateTime, setLiveDateTime] = useState(new Date());

  // Chatbox state
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(3); // Example unread message count

  // Update live date-time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Get user geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    const success = (pos) => {
      const { latitude, longitude } = pos.coords;
      setPosition([latitude, longitude]);
    };

    const error = (err) => {
      setLocationError("Unable to retrieve your location");
      console.error(err);
    };

    navigator.geolocation.getCurrentPosition(success, error);
  }, []);

  // Component to recenter map on user position change
  function RecenterMap({ latlng }) {
    const map = useMap();
    useEffect(() => {
      if (latlng) {
        map.setView(latlng, 13);
      }
    }, [latlng, map]);
    return null;
  }

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="DASHBOARD"
          subtitle="Welcome to the Event Management dashboard"
        />
      
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* TRAFFIC LINE CHART */}
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          borderRadius="8px"
          boxShadow={3}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                EnviroTrend
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                Once Sorted With Time
              </Typography>
            </Box>
            <IconButton>
              <DownloadOutlinedIcon
                sx={{ fontSize: "26px", color: colors.greenAccent[500] }}
              />
            </IconButton>
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <LineChart isDashboard={true} />
          </Box>
        </Box>

        {/* LIVE DATE AND TIME BOX (Stylish) */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          sx={{
            background: `linear-gradient(135deg, ${colors.greenAccent[600]}, ${colors.blueAccent[700]})`,
            borderRadius: "16px",
            boxShadow: `0 4px 20px ${colors.greenAccent[700]}`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            p: "30px",
            color: colors.grey[100],
            userSelect: "none",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              letterSpacing: "2px",
              fontWeight: 700,
              textTransform: "uppercase",
              mb: 1,
              color: colors.grey[300],
              textShadow: `0 0 8px ${colors.grey[400]}`,
            }}
          >
            Current Date
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              letterSpacing: "3px",
              textTransform: "uppercase",
              textShadow: `0 0 12px ${colors.grey[100]}`,
              mb: 2,
            }}
          >
            {liveDateTime.toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Typography>
          <Typography
            variant="h2"
            component="div"
            sx={{
              fontFamily: "'Roboto Mono', monospace",
              fontWeight: 700,
              letterSpacing: "6px",
              color: colors.grey[50],
              textShadow: `0 0 14px ${colors.grey[100]}`,
            }}
          >
            {liveDateTime.toLocaleTimeString()}
          </Typography>
        </Box>

        {/* CROWD DISTRIBUTION */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          p="30px"
          borderRadius="8px"
          boxShadow={3}
        >
          <Typography variant="h5" fontWeight="600">
            Crowd Distribution
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            mt="25px"
          >
            <ProgressCircle size="125" />
            <Typography
              variant="h5"
              color={colors.greenAccent[500]}
              sx={{ mt: "15px" }}
            >
              --------------------
            </Typography>
            <Typography>---------------------------</Typography>
          </Box>
        </Box>

        {/* HOURLY CROWD BAR CHART */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          borderRadius="8px"
          boxShadow={3}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: "30px 30px 0 30px" }}
          >
            HourlyEnviro
          </Typography>
          <Box height="250px" mt="-20px">
            <BarChart isDashboard={true} />
          </Box>
        </Box>

        {/* LIVE LOCATION MAP */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          padding="15px"
          display="flex"
          flexDirection="column"
          borderRadius="8px"
          boxShadow={3}
        >
          <Typography variant="h5" fontWeight="600" sx={{ mb: 2 }}>
            Live Location
          </Typography>

          {locationError ? (
            <Typography color={colors.redAccent[400]}>
              {locationError}
            </Typography>
          ) : position ? (
            <Box flex={1} sx={{ height: "250px" }}>
              <MapContainer
                center={position}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%", borderRadius: "8px" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                  <Popup>Your Current Location</Popup>
                </Marker>
                <RecenterMap latlng={position} />
              </MapContainer>
            </Box>
          ) : (
            <Typography color={colors.grey[300]}>Locating...</Typography>
          )}
        </Box>
      </Box>

      {/* Enhanced Floating Chatbot Widget */}
      <Box
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 2000,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 1,
        }}
      >
        <Badge
          badgeContent={unreadMessages}
          color="error"
          overlap="circular"
          invisible={chatOpen || unreadMessages === 0}
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.75rem',
              height: '20px',
              minWidth: '20px',
            }
          }}
        >
          <Fab
            color={chatOpen ? "error" : "primary"}
            onClick={() => {
              setChatOpen(!chatOpen);
              if (unreadMessages > 0 && !chatOpen) {
                setUnreadMessages(0);
              }
            }}
            aria-label="chat"
            sx={{
              boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
              transition: "all 0.3s ease",
              width: 64,
              height: 64,
              "&:hover": {
                transform: "scale(1.1)",
                boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
              },
              background: chatOpen 
                ? colors.redAccent[500] 
                : `linear-gradient(135deg, ${colors.blueAccent[600]}, ${colors.greenAccent[500]})`,
            }}
          >
            {chatOpen ? <CloseIcon sx={{ fontSize: 28 }} /> : <SupportAgentIcon sx={{ fontSize: 30 }} />}
          </Fab>
        </Badge>

        {/* Optional: Add a small helper text when hovered */}
        {!chatOpen && (
          <Chip
            icon={<ChatIcon />}
            label="Need help? Chat with us!"
            size="small"
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: 'white',
              opacity: 0.9,
              fontSize: '0.85rem',
              '& .MuiChip-icon': {
                color: 'white',
                fontSize: '18px'
              }
            }}
          />
        )}
      </Box>

      {/* Chatbot Dialog */}
      <Chatbot open={chatOpen} onClose={() => setChatOpen(false)} />
    </Box>
  );
};

export default Dashboard;