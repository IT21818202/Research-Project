import React, { useState, useRef } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  useTheme,
  Snackbar,
  Alert,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import { tokens } from "../../theme";
import Header from "../../components/Header";

const PredictionPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("info");
  const [alertMessage, setAlertMessage] = useState("");

  const fireSoundRef = useRef(null);
  const crowdSoundRef = useRef(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setResult("");
    setOpenSnackbar(false);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/predict",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const prediction = response.data.prediction?.toLowerCase() || "";
      setResult(prediction);

      // Reset notification
      setOpenSnackbar(false);

      // Handle "fire" detection
      if (prediction.includes("fire")) {
        setAlertSeverity("error");
        setAlertMessage("🔥 FIRE DETECTED! TAKE IMMEDIATE ACTION!");
        setOpenSnackbar(true);
        fireSoundRef.current?.play();
      }
      // Handle "crowd" detection (but not "not crowd")
      else if (
        prediction.includes("crowd") &&
        !prediction.includes("not")
      ) {
        setAlertSeverity("warning");
        setAlertMessage("⚠️ CROWD DETECTED! MONITOR CLOSELY.");
        setOpenSnackbar(true);
        crowdSoundRef.current?.play();
      }
      // Do nothing for "not crowd"
    } catch (error) {
      console.error("Prediction error:", error);
      setResult("Error predicting image.");
      setAlertSeverity("error");
      setAlertMessage("❌ Prediction failed. Please try again.");
      setOpenSnackbar(true);
    }
  };

  return (
    <Box m="20px">
      <Header
        title="IMAGE PREDICTION"
        subtitle="Crowd / Fire Detection from Images"
      />

      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gap="20px"
        mt="20px"
      >
        {/* Upload Section */}
        <Box
          gridColumn="span 6"
          backgroundColor={colors.primary[400]}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          borderRadius="8px"
          p="30px"
        >
          <ImageIcon
            sx={{ fontSize: 60, color: colors.greenAccent[400], mb: 2 }}
          />
          <Typography
            variant="h4"
            fontWeight="600"
            color={colors.grey[100]}
            mb="10px"
          >
            Upload an Image
          </Typography>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{
              marginTop: "10px",
              marginBottom: "20px",
              color: "white",
            }}
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSubmit}
            disabled={!selectedFile}
          >
            Predict
          </Button>
        </Box>

        {/* Prediction Result Section */}
        <Box
          gridColumn="span 6"
          backgroundColor={colors.primary[400]}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          borderRadius="8px"
          p="30px"
        >
          <Typography
            variant="h4"
            fontWeight="600"
            color={colors.grey[100]}
            mb="10px"
          >
            Prediction Result
          </Typography>
          <Typography
            variant="h3"
            align="center"
            sx={{
              fontFamily: "monospace",
              color: result.includes("error")
                ? colors.redAccent[400]
                : colors.greenAccent[300],
              textAlign: "center",
            }}
          >
            {result || "No prediction yet."}
          </Typography>
        </Box>
      </Box>

      {/* Sound files */}
      <audio ref={fireSoundRef} src="/sounds/fire_alarm.wav" preload="auto" />
      <audio ref={crowdSoundRef} src="/sounds/crowd_alarm.wav" preload="auto" />

      {/* Snackbar Notification */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={7000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={alertSeverity}
          variant="filled"
          sx={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            py: 3,
            px: 4,
            borderRadius: "12px",
            minWidth: "450px",
            textAlign: "center",
          }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PredictionPage;
