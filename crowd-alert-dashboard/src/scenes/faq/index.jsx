import { Box, useTheme } from "@mui/material";
import Header from "../../components/Header";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { tokens } from "../../theme";
import SafetyCheckIcon from "@mui/icons-material/SafetyCheck";
import WarningIcon from "@mui/icons-material/Warning";
import PeopleIcon from "@mui/icons-material/People";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import WifiIcon from "@mui/icons-material/Wifi";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

const FAQ = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box m="20px">
      <Header 
        title="FREQUENTLY ASKED QUESTIONS" 
        subtitle="Everything you need to know about our Event Safety Monitoring System"
      />

      <Box mb="30px">
        <Typography variant="h4" gutterBottom sx={{ color: colors.greenAccent[400], fontWeight: 'bold' }}>
          Welcome to the Safety Monitoring System!
        </Typography>
        <Typography variant="h6" sx={{ color: colors.grey[100] }}>
          This guide will help you understand how our integrated safety system works and how to use it effectively.
        </Typography>
      </Box>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center">
            <SafetyCheckIcon sx={{ color: colors.blueAccent[500], mr: 2 }} />
            <Typography color={colors.greenAccent[500]} variant="h5">
              System Overview & Purpose
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="h6" gutterBottom sx={{ color: colors.greenAccent[400] }}>
            What is this system designed for?
          </Typography>
          <Typography paragraph>
            Our integrated safety monitoring system is specifically designed for small events, parties, and gatherings to provide real-time risk detection, crowd management, and emergency response coordination.
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ color: colors.greenAccent[400] }}>
            How does the system work?
          </Typography>
          <Typography>
            The system combines AI-powered crowd monitoring, IoT sensors for hazard detection, real-time dashboards, and automated alert systems to ensure event safety. All components work together to detect potential issues before they become emergencies.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center">
            <PeopleIcon sx={{ color: colors.blueAccent[500], mr: 2 }} />
            <Typography color={colors.greenAccent[500]} variant="h5">
              AI Monitoring & Detection
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="h6" gutterBottom sx={{ color: colors.greenAccent[400] }}>
            How does the AI detect crowd density issues?
          </Typography>
          <Typography paragraph>
            Our system uses advanced computer vision algorithms to analyze camera footage in real-time, estimating crowd density and identifying potential overcrowding before it becomes dangerous.
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ color: colors.greenAccent[400] }}>
            What abnormal behaviors can the system detect?
          </Typography>
          <Typography>
            The AI can identify panic movements, aggressive behavior, suspicious activities, and unusual crowd patterns that may indicate emerging safety issues.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center">
            <WarningIcon sx={{ color: colors.blueAccent[500], mr: 2 }} />
            <Typography color={colors.greenAccent[500]} variant="h5">
              Hazard Detection & Alerts
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="h6" gutterBottom sx={{ color: colors.greenAccent[400] }}>
            What hazards can the system detect?
          </Typography>
          <Typography paragraph>
            Our sensor network can identify fire, smoke, abnormal temperature spikes, hazardous gases, and overcrowding in specific areas.
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ color: colors.greenAccent[400] }}>
            How are emergency alerts triggered?
          </Typography>
          <Typography paragraph>
            Alerts are automatically generated when the system detects predefined risk thresholds (e.g., high crowd density, fire detection) or can be manually triggered by authorized personnel.
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ color: colors.greenAccent[400] }}>
            Who receives the alerts?
          </Typography>
          <Typography>
            Alerts are sent to relevant response teams based on incident type and location, including safety officers, emergency responders, and event managers.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center">
            <NotificationsActiveIcon sx={{ color: colors.blueAccent[500], mr: 2 }} />
            <Typography color={colors.greenAccent[500]} variant="h5">
              Weather & Environmental Monitoring
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="h6" gutterBottom sx={{ color: colors.greenAccent[400] }}>
            How does weather monitoring help with event safety?
          </Typography>
          <Typography paragraph>
            Our system integrates real-time weather data to predict potential disruptions from rain, wind, or extreme temperatures, allowing proactive safety measures before conditions become dangerous.
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ color: colors.greenAccent[400] }}>
            What weather conditions trigger alerts?
          </Typography>
          <Typography>
            Heavy rainfall, high winds, extreme temperatures, and lightning risks automatically generate safety recommendations and alerts.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center">
            <WifiIcon sx={{ color: colors.blueAccent[500], mr: 2 }} />
            <Typography color={colors.greenAccent[500]} variant="h5">
              Technical Requirements & Setup
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="h6" gutterBottom sx={{ color: colors.greenAccent[400] }}>
            What internet connectivity is needed?
          </Typography>
          <Typography paragraph>
            The system can function with standard broadband connections, though a dedicated line is recommended for larger events. Some components can operate offline with local network connectivity.
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ color: colors.greenAccent[400] }}>
            What hardware is required?
          </Typography>
          <Typography>
            Basic implementation requires cameras, IoT sensors, a central processing unit, and display devices for the dashboard. We provide a detailed specification sheet for different event sizes.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center">
            <SupportAgentIcon sx={{ color: colors.blueAccent[500], mr: 2 }} />
            <Typography color={colors.greenAccent[500]} variant="h5">
              Support & Emergency Procedures
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="h6" gutterBottom sx={{ color: colors.greenAccent[400] }}>
            What should I do when I receive an alert?
          </Typography>
          <Typography paragraph>
            Follow the specific instructions provided in the alert, which are tailored to the incident type and your role in the response team. The system will guide you through appropriate actions.
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ color: colors.greenAccent[400] }}>
            Is technical support available during events?
          </Typography>
          <Typography paragraph>
            Yes, remote technical support is available throughout your event during operational hours, with emergency support contacts provided for critical issues.
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ color: colors.greenAccent[400] }}>
            Emergency Contacts
          </Typography>
          <Typography sx={{ color: colors.redAccent[500] }}>
            • Fire Department: 110<br />
            • Medical Emergency: 119<br />
            • Security Control Room: Ext. 04<br />
            • Event Manager: +94 77 123 4567<br />
            • Technical Support: +94 76 555 7890
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Box mt={4} p={3} sx={{ backgroundColor: colors.primary[400], borderRadius: '8px' }}>
        <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500] }}>
          Need More Help?
        </Typography>
        <Typography paragraph>
          Can't find what you're looking for? Please use the chat assistant feature for real-time support during events, or contact our technical team at support@eventsafety.lk
        </Typography>
        <Typography sx={{ fontStyle: 'italic', color: colors.grey[100] }}>
          Last updated: {new Date().toLocaleDateString()}
        </Typography>
      </Box>
    </Box>
  );
};

export default FAQ;