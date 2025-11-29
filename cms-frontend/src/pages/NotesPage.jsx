import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
  Grid,
  FormControlLabel,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../services/api";
import { useTranslation } from "react-i18next";

export default function NotesPage() {
  const { t } = useTranslation("common");

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: "", body: "", completed: false });

  async function fetchNotes() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/notes");
      const arr = data.items || data || [];
      setItems(
        arr.map((n) => ({
          ...n,
          completed: !!(n.completed || n.done),
        }))
      );
    } catch {
      setError(
        t("notes.loadError", "Failed to load notes.")
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ title: "", body: "", completed: false });
    setOpen(true);
  };

  const openEdit = (n) => {
    const id = n.id || n._id;
    setEditingId(id);
    setForm({
      title: n.title || "",
      body: n.body || "",
      completed: !!(n.completed || n.done),
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
    try {
      if (editingId) {
        await api.patch(`/api/notes/${editingId}`, form);
      } else {
        await api.post("/api/notes", form);
      }
      setOpen(false);
      fetchNotes();
    } catch {
      setError(
        t("notes.saveError", "Failed to save note.")
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(n) {
    try {
      await api.delete(`/api/notes/${n.id || n._id}`);
      fetchNotes();
    } catch {
      setError(
        t("notes.deleteError", "Failed to delete note.")
      );
    }
  }

  async function toggleCompleted(n) {
    const id = n.id || n._id;
    const nextCompleted = !n.completed;
    setItems((prev) =>
      prev.map((item) =>
        (item.id || item._id) === id
          ? { ...item, completed: nextCompleted }
          : item
      )
    );
    try {
      await api.patch(`/api/notes/${id}`, { completed: nextCompleted });
    } catch {
      fetchNotes();
    }
  }

  const completedCount = items.filter((n) => n.completed).length;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        {t("pages.notes.title")}
      </Typography>

      {(loading || saving) && <LinearProgress sx={{ mb: 2 }} />}
      {!!error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack
        direction="row"
        sx={{ mb: 2 }}
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
        >
          {t("notes.new", "New note")}
        </Button>
        <Chip
          label={`${t("notes.completed", "Completed")}: ${completedCount} / ${
            items.length
          }`}
          color="success"
          variant="outlined"
        />
      </Stack>

      <Grid container spacing={2}>
        {items.map((n) => {
          const id = n.id || n._id;
          return (
            <Grid key={id} item xs={12} md={6} lg={4}>
              <Paper
                sx={{
                  p: 2,
                  height: 220,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ mb: 1 }}
                >
                  <FormControlLabel
                    sx={{ mr: 0 }}
                    control={
                      <Checkbox
                        size="small"
                        checked={!!n.completed}
                        onChange={() => toggleCompleted(n)}
                      />
                    }
                    label=""
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      flex: 1,
                      textDecoration: n.completed ? "line-through" : "none",
                    }}
                    noWrap
                  >
                    {n.title || t("notes.untitled", "Untitled")}
                  </Typography>
                  <IconButton size="small" onClick={() => openEdit(n)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(n)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <Typography
                  sx={{
                    whiteSpace: "pre-wrap",
                    overflow: "auto",
                    flexGrow: 1,
                    color: n.completed ? "text.secondary" : "text.primary",
                    textDecoration: n.completed ? "line-through" : "none",
                  }}
                >
                  {n.body}
                </Typography>
              </Paper>
            </Grid>
          );
        })}

        {!items.length && !loading && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">
                {t("notes.none", "No notes yet.")}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingId
            ? t("notes.edit", "Edit note")
            : t("notes.new", "New note")}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} component="form" onSubmit={handleSave}>
            <TextField
              label={t("notes.title", "Title")}
              name="title"
              value={form.title}
              onChange={onChange}
              fullWidth
              required
            />
            <TextField
              label={t("notes.body", "Body")}
              name="body"
              value={form.body}
              onChange={onChange}
              fullWidth
              multiline
              minRows={5}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.completed}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      completed: e.target.checked,
                    }))
                  }
                />
              }
              label={t("notes.markCompleted", "Mark as completed")}
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
              : t("create", "Create")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
