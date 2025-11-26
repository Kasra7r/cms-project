import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Box, Button, Chip, IconButton, LinearProgress, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchUsers() {
    setLoading(true); setError("");
    try {
      const { data } = await api.get("/api/users");
      setUsers(data || []);
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(id) {
    try {
      await api.delete(`/api/users/${id}`);
      fetchUsers();
    } catch {
      setError("Failed to delete user.");
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>Admin</Typography>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Paper sx={{ p: 2, mb: 2, color: "error.main" }}>{error}</Paper>}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 && !loading ? (
                <TableRow><TableCell colSpan={4} align="center">No users</TableCell></TableRow>
              ) : users.map(u => {
                const id = u._id || u.id;
                const roles = Array.isArray(u.roles) ? u.roles.map(r => r.name || r).join(", ") : "";
                return (
                  <TableRow key={id} hover>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell><Chip size="small" label={roles || "member"} /></TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton size="small"><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => deleteUser(id)}><DeleteIcon fontSize="small" /></IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
