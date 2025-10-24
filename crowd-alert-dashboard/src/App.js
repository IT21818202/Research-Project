import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Invoices from "./scenes/invoices";
import Contacts from "./scenes/contacts";
import Bar from "./scenes/bar";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Calendar from "./scenes/calendar/calendar";
import Map from "./scenes/map/Map";
import Weather from "./scenes/weather";
import LocationManagement from './components/LocationManagement';
import Alert from "./scenes/alert/alert";


import ChatAssistant from "./scenes/chat-bot";
import DisruptionForm from "./scenes/weather_disruption_alert";

import MapWeather from "./scenes/map-weather";


function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Sidebar isSidebar={isSidebar} />
          <main className="content">
            <Topbar setIsSidebar={setIsSidebar} />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/team" element={<Team />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/invoices" element={<Invoices />} />
               <Route path="/bar" element={<Bar />} />
              <Route path="/pie" element={<Pie />} />
              <Route path="/line" element={<Line />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/calendar" element={<Calendar />} />
             <Route path="/locations" element={<LocationManagement />} />
              <Route path="/map" element={<Map />} />
              <Route path="/Weather" element={<Weather />} />
              <Route path="/alert" element={<Alert />} />
             
              
              <Route path="/chat-bot" element={<ChatAssistant />} />
              <Route path="/weather_disruption_alert" element={<DisruptionForm />} />
           
              <Route path="/map-weather" element={<MapWeather />} />
            




            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;