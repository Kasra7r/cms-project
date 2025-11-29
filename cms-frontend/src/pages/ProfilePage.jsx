import React, { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
  Alert,
  Grid,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import SaveIcon from "@mui/icons-material/Save";
import api from "../services/api";
import { useTranslation } from "react-i18next";

function getAuthHeaders() {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function ProfilePage() {
  const { t } = useTranslation("common");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    bio: "",
    avatarUrl: "",
  });
  const [pw, setPw] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    setSuccess("");
    api
      .get("/api/users/me")
      .then(({ data }) => {
        if (!mounted) return;
        setForm((prev) => ({
          ...prev,
          username: data.username || data.name || "",
          email: data.email || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          bio: data.bio || "",
          avatarUrl: data.avatarUrl || data.avatar || "",
        }));
      })
      .catch(() => {
        if (mounted)
          setError(
            t("profile.loadError", "Failed to load profile.")
          );
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [t]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        username: form.username,
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        bio: form.bio,
      };
      await api.patch("/api/users/me", payload);
      setSuccess(
        t("profile.saved", "Profile saved.")
      );
    } catch {
      setError(
        t("profile.saveError", "Failed to save profile.")
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(file) {
    if (!file) return;
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const { data } = await api.post(
        "/api/users/me/avatar",
        fd,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...getAuthHeaders(),
          },
        }
      );
      setForm((f) => ({
        ...f,
        avatarUrl: data?.avatarUrl || f.avatarUrl,
      }));
      setSuccess(
        t("profile.avatarUpdated", "Avatar updated.")
      );
    } catch {
      setError(
        t(
          "profile.avatarError",
          "Failed to upload avatar."
        )
      );
    } finally {
      setSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwSaving(true);
    setError("");
    setSuccess("");
    if (!pw.currentPassword || !pw.newPassword) {
      setPwSaving(false);
      setError(
        t(
          "profile.passwordFill",
          "Fill current and new password."
        )
      );
      return;
    }
    if (pw.newPassword !== pw.confirmPassword) {
      setPwSaving(false);
      setError(
        t("profile.passwordMismatch", "Passwords do not match.")
      );
      return;
    }
    try {
      await api.post("/api/users/me/password", {
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      setSuccess(
        t("profile.passwordUpdated", "Password updated.")
      );
      setPw({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      setError(
        t(
          "profile.passwordError",
          "Failed to update password."
        )
      );
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        {t("pages.profile.title")}
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
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Stack alignItems="center" spacing={2}>
              <Avatar
                src={form.avatarUrl || undefined}
                alt={form.username || "Avatar"}
                sx={{ width: 120, height: 120, fontSize: 40 }}
              >
                {form.username?.charAt(0)?.toUpperCase() || "U"}
              </Avatar>
              <Stack direction="row" spacing={1}>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  ref={fileInputRef}
                  onChange={(e) =>
                    handleAvatarChange(e.target.files?.[0])
                  }
                />
                <Button
                  variant="contained"
                  startIcon={<PhotoCamera />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                >
                  {t("profile.upload", "Upload")}
                </Button>
              </Stack>
              <Divider flexItem sx={{ my: 2 }} />
              <Stack spacing={0.5} sx={{ textAlign: "center" }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700 }}
                >
                  {form.firstName || form.lastName
                    ? `${form.firstName} ${form.lastName}`.trim()
                    : form.username || "—"}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {form.email || "no-email"}
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper
            sx={{ p: 3 }}
            component="form"
            onSubmit={handleSaveProfile}
          >
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: 700 }}
            >
              {t("profile.accountDetails", "Account details")}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t("profile.username", "Username")}
                  name="username"
                  value={form.username}
                  onChange={onChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t("profile.email", "Email")}
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t(
                    "profile.firstName",
                    "First name"
                  )}
                  name="firstName"
                  value={form.firstName}
                  onChange={onChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t(
                    "profile.lastName",
                    "Last name"
                  )}
                  name="lastName"
                  value={form.lastName}
                  onChange={onChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t("profile.bio", "Bio")}
                  name="bio"
                  value={form.bio}
                  onChange={onChange}
                  fullWidth
                  multiline
                  minRows={3}
                />
              </Grid>
            </Grid>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ mt: 3 }}
            >
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={saving}
              >
                {t("saveChanges", "Save changes")}
              </Button>
            </Stack>
          </Paper>

          <Paper
            sx={{ p: 3, mt: 2 }}
            component="form"
            onSubmit={handleChangePassword}
          >
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: 700 }}
            >
              {t("profile.changePassword", "Change password")}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label={t(
                    "profile.currentPassword",
                    "Current password"
                  )}
                  type="password"
                  value={pw.currentPassword}
                  onChange={(e) =>
                    setPw((p) => ({
                      ...p,
                      currentPassword: e.target.value,
                    }))
                  }
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label={t(
                    "profile.newPassword",
                    "New password"
                  )}
                  type="password"
                  value={pw.newPassword}
                  onChange={(e) =>
                    setPw((p) => ({
                      ...p,
                      newPassword: e.target.value,
                    }))
                  }
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label={t(
                    "profile.confirmPassword",
                    "Confirm new password"
                  )}
                  type="password"
                  value={pw.confirmPassword}
                  onChange={(e) =>
                    setPw((p) => ({
                      ...p,
                      confirmPassword: e.target.value,
                    }))
                  }
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ mt: 3 }}
            >
              <Button
                type="submit"
                variant="contained"
                disabled={pwSaving}
              >
                {t(
                  "profile.updatePassword",
                  "Update password"
                )}
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
