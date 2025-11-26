// src/pages/SupportPage.jsx
import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  Grid,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import api from "../services/api";
import { useTranslation } from "react-i18next";

const priorities = ["Low", "Medium", "High", "Urgent"];

export default function SupportPage() {
  const { t } = useTranslation("common");

  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    subject: "",
    description: "",
    priority: "Low",
  });

  const statusColor = (s) =>
    s === "Resolved" || s === "Closed"
      ? "success"
      : s === "In Progress"
      ? "warning"
      : "default";

  async function fetchTickets() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(
        "/api/support/tickets"
      );
      setTickets(data.items || data || []);
    } catch {
      setError(
        t(
          "support.loadError",
          "Failed to load tickets."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTickets();
  }, []);

  const onChange = (e) =>
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (
      !form.subject.trim() ||
      !form.description.trim()
    ) {
      setError(
        t(
          "support.required",
          "Subject and description are required."
        )
      );
      return;
    }
    try {
      await api.post("/api/support/tickets", {
        subject: form.subject.trim(),
        description: form.description.trim(),
        priority: form.priority,
      });
      setSuccess(
        t("support.submitted", "Ticket submitted.")
      );
      setForm({
        subject: "",
        description: "",
        priority: "Low",
      });
      fetchTickets();
    } catch {
      setError(
        t(
          "support.submitError",
          "Failed to submit ticket."
        )
      );
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        {t("pages.support.title")}
      </Typography>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {!!error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {!!success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <Paper
            sx={{ p: 2 }}
            component="form"
            onSubmit={onSubmit}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 1 }}
            >
              {t("support.newTicket", "New ticket")}
            </Typography>
            <Stack spacing={1.5}>
              <TextField
                label={t("support.subject", "Subject")}
                name="subject"
                value={form.subject}
                onChange={onChange}
                required
              />
              <TextField
                label={t(
                  "support.description",
                  "Description"
                )}
                name="description"
                value={form.description}
                onChange={onChange}
                required
                multiline
                minRows={5}
              />
              <TextField
                select
                label={t(
                  "support.priority",
                  "Priority"
                )}
                name="priority"
                value={form.priority}
                onChange={onChange}
              >
                {priorities.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SendIcon />}
              >
                {t("support.submit", "Submit")}
              </Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 1 }}
            >
              {t(
                "support.yourTickets",
                "Your tickets"
              )}
            </Typography>
            <Stack spacing={1.5}>
              {tickets.length === 0 ? (
                <Typography color="text.secondary">
                  {t(
                    "support.noTickets",
                    "No tickets yet."
                  )}
                </Typography>
              ) : (
                tickets.map((tkt) => {
                  const id = tkt.id || tkt._id;
                  return (
                    <Paper
                      key={id}
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{ flex: 1, minWidth: 0 }}
                      >
                        <Typography
                          sx={{ fontWeight: 700 }}
                          noWrap
                        >
                          {tkt.subject}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                        >
                          #{id} •{" "}
                          {tkt.createdAt
                            ? new Date(
                                tkt.createdAt
                              ).toLocaleString()
                            : ""}
                        </Typography>
                      </Box>
                      <Chip label={tkt.priority} />
                      <Chip
                        label={tkt.status || "Open"}
                        color={statusColor(
                          tkt.status
                        )}
                      />
                    </Paper>
                  );
                })
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
