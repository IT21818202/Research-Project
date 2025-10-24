import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import { formatDate } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Paper,
  Slide,
  Fade,
} from "@mui/material";
import {
  NotificationsActive as NotificationsActiveIcon,
  Close as CloseIcon,
  Event as EventIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import Header from "../../components/Header";
import { tokens } from "../../theme";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Calendar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [currentEvents, setCurrentEvents] = useState([]);
  const [notifiedToday, setNotifiedToday] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [todayEvents, setTodayEvents] = useState([]);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [updatedEventTitle, setUpdatedEventTitle] = useState("");

  // 🔹 Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/calendar");
        const data = await res.json();
        setCurrentEvents(data);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };
    fetchEvents();
  }, []);

  // 🔹 Notify today's events
  useEffect(() => {
    if (currentEvents.length > 0 && !notifiedToday) {
      const today = new Date().toISOString().split("T")[0];
      const todayList = currentEvents.filter(
        (event) => event.start.split("T")[0] === today
      );
      if (todayList.length > 0) {
      {todayEvents.length > 0 && (
  <Button
    variant="contained"
    onClick={() => {
      const audio = new Audio("/sounds/crowd_alarm.wav");
      audio.play().catch((err) => console.log("Audio blocked:", err));
    }}
    sx={{
      mt: 2,
      backgroundColor: colors.redAccent[400],
      "&:hover": { backgroundColor: colors.redAccent[600] },
    }}
  >
    Play Alert Sound
  </Button>
)}


        setTodayEvents(todayList);
        setOpenDialog(true);
        setNotifiedToday(true);
      }
    }
  }, [currentEvents, notifiedToday]);

  // 🔹 Add Event
  const handleAddEvent = async () => {
    if (!newEventTitle.trim()) return;
    const calendarApi = selectedDate.view.calendar;
    calendarApi.unselect();

    try {
      const res = await fetch("http://localhost:5000/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newEventTitle,
          start: selectedDate.startStr,
          end: selectedDate.endStr,
          allDay: selectedDate.allDay,
        }),
      });

      const newEvent = await res.json();
      setCurrentEvents((prev) => [...prev, newEvent]);
      setOpenAddDialog(false);
      setNewEventTitle("");
    } catch (err) {
      console.error("Error saving event:", err);
    }
  };

  // 🔹 Delete Event
  const handleDeleteEvent = async () => {
    try {
      await fetch(`http://localhost:5000/api/calendar/${selectedEvent.event.id}`, {
        method: "DELETE",
      });

      setCurrentEvents((prev) =>
        prev.filter((event) => event.id !== selectedEvent.event.id)
      );
      setOpenUpdateDialog(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  // 🔹 Update Event
  const handleUpdateEvent = async () => {
    if (!updatedEventTitle.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/calendar/${selectedEvent.event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updatedEventTitle,
          start: selectedEvent.event.startStr,
          end: selectedEvent.event.endStr,
          allDay: selectedEvent.event.allDay,
        }),
      });

      const updatedEvent = await res.json();
      setCurrentEvents((prev) =>
        prev.map((ev) => (ev.id === updatedEvent.id ? updatedEvent : ev))
      );
      setOpenUpdateDialog(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error("Error updating event:", err);
    }
  };

  const handleDateClick = (selected) => {
    setSelectedDate(selected);
    setNewEventTitle("");
    setOpenAddDialog(true);
  };

  const handleEventClick = (selected) => {
    setSelectedEvent(selected);
    setUpdatedEventTitle(selected.event.title);
    setOpenUpdateDialog(true);
  };

  return (
    <Box m="20px">
      <Header title="Calendar" subtitle="Add Events" />

      {/* Today's Events Pop-up */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            background: `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.blueAccent[500]} 100%)`,
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            color: colors.grey[100],
            fontSize: "1.8rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: 3,
            background: `linear-gradient(45deg, ${colors.primary[500]} 30%, ${colors.blueAccent[600]} 90%)`,
          }}
        >
          <NotificationsActiveIcon
            sx={{ fontSize: 40, color: colors.redAccent[400], mr: 2 }}
          />
          Today's Events
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", p: 3 }}>
          {todayEvents.map((e) => (
            <Fade in key={e.id} timeout={800}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  mb: 2,
                  background: colors.primary[300],
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "12px",
                  border: `2px solid ${colors.greenAccent[500]}`,
                }}
              >
                <EventIcon
                  sx={{ color: colors.greenAccent[500], mr: 2, fontSize: "2rem" }}
                />
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                    color: colors.grey[100],
                    textAlign: "left",
                    flexGrow: 1,
                    fontSize: "1.1rem",
                  }}
                >
                  {e.title}
                </Typography>
              </Paper>
            </Fade>
          ))}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3, pt: 0 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            variant="contained"
            sx={{
              borderRadius: "20px",
              px: 4,
              py: 1,
              background: colors.greenAccent[500],
              fontWeight: "bold",
              fontSize: "1rem",
              "&:hover": {
                background: colors.greenAccent[600],
                transform: "translateY(-2px)",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              },
            }}
          >
            Got It!
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Event Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        fullWidth
        maxWidth="sm"
        TransitionComponent={Transition}
        PaperProps={{
          sx: { borderRadius: "16px", overflow: "hidden", background: colors.primary[400] },
        }}
      >
        <IconButton
          aria-label="close"
          onClick={() => setOpenAddDialog(false)}
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
            color: colors.grey[100],
            backgroundColor: "rgba(255,255,255,0.1)",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
            zIndex: 10,
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogTitle
          sx={{
            textAlign: "center",
            background: `linear-gradient(45deg, ${colors.blueAccent[500]} 0%, ${colors.greenAccent[500]} 100%)`,
            color: colors.grey[100],
            fontSize: "1.6rem",
            py: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AddIcon sx={{ mr: 2, fontSize: "2rem" }} /> Add New Event
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <TextField
            fullWidth
            label="Event Title"
            value={newEventTitle}
            onChange={(e) => setNewEventTitle(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                backgroundColor: colors.primary[600],
                color: colors.grey[100],
                "& fieldset": { borderColor: colors.blueAccent[400] },
                "&:hover fieldset": { borderColor: colors.greenAccent[500] },
                "&.Mui-focused fieldset": { borderColor: colors.greenAccent[500] },
              },
              "& .MuiInputLabel-root": { color: colors.grey[400] },
              "& .MuiInputLabel-root.Mui-focused": { color: colors.greenAccent[500] },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, justifyContent: "center", gap: 2 }}>
          <Button
            onClick={() => setOpenAddDialog(false)}
            variant="outlined"
            sx={{
              borderRadius: "12px",
              px: 4,
              py: 1,
              fontWeight: "bold",
              fontSize: "1rem",
              borderColor: colors.grey[500],
              color: colors.grey[100],
              "&:hover": { borderColor: colors.grey[100], backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddEvent}
            variant="contained"
            disabled={!newEventTitle.trim()}
            sx={{
              borderRadius: "12px",
              px: 4,
              py: 1,
              fontWeight: "bold",
              fontSize: "1rem",
              background: `linear-gradient(45deg, ${colors.greenAccent[500]} 0%, ${colors.blueAccent[500]} 100%)`,
              "&:hover": {
                background: `linear-gradient(45deg, ${colors.greenAccent[600]} 0%, ${colors.blueAccent[600]} 100%)`,
                transform: "translateY(-2px)",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              },
              "&.Mui-disabled": { background: colors.grey[600], color: colors.grey[400] },
            }}
          >
            Add Event
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Event Dialog */}
      <Dialog
        open={openUpdateDialog}
        onClose={() => setOpenUpdateDialog(false)}
        fullWidth
        maxWidth="sm"
        TransitionComponent={Transition}
        PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden", background: colors.primary[400] } }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            background: `linear-gradient(45deg, ${colors.blueAccent[500]} 0%, ${colors.greenAccent[500]} 100%)`,
            color: colors.grey[100],
            fontSize: "1.6rem",
            py: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <EventIcon sx={{ mr: 2, fontSize: "2rem" }} /> Update Event
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <TextField
            fullWidth
            label="Event Title"
            value={updatedEventTitle}
            onChange={(e) => setUpdatedEventTitle(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                backgroundColor: colors.primary[600],
                color: colors.grey[100],
                "& fieldset": { borderColor: colors.blueAccent[400] },
                "&:hover fieldset": { borderColor: colors.greenAccent[500] },
                "&.Mui-focused fieldset": { borderColor: colors.greenAccent[500] },
              },
              "& .MuiInputLabel-root": { color: colors.grey[400] },
              "& .MuiInputLabel-root.Mui-focused": { color: colors.greenAccent[500] },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, justifyContent: "center", gap: 2 }}>
          <Button
            onClick={() => setOpenUpdateDialog(false)}
            variant="outlined"
            sx={{
              borderRadius: "12px",
              px: 4,
              py: 1,
              fontWeight: "bold",
              fontSize: "1rem",
              borderColor: colors.grey[500],
              color: colors.grey[100],
              "&:hover": { borderColor: colors.grey[100], backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateEvent}
            variant="contained"
            disabled={!updatedEventTitle.trim()}
            sx={{
              borderRadius: "12px",
              px: 4,
              py: 1,
              fontWeight: "bold",
              fontSize: "1rem",
              background: `linear-gradient(45deg, ${colors.greenAccent[500]} 0%, ${colors.blueAccent[500]} 100%)`,
              "&:hover": {
                background: `linear-gradient(45deg, ${colors.greenAccent[600]} 0%, ${colors.blueAccent[600]} 100%)`,
                transform: "translateY(-2px)",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              },
            }}
          >
            Update
          </Button>
          <Button
            onClick={handleDeleteEvent}
            variant="contained"
            sx={{
              borderRadius: "12px",
              px: 4,
              py: 1,
              fontWeight: "bold",
              fontSize: "1rem",
              background: `linear-gradient(45deg, ${colors.redAccent[500]} 0%, ${colors.redAccent[700]} 100%)`,
              "&:hover": {
                background: `linear-gradient(45deg, ${colors.redAccent[600]} 0%, ${colors.redAccent[800]} 100%)`,
                transform: "translateY(-2px)",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sidebar + Calendar */}
      <Box display="flex" justifyContent="space-between">
        <Box flex="1 1 20%" p="15px" borderRadius="4px" backgroundColor={colors.primary[400]}>
          <Typography variant="h5">Events</Typography>
          <List>
            {currentEvents.map((event) => {
              const today = new Date().toISOString().split("T")[0];
              const isToday = event.start.split("T")[0] === today;
              return (
                <ListItem
                  key={event.id}
                  sx={{
                    backgroundColor: isToday ? colors.redAccent[400] : colors.greenAccent[500],
                    margin: "10px 0",
                    borderRadius: "2px",
                  }}
                >
                  <ListItemText
                    primary={isToday ? `${event.title} (Today Received)` : event.title}
                    secondary={formatDate(event.start, { year: "numeric", month: "short", day: "numeric" })}
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>

        <Box flex="1 1 100%" ml="15px">
          <FullCalendar
            height="75vh"
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth" }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            select={handleDateClick}
            eventClick={handleEventClick}
            events={currentEvents.map((event) => ({
              id: event.id,
              title: event.title,
              start: event.start,
              end: event.end,
              allDay: event.allDay,
            }))}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Calendar;
