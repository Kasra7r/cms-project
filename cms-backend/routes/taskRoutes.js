const express = require("express");
const router = express.Router();

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const { protect, checkRole } = require("../middleware/authMiddleware");

// /api/tasks
router.post("/", protect, checkRole(["admin", "manager"]), createTask);
router.get("/", protect, getTasks);
router.get("/:id", protect, getTaskById);
router.patch("/:id", protect, checkRole(["admin", "manager"]), updateTask);
router.delete("/:id", protect, checkRole(["admin", "manager"]), deleteTask);

module.exports = router;
