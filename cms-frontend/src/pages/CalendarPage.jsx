import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import api from "../services/api";
import { useTranslation } from "react-i18next";

export default function CalendarPage() {
  const { t } = useTranslation("common");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [events, setEvents] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  async function fetchEvents() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/calendar/events");
      const arr = data.items || data || [];
      setEvents(
        arr.map((e) => ({
          ...e,
          id: e.id || e._id || `${e.date}-${e.title}`,
          date: e.date || e.day || e.startDate,
        }))
      );
    } catch {
      setError("Failed to load events.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  const eventsOfDay = selectedDay
    ? events.filter((e) => {
        const d = new Date(e.date);
        return (
          d.getFullYear() === selectedDay.year() &&
          d.getMonth() === selectedDay.month() &&
          d.getDate() === selectedDay.date()
        );
      })
    : [];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        {t("pages.calendar.title")}
      </Typography>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {!!error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Paper sx={{ p: 2 }}>
          <DateCalendar value={selectedDay} onChange={setSelectedDay} />
        </Paper>

        <Paper sx={{ p: 2, flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {t("calendar.eventsOfDay", "Events of the day")}
          </Typography>

          {eventsOfDay.length === 0 ? (
            <Typography color="text.secondary">
              {t("calendar.noEvents", "No events for this day.")}
            </Typography>
          ) : (
            <List>
              {eventsOfDay.map((e) => (
                <ListItem key={e.id} disableGutters>
                  <ListItemText
                    primary={e.title}
                    secondary={
                      e.time
                        ? `${t("calendar.time", "Time")}: ${e.time}`
                        : e.description || ""
                    }
                  />
                  {e.type && <Chip label={e.type} />}
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Stack>
    </Box>
  );
}
