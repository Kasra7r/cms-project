import React, { useEffect, useState } from "react";
import { Alert, Box, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import api from "../services/api";
import { useTranslation } from "react-i18next";

export default function AnalyticsPage() {
  const { t } = useTranslation("common");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState([]);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/analytics");
      const arr = data?.summary || [];
      setData(arr);
    } catch {
      setError("Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const total = data.reduce((sum, r) => sum + (r.value || 0), 0);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        {t("pages.analytics.title")}
      </Typography>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {!!error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={4}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t("analytics.total", "Total")}
            </Typography>
            <Typography variant="h4">{total}</Typography>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t("analytics.count", "Entries")}
            </Typography>
            <Typography variant="h4">{data.length}</Typography>
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        {data.length === 0 ? (
          <Typography color="text.secondary">
            {t("analytics.noData", "No analytics data available.")}
          </Typography>
        ) : (
          <Box sx={{ width: "100%", height: 350 }}>
            <ResponsiveContainer>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#1976d2" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
