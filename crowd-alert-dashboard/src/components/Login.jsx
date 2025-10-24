import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  useTheme,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { tokens } from "../theme";
import { Visibility, VisibilityOff, Person, Lock } from "@mui/icons-material";
import Header from "./Header";

const Login = ({ onLogin }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!credentials.email || !credentials.password) {
      setError("Please fill in all fields");
      return;
    }
    
    // Check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(
      (u) => u.email === credentials.email && u.password === credentials.password
    );
    
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      onLogin(user);
    } else {
      setError("Invalid email or password");
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user starts typing
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background: `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.blueAccent[700]} 100%)`,
        padding: "20px",
      }}
    >
      <Box
        sx={{
          backgroundColor: colors.primary[600],
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          width: "100%",
          maxWidth: "450px",
        }}
      >
        <Header title="LOGIN" subtitle="Access your dashboard" />
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={credentials.email}
            onChange={handleChange}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person sx={{ color: colors.grey[300] }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: colors.grey[100],
                "& fieldset": {
                  borderColor: colors.grey[400],
                },
                "&:hover fieldset": {
                  borderColor: colors.greenAccent[500],
                },
                "&.Mui-focused fieldset": {
                  borderColor: colors.greenAccent[500],
                },
              },
              "& .MuiInputLabel-root": {
                color: colors.grey[300],
              },
            }}
          />
          
          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={credentials.password}
            onChange={handleChange}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: colors.grey[300] }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? (
                      <VisibilityOff sx={{ color: colors.grey[300] }} />
                    ) : (
                      <Visibility sx={{ color: colors.grey[300] }} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: colors.grey[100],
                "& fieldset": {
                  borderColor: colors.grey[400],
                },
                "&:hover fieldset": {
                  borderColor: colors.greenAccent[500],
                },
                "&.Mui-focused fieldset": {
                  borderColor: colors.greenAccent[500],
                },
              },
              "& .MuiInputLabel-root": {
                color: colors.grey[300],
              },
            }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              padding: "12px",
              backgroundColor: colors.greenAccent[600],
              "&:hover": {
                backgroundColor: colors.greenAccent[500],
              },
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            Sign In
          </Button>
          
          <Box textAlign="center">
            <Typography variant="body2" sx={{ color: colors.grey[300] }}>
              Don't have an account?{" "}
              <Typography
                component="a"
                href="#"
                onClick={() => window.location.href = "/signup"}
                sx={{
                  color: colors.greenAccent[500],
                  textDecoration: "none",
                  cursor: "pointer",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Sign Up
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;