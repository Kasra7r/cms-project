import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RefreshIcon from "@mui/icons-material/Refresh";
import api from "../services/api";
import { useTranslation } from "react-i18next";

export default function TasksPage() {
  const { t } = useTranslation("common");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "General",
    dueDate: "",
    status: "Pending",
  });

  const categories = ["General", "Work", "Personal", "Important"];
  const statuses = ["Pending", "In Progress", "Completed"];

  async function fetchTasks() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/tasks");
      setTasks(data.items || data || []);
    } catch {
      setError(t("tasks.loadError", "Failed to load tasks."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks =
    filter === "all"
      ? tasks
      : tasks.filter((t) => t.status === filter);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      category: "General",
      dueDate: "",
      status: "Pending",
    });
    setOpen(true);
  };

  const openEdit = (t) => {
    const id = t.id || t._id;
    setEditingId(id);
    setForm({
      title: t.title || "",
      description: t.description || "",
      category: t.category || "General",
      dueDate: t.dueDate ? String(t.dueDate).slice(0, 10) : "",
      status: t.status || "Pending",
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
        await api.patch(`/api/tasks/${editingId}`, form);
        setSuccess(t("tasks.updated", "Task updated."));
      } else {
        await api.post("/api/tasks", form);
        setSuccess(t("tasks.created", "Task created."));
      }
      setOpen(false);
      fetchTasks();
    } catch {
      setError(t("tasks.saveError", "Failed to save task."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(idLike) {
    const id = idLike?.id || idLike?._id || idLike;
    try {
      await api.delete(`/api/tasks/${id}`);
      setSuccess(t("tasks.deleted", "Task deleted."));
      fetchTasks();
    } catch {
      setError(t("tasks.deleteError", "Failed to delete task."));
    }
  }

  async function toggleStatus(t) {
    const id = t.id || t._id;
    try {
      const next =
        t.status === "Completed"
          ? "Pending"
          : t.status === "Pending"
          ? "In Progress"
          : "Completed";
      await api.patch(`/api/tasks/${id}`, { status: next });
      fetchTasks();
    } catch {
      setError(t("tasks.updateError", "Failed to update task."));
    }
  }

  const statusColor = (s) =>
    s === "Completed"
      ? "success"
      : s === "In Progress"
      ? "warning"
      : "default";

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        {t("pages.tasks.title", "Tasks")}
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

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
        >
          {t("tasks.new", "New task")}
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchTasks}
        >
          {t("tasks.refresh", "Refresh")}
        </Button>
        <FormControl
          size="small"
          sx={{ ml: "auto", minWidth: 150 }}
        >
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <MenuItem value="all">
              {t("tasks.filter.all", "All")}
            </MenuItem>
            {statuses.map((s) => (
              <MenuItem key={s} value={s}>
                {t(
                  `tasks.status.${s
                    .toLowerCase()
                    .replace(" ", "")}`,
                  s
                )}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Grid container spacing={2}>
        {filteredTasks.map((t) => {
          const id = t.id || t._id;
          return (
            <Grid item xs={12} md={6} lg={4} key={id}>
              <Paper
                sx={{
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, flex: 1 }}
                    noWrap
                  >
                    {t.title}
                  </Typography>
                  <IconButton
                    color="success"
                    onClick={() => toggleStatus(t)}
                  >
                    <CheckCircleIcon />
                  </IconButton>
                  <IconButton
                    color="primary"
                    onClick={() => openEdit(t)}
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
                <Typography
                  variant="body2"
                  color="text.secondary"
                  noWrap
                >
                  {t.description}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip
                    label={t(
                      `tasks.category.${(
                        t.category || "General"
                      )
                        .toLowerCase()
                        .replace(" ", "")}`,
                      t.category
                    )}
                  />
                  <Chip
                    label={t(
                      `tasks.status.${(t.status || "Pending")
                        .toLowerCase()
                        .replace(" ", "")}`,
                      t.status
                    )}
                    color={statusColor(t.status)}
                  />
                  {t.dueDate && (
                    <Chip
                      label={`${t(
                        "tasks.due",
                        "Due"
                      )}: ${new Date(
                        t.dueDate
                      ).toLocaleDateString()}`}
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Paper>
            </Grid>
          );
        })}

        {!filteredTasks.length && !loading && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">
                {t("tasks.none", "No tasks found.")}
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
            ? t("tasks.edit", "Edit task")
            : t("tasks.new", "New task")}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label={t("tasks.title", "Title")}
              name="title"
              value={form.title}
              onChange={onChange}
              required
              fullWidth
            />
            <TextField
              label={t("tasks.description", "Description")}
              name="description"
              value={form.description}
              onChange={onChange}
              multiline
              minRows={3}
              fullWidth
            />
            <TextField
              select
              label={t("tasks.category.label", "Category")}
              name="category"
              value={form.category}
              onChange={onChange}
              fullWidth
            >
              {categories.map((c) => (
                <MenuItem key={c} value={c}>
                  {t(
                    `tasks.category.${c
                      .toLowerCase()
                      .replace(" ", "")}`,
                    c
                  )}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label={t("tasks.status.label", "Status")}
              name="status"
              value={form.status}
              onChange={onChange}
              fullWidth
            >
              {statuses.map((s) => (
                <MenuItem key={s} value={s}>
                  {t(
                    `tasks.status.${s
                      .toLowerCase()
                      .replace(" ", "")}`,
                    s
                  )}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label={t("tasks.dueDate", "Due date")}
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={onChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
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
