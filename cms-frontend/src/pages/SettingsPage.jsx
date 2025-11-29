import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  Grid,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import RestoreIcon from "@mui/icons-material/Restore";
import api from "../services/api";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";

function applyLanguage(lang) {
  const isRTL = lang === "fa";
  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
  localStorage.setItem("language", lang);
  i18n.changeLanguage(lang);
  window.dispatchEvent(new Event("languageChanged"));
}

export default function SettingsPage() {
  const { t } = useTranslation("common");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [prefs, setPrefs] = useState({
    language: "en",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    emailNotifications: true,
    pushNotifications: false,
    weeklySummary: true,
    compactSidebar: false,
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/api/settings");
        if (data) {
          setPrefs((p) => ({ ...p, ...data }));
          if (data.language) {
            applyLanguage(data.language);
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === "checkbox" ? checked : value;

    setPrefs((p) => ({
      ...p,
      [name]: nextValue,
    }));

    if (name === "language") {
      applyLanguage(nextValue);
    }
  };

  async function onSave(e) {
    e?.preventDefault?.();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.patch("/api/settings", prefs);
      setSuccess(t("settings.saved", "Settings saved."));
    } catch {
      setError(t("settings.saveError", "Failed to save settings."));
    } finally {
      setSaving(false);
    }
  }

  function onReset() {
    const base = {
      language: "en",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      emailNotifications: true,
      pushNotifications: false,
      weeklySummary: true,
      compactSidebar: false,
    };
    setPrefs(base);
    applyLanguage(base.language);
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        {t("pages.settings.title")}
      </Typography>

      {(loading || saving) && <LinearProgress sx={{ mb: 2 }} />}
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

      <Paper sx={{ p: 3 }} component="form" onSubmit={onSave}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              select
              label={t("settings.language", "Language")}
              name="language"
              value={prefs.language}
              onChange={onChange}
              fullWidth
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="fa">Farsi</MenuItem>
              <MenuItem value="de">German</MenuItem>
              <MenuItem value="fr">French</MenuItem>
              <MenuItem value="it">Italian</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label={t("settings.timezone", "Timezone")}
              name="timezone"
              value={prefs.timezone}
              onChange={onChange}
              fullWidth
              placeholder="e.g. Europe/Berlin"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl component="fieldset" variant="standard">
              <FormLabel component="legend">
                {t("settings.notifications", "Notifications")}
              </FormLabel>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="emailNotifications"
                      checked={prefs.emailNotifications}
                      onChange={onChange}
                    />
                  }
                  label={t(
                    "settings.emailNotifications",
                    "Email notifications"
                  )}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="pushNotifications"
                      checked={prefs.pushNotifications}
                      onChange={onChange}
                    />
                  }
                  label={t(
                    "settings.pushNotifications",
                    "Push notifications"
                  )}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="weeklySummary"
                      checked={prefs.weeklySummary}
                      onChange={onChange}
                    />
                  }
                  label={t("settings.weeklySummary", "Weekly summary")}
                />
              </FormGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  name="compactSidebar"
                  checked={prefs.compactSidebar}
                  onChange={onChange}
                />
              }
              label={t("settings.compactSidebar", "Compact sidebar")}
            />
            <Typography variant="body2" color="text.secondary">
              {t(
                "settings.compactSidebarHint",
                "If enabled, the dashboard left menu uses a denser spacing."
              )}
            </Typography>
          </Grid>
        </Grid>

        <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" startIcon={<SaveIcon />}>
            {t("settings.save", "Save")}
          </Button>
          <Button
            type="button"
            variant="outlined"
            startIcon={<RestoreIcon />}
            onClick={onReset}
          >
            {t("settings.reset", "Reset")}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
