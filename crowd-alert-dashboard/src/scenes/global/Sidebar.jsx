import { useState } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";

import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";

import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";

import MapIcon from "@mui/icons-material/Map";
import tm3Logo from '../../assets/tm3.png';// Adjust path based on component location
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import WarningIcon from '@mui/icons-material/Warning';
 
import CloudIcon from '@mui/icons-material/Cloud';


import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';


const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{
        color: theme.palette.mode === "dark" ? colors.grey[100] : colors.grey[800],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
      component={<Link to={to} />}
    >
      <Typography>{title}</Typography>
    </MenuItem>
  );
};

const SidebarComponent = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");

  // Background color based on theme mode
  const sidebarBgColor = theme.palette.mode === "dark" 
    ? colors.primary[500] 
    : colors.primary[100];

  // Text color based on theme mode
  const textColor = theme.palette.mode === "dark" 
    ? colors.grey[100] 
    : colors.grey[800];

  // Active/hover background color based on theme mode
  const activeBgColor = theme.palette.mode === "dark" 
    ? colors.primary[800] 
    : colors.primary[300];

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${sidebarBgColor} !important`,
          borderRightWidth: "0 !important",
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "8px 35px 8px 20px !important",
          margin: "5px 0 !important",
        },
        "& .pro-inner-item:hover": {
          color: `${colors.blueAccent[400]} !important`,
          backgroundColor: `${activeBgColor} !important`,
        },
        "& .pro-menu-item.active": {
          color: `${colors.blueAccent[500]} !important`,
          backgroundColor: `${activeBgColor} !important`,
        },
        "& .pro-menu-item > .pro-inner-item:focus": {
          color: `${colors.blueAccent[500]} !important`,
          backgroundColor: `${activeBgColor} !important`,
        },
        "& .pro-menu-item > .pro-inner-item:active": {
          color: `${colors.blueAccent[500]} !important`,
          backgroundColor: `${activeBgColor} !important`,
        },
      }}
    >
      <Sidebar collapsed={isCollapsed} backgroundColor={sidebarBgColor}>
        <Menu menuItemStyles={{
          button: ({ level, active }) => {
            if (level === 0) {
              return {
                color: active ? colors.blueAccent[500] : textColor,
                backgroundColor: active ? activeBgColor : 'transparent',
                '&:hover': {
                  color: colors.blueAccent[400],
                  backgroundColor: activeBgColor,
                },
              };
            }
          },
        }}>
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: textColor,
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={textColor}>
                  
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon sx={{ color: textColor }} />
                </IconButton>
              </Box>
            )}
          </MenuItem>

  {!isCollapsed && (
  <Box mb="25px">
    <Box display="flex" justifyContent="center" alignItems="center">
      <img
        alt="system-logo"
        width="100px"
        height="100px"
        src={tm3Logo} // Use the imported image
        style={{ cursor: "pointer", borderRadius: "20%" }}
      />
    </Box>
    <Box textAlign="center">
      <Typography
        variant="h3"
        color={textColor}
        fontWeight="bold"
        sx={{ m: "10px 0 0 0", fontSize: "16px" }}
      >
        AI Based Crowd Density
      </Typography>
      <Typography
        variant="h5"
        color={colors.greenAccent[500]}
        sx={{ fontSize: "14px" }}
      >
        & Safety Monitoring System
      </Typography>
    </Box>
  </Box>
)}



          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to="/"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={theme.palette.mode === "dark" ? colors.grey[300] : colors.grey[600]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Data
            </Typography>
            <Item
              title="Manage Team"
              to="/team"
              icon={<PeopleOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
           
          
          <Item
            title="Weather"
            to="/weather"
            icon={<WbSunnyIcon />}
            selected={selected}
            setSelected={setSelected}
          />
        
        
<Item
  title="Location Management"
  to="/locations"
  icon={<PlaceOutlinedIcon />}
  selected={selected}
  setSelected={setSelected}
/>

 <Item
          title="LiveZone"
          to="/map"
          icon={<MapIcon />}
          selected={selected}
          setSelected={setSelected}
        />
               
                  
            <Item
          title="Alerts"
          to="/alert"
          icon={<WarningIcon color="warning" />}
          selected={selected}
          setSelected={setSelected}
        />
       
               
               <Item
          title="Weather Distruption"
          to="/weather_disruption_alert"
          icon={<CloudIcon  />} // You can use a different MUI icon if preferred
          selected={selected}
          setSelected={setSelected}
        />
         

            

            <Item
              title="Contacts Information"
              to="/contacts"
              icon={<ContactsOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
           
            
            
            <Item
              title="Calendar"
              to="/calendar"
              icon={<CalendarTodayOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="FAQ Page"
              to="/faq"
              icon={<HelpOutlineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={theme.palette.mode === "dark" ? colors.grey[300] : colors.grey[600]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              
            </Typography>
           
          </Box>
        </Menu>
      </Sidebar>
    </Box>
  );
};

export default SidebarComponent;