// src/pages/TimeDatePage.js

import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventIcon from "@mui/icons-material/Event";
import { tokens } from "../../theme";
import Header from "../../components/Header";

const TimeDatePage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) =>
    date.toLocaleTimeString("en-US", { hour12: true });

  const formatDate = (date) =>
    date.toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <Box m="20px">
      {/* Page Header */}
      <Header title="TIME & DATE" subtitle="Real-Time Clock and Calendar" />

      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gap="20px"
        mt="20px"
      >
        {/* TIME BOX */}
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
          <AccessTimeIcon
            sx={{ fontSize: 60, color: colors.greenAccent[400], mb: 2 }}
          />
          <Typography
            variant="h4"
            fontWeight="600"
            color={colors.grey[100]}
            mb="10px"
          >
            Current Time
          </Typography>
          <Typography
            variant="h2"
            sx={{ fontFamily: "monospace", color: colors.greenAccent[300] }}
          >
            {formatTime(time)}
          </Typography>
        </Box>

        {/* DATE BOX */}
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
          <EventIcon
            sx={{ fontSize: 60, color: colors.greenAccent[400], mb: 2 }}
          />
          <Typography
            variant="h4"
            fontWeight="600"
            color={colors.grey[100]}
            mb="10px"
          >
            Today's Date
          </Typography>
          <Typography
            variant="h3"
            align="center"
            sx={{
              fontFamily: "monospace",
              color: colors.greenAccent[300],
              textAlign: "center",
            }}
          >
            {formatDate(time)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default TimeDatePage;
