import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
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
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import api from "../services/api";
import { useTranslation } from "react-i18next";

const statusOptions = ["Planned", "In Progress", "Completed", "On Hold"];

export default function ProjectsPage() {
  const { t } = useTranslation("common");

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    owner: "",
    status: "Planned",
    startDate: "",
    dueDate: "",
    description: "",
  });

  async function fetchProjects() {
    setLoading(true);
    setError("");
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        q: q || undefined,
        status: status || undefined,
      };
      const { data } = await api.get("/api/projects", { params });
      const items = data.items || data.projects || [];
      const totalCount =
        data.total ?? data.count ?? items.length;
      setRows(items);
      setTotal(totalCount);
    } catch {
      setError(
        t(
          "projects.loadError",
          "Failed to load projects."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, [page, rowsPerPage]);

  const handleSearch = (e) => {
    e?.preventDefault?.();
    setPage(0);
    fetchProjects();
  };
  const resetForm = () =>
    setForm({
      name: "",
      owner: "",
      status: "Planned",
      startDate: "",
      dueDate: "",
      description: "",
    });
  const handleOpenCreate = () => {
    setEditingId(null);
    resetForm();
    setOpen(true);
  };
  const handleOpenEdit = (row) => {
    setEditingId(row._id || row.id);
    setForm({
      name: row.name || "",
      owner: row.owner || "",
      status: row.status || "Planned",
      startDate: row.startDate
        ? dayjs(row.startDate).format("YYYY-MM-DD")
        : "",
      dueDate: row.dueDate
        ? dayjs(row.dueDate).format("YYYY-MM-DD")
        : "",
      description: row.description || "",
    });
    setOpen(true);
  };
  const handleCloseDialog = () => {
    if (!saving) setOpen(false);
  };
  const onFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    const payload = {
      name: form.name?.trim(),
      owner: form.owner?.trim(),
      status: form.status,
      startDate: form.startDate
        ? new Date(form.startDate).toISOString()
        : null,
      dueDate: form.dueDate
        ? new Date(form.dueDate).toISOString()
        : null,
      description: form.description?.trim(),
    };
    try {
      if (editingId) {
        await api.patch(
          `/api/projects/${editingId}`,
          payload
        );
        setSuccess(
          t("projects.updated", "Project updated.")
        );
      } else {
        await api.post("/api/projects", payload);
        setSuccess(
          t("projects.created", "Project created.")
        );
      }
      setOpen(false);
      fetchProjects();
    } catch {
      setError(
        t(
          "projects.saveError",
          "Failed to save project."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row) {
    const id = row._id || row.id;
    try {
      await api.delete(`/api/projects/${id}`);
      const newCount = total - 1;
      const maxPage = Math.max(
        0,
        Math.ceil(newCount / rowsPerPage) - 1
      );
      if (page > maxPage) setPage(maxPage);
      fetchProjects();
    } catch {
      setError(
        t(
          "projects.deleteError",
          "Failed to delete project."
        )
      );
    }
  }

  const statusColor = (s) =>
    s === "Completed"
      ? "success"
      : s === "In Progress"
      ? "primary"
      : s === "On Hold"
      ? "warning"
      : "default";

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        {t("pages.projects.title")}
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

      <Paper
        sx={{ p: 2, mb: 2 }}
        component="form"
        onSubmit={handleSearch}
      >
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          flexWrap="wrap"
        >
          <TextField
            placeholder={t(
              "projects.searchPlaceholder",
              "Search by name or owner…"
            )}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <FormControl>
            <InputLabel id="status-label">
              {t("projects.status", "Status")}
            </InputLabel>
            <Select
              labelId="status-label"
              label={t("projects.status", "Status")}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">
                {t("projects.status.all", "All")}
              </MenuItem>
              {statusOptions.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SearchIcon />}
          >
            {t("projects.search", "Search")}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              setQ("");
              setStatus("");
              setPage(0);
              fetchProjects();
            }}
          >
            {t("projects.reset", "Reset")}
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            {t("projects.new", "New project")}
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 0, overflow: "hidden" }}>
        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>
                  {t("projects.name", "Name")}
                </TableCell>
                <TableCell>
                  {t("projects.owner", "Owner")}
                </TableCell>
                <TableCell>
                  {t("projects.status", "Status")}
                </TableCell>
                <TableCell>
                  {t("projects.start", "Start")}
                </TableCell>
                <TableCell>
                  {t("projects.due", "Due")}
                </TableCell>
                <TableCell align="right">
                  {t("projects.actions", "Actions")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {t(
                      "projects.none",
                      "No projects found."
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r._id || r.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {r.name}
                    </TableCell>
                    <TableCell>
                      {r.owner || "—"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={r.status || "Planned"}
                        color={statusColor(r.status)}
                      />
                    </TableCell>
                    <TableCell>
                      {r.startDate
                        ? dayjs(r.startDate).format(
                            "YYYY-MM-DD"
                          )
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {r.dueDate
                        ? dayjs(r.dueDate).format(
                            "YYYY-MM-DD"
                          )
                        : "—"}
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="flex-end"
                      >
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleOpenEdit(r)
                          }
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            handleDelete(r)
                          }
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      <Dialog
        open={open}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {editingId
            ? t("projects.edit", "Edit project")
            : t("projects.new", "New project")}
          <Box sx={{ ml: "auto" }}>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stack
            spacing={2}
            component="form"
            onSubmit={handleSave}
          >
            <TextField
              label={t("projects.name", "Name")}
              name="name"
              value={form.name}
              onChange={onFormChange}
              required
            />
            <TextField
              label={t("projects.owner", "Owner")}
              name="owner"
              value={form.owner}
              onChange={onFormChange}
            />
            <FormControl>
              <InputLabel id="status2">
                {t("projects.status", "Status")}
              </InputLabel>
              <Select
                labelId="status2"
                label={t("projects.status", "Status")}
                name="status"
                value={form.status}
                onChange={onFormChange}
              >
                {statusOptions.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label={t(
                "projects.startDate",
                "Start date"
              )}
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={onFormChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label={t("projects.dueDate", "Due date")}
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={onFormChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label={t(
                "projects.description",
                "Description"
              )}
              name="description"
              value={form.description}
              onChange={onFormChange}
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
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
