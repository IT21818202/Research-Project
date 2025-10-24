// src/pages/login/LoginPage.jsx
import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  useTheme,
  Alert,
  CircularProgress,
} from "@mui/material";
import { tokens } from "../../theme";
import axios from "axios";

const LoginPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });

      if (response.data.success) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        window.location.href = "/dashboard"; // redirect to dashboard
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Server error! Please try again.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        background: `linear-gradient(135deg, ${colors.blueAccent[700]}, ${colors.greenAccent[600]})`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          width: 400,
          backgroundColor: colors.primary[400],
          p: 5,
          borderRadius: 3,
          boxShadow: `0 8px 32px rgba(0,0,0,0.25)`,
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          color={colors.grey[100]}
          sx={{ mb: 3, textAlign: "center" }}
        >
          Event Dashboard Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            sx={{ mb: 3 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            sx={{ mb: 3 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              background: `linear-gradient(45deg, ${colors.greenAccent[500]}, ${colors.blueAccent[700]})`,
              fontWeight: "bold",
              fontSize: "16px",
              py: 1.5,
              mb: 2,
              "&:hover": {
                background: `linear-gradient(45deg, ${colors.blueAccent[700]}, ${colors.greenAccent[500]})`,
              },
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default LoginPage;
