import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

const PeopleCountPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Handle file input change
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setResult(null);
    setError(null);
  };

  // Upload image and get prediction
  const handlePredict = async () => {
    if (!selectedFile) {
      setError("Please select an image file first.");
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await axios.post(
        "http://127.0.0.1:5000/predict",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(response.data);
    } catch (err) {
      console.error("Prediction error:", err);
      setError(
        err.response?.data?.error || "Prediction failed. Please try again."
      );
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        margin: "auto",
        mt: 5,
        p: 3,
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: "#1e1e1e",
        color: "white",
        textAlign: "center",
      }}
    >
      <Typography variant="h4" gutterBottom>
        People Count & Risk Level Prediction
      </Typography>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ margin: "20px 0", color: "white" }}
      />

      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handlePredict}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Predict"}
        </Button>
      </Box>

      {result && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            border: "1px solid #555",
            borderRadius: 2,
            backgroundColor: "#2e2e2e",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Prediction Result
          </Typography>
          <Typography>
            <strong>Class:</strong> {result.prediction}
          </Typography>
          <Typography>
            <strong>People Count:</strong> {result.people_count}
          </Typography>
          <Typography>
            <strong>Risk Level:</strong> {result.risk_level}
          </Typography>
        </Box>
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="error"
          variant="filled"
          sx={{ fontWeight: "bold" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PeopleCountPage;
