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
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Email,
  Badge,
} from "@mui/icons-material";
import Header from "./Header";

const Signup = ({ onSignup }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [showPassword, setShowPassword] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!userData.name || !userData.email || !userData.password) {
      setError("Please fill in all fields");
      return;
    }
    
    if (userData.password !== userData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (userData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const existingUser = users.find((u) => u.email === userData.email);
    
    if (existingUser) {
      setError("User with this email already exists");
      return;
    }
    
    // Add new user
    const newUser = {
      id: Date.now(),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    
    onSignup(newUser);
  };

  const handleChange = (e) => {
    setUserData({
      ...userData,
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
        background: `linear-gradient(135deg, ${colors.blueAccent[700]} 0%, ${colors.primary[400]} 100%)`,
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
          maxWidth: "500px",
        }}
      >
        <Header title="SIGN UP" subtitle="Create a new account" />
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            value={userData.name}
            onChange={handleChange}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Badge sx={{ color: colors.grey[300] }} />
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
            label="Email Address"
            name="email"
            type="email"
            value={userData.email}
            onChange={handleChange}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: colors.grey[300] }} />
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
            value={userData.password}
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
          
          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={userData.confirmPassword}
            onChange={handleChange}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: colors.grey[300] }} />
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
            Create Account
          </Button>
          
          <Box textAlign="center">
            <Typography variant="body2" sx={{ color: colors.grey[300] }}>
              Already have an account?{" "}
              <Typography
                component="a"
                href="#"
                onClick={() => window.location.href = "/login"}
                sx={{
                  color: colors.greenAccent[500],
                  textDecoration: "none",
                  cursor: "pointer",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Sign In
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Signup;