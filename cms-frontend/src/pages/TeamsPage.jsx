import React, { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  IconButton,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../services/api";
import { useTranslation } from "react-i18next";

const roles = ["Admin", "Editor", "Viewer"];

export default function TeamsPage() {
  const { t } = useTranslation("common");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [teams, setTeams] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    role: "Viewer",
    email: "",
    avatar: "",
  });

  async function fetchTeams() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/teams");
      setTeams(data.items || data || []);
    } catch {
      setError(t("teams.loadError", "Failed to load teams."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTeams();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      name: "",
      role: "Viewer",
      email: "",
      avatar: "",
    });
    setOpen(true);
  };

  const openEdit = (member) => {
    const id = member.id || member._id;
    setEditingId(id);
    setForm({
      name: member.name || "",
      role: member.role || "Viewer",
      email: member.email || "",
      avatar: member.avatar || "",
    });
    setOpen(true);
  };

  const closeDialog = () => !saving && setOpen(false);
  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function handleSave(e) {
    e?.preventDefault?.();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (editingId) {
        await api.patch(`/api/teams/${editingId}`, form);
        setSuccess(
          t("teams.updated", "Member updated.")
        );
      } else {
        await api.post("/api/teams", form);
        setSuccess(
          t("teams.added", "Member added.")
        );
      }
      setOpen(false);
      fetchTeams();
    } catch {
      setError(
        t("teams.saveError", "Failed to save member.")
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(idLike) {
    const id = idLike?.id || idLike?._id || idLike;
    try {
      await api.delete(`/api/teams/${id}`);
      setSuccess(
        t("teams.deleted", "Member deleted.")
      );
      fetchTeams();
    } catch {
      setError(
        t(
          "teams.deleteError",
          "Failed to delete member."
        )
      );
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        {t("pages.teams.title", "Teams")}
      </Typography>
      {(loading || saving) && (
        <LinearProgress sx={{ mb: 2 }} />
      )}
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

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
        >
          {t("teams.addMember", "Add member")}
        </Button>
      </Stack>

      <Grid container spacing={2}>
        {teams.map((m) => {
          const id = m.id || m._id;
          return (
            <Grid
              key={id}
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
            >
              <Paper
                sx={{
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Avatar
                  src={m.avatar}
                  alt={m.name}
                  sx={{
                    width: 70,
                    height: 70,
                    bgcolor: "primary.main",
                  }}
                >
                  {m.name?.[0]?.toUpperCase() || "U"}
                </Avatar>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700 }}
                >
                  {m.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {m.email}
                </Typography>
                <Chip
                  label={t(
                    `teams.role.${(m.role || "Viewer")
                      .toLowerCase()}`,
                    m.role
                  )}
                  color="primary"
                />
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 1 }}
                >
                  <IconButton
                    color="primary"
                    onClick={() => openEdit(m)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Paper>
            </Grid>
          );
        })}
        {!teams.length && !loading && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">
                {t(
                  "teams.none",
                  "No team members found."
                )}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      <Dialog
        open={open}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingId
            ? t("teams.editMember", "Edit member")
            : t("teams.addMember", "Add member")}
        </DialogTitle>
        <DialogContent dividers>
          <Stack
            spacing={2}
            component="form"
            onSubmit={handleSave}
          >
            <TextField
              label={t("teams.name", "Name")}
              name="name"
              value={form.name}
              onChange={onChange}
              required
            />
            <TextField
              label={t("teams.email", "Email")}
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              required
            />
            <TextField
              select
              label={t("teams.role.label", "Role")}
              name="role"
              value={form.role}
              onChange={onChange}
            >
              {roles.map((r) => (
                <MenuItem key={r} value={r}>
                  {t(
                    `teams.role.${r.toLowerCase()}`,
                    r
                  )}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label={t(
                "teams.avatar",
                "Avatar URL (optional)"
              )}
              name="avatar"
              value={form.avatar}
              onChange={onChange}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>
            {t("cancel", "Cancel")}
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
          >
            {editingId
              ? t("saveChanges", "Save changes")
              : t("teams.addMember", "Add member")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
