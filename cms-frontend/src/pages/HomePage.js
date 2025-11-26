import React from "react";
import { Box, Button, Stack, Typography, Paper } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        px: 2,
      }}
    >
      <Paper
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 600,
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
          PageCraft Dashboard
        </Typography>
        <Typography variant="h6" sx={{ mb: 4 }}>
          A modern workspace to manage projects, tasks, teams and analytics — in
          one place.
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate("/register")}
          >
            Register
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
