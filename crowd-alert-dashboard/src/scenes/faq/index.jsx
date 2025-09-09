import { Box, useTheme } from "@mui/material";
import Header from "../../components/Header";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { tokens } from "../../theme";

const Alert = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box m="20px">
      <Header title="Safety Center"  />

     

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.redAccent[500]} variant="h5">
            🟡 System Status & Health
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            All AI monitoring modules are online. Image classification model version 2.3.1 is currently active. Last update: 10 minutes ago.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.redAccent[500]} variant="h5">
            📞 Emergency Contacts
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            - Fire Department: 110<br />
            - Medical Emergency: 119<br />
            - Security Control Room: Ext. 04<br />
            - Event Manager: +94 77 123 4567
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.redAccent[500]} variant="h5">
            📋 Evacuation Protocol
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            In the event of an emergency:<br />
            1. Follow illuminated exit signs.<br />
            2. Use the nearest exit as directed by on-ground personnel.<br />
            3. Do not use elevators.<br />
            4. Gather at the designated safe zone located at the North Parking Area.
          </Typography>
        </AccordionDetails>
      </Accordion>
<Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            🧠 Understanding Risk Levels
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            • 🔴 High: Immediate action required (e.g., fire or critical crowding).<br />
            • 🟠 Moderate: Monitor closely, consider redirecting flow.<br />
            • 🟢 Low: Normal condition, no action needed.
          </Typography>
        </AccordionDetails>
      </Accordion>

       <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            💬 Chat Assistant Use
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Use the chatbot to ask for current weather, crowd risk, or emergency help.<br />
            Example queries: <br />
            • “What’s the weather in Colombo?”<br />
            • “Any fire alerts?”<br />
            • “Risk level in Zone C?”
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default Alert;
