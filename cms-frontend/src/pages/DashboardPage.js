import React, { useEffect, useState } from "react";
import { Alert, Box, LinearProgress, Paper, Stack, Typography, Grid } from "@mui/material";
import api from "../services/api";
import { useTranslation } from "react-i18next";

export default function DashboardPage() {
  const { t } = useTranslation("common");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/api/dashboard/overview");
        setStats(data || {});
      } catch {
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        {t("pages.dashboard.title")}
      </Typography>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {!!error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t("menu.projects")}
            </Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>
              {stats?.projects ?? "—"}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t("menu.tasks")}
            </Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>
              {stats?.tasks ?? "—"}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t("menu.messages")}
            </Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>
              {stats?.messages ?? "—"}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {stats?.recentActivity?.length > 0 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            {t("dashboard.recentActivity", "Recent activity")}
          </Typography>

          <Stack spacing={1.5}>
            {stats.recentActivity.map((item, i) => (
              <Paper key={i} variant="outlined" sx={{ p: 1.5 }}>
                <Typography sx={{ fontWeight: 600 }}>{item.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.date ? new Date(item.date).toLocaleString() : ""}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
