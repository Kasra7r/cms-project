const Task = require("../models/Task");

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      assignedTo,
      status,
      dueDate,
      category,
    } = req.body || {};

    if (!title) {
      return res.status(400).json({ message: "Task title is required." });
    }

    const task = await Task.create({
      title: String(title).trim(),
      description: description ? String(description).trim() : "",
      project: project || undefined,
      assignedTo: assignedTo || undefined,
      status: status || "Pending",
      dueDate: dueDate ? new Date(dueDate) : undefined,
      category: category || "General",
    });

    return res.status(201).json(task);
  } catch (err) {
    console.error("createTask error:", err);
    return res.status(500).json({ message: "Error creating task" });
  }
};

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("project", "name title")
      .populate("assignedTo", "username email")
      .sort({ createdAt: -1 });

    return res.json(tasks);
  } catch (err) {
    console.error("getTasks error:", err);
    return res.status(500).json({ message: "Error fetching tasks" });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("project", "name title")
      .populate("assignedTo", "username email");

    if (!task) return res.status(404).json({ message: "Task not found" });
    return res.json(task);
  } catch (err) {
    console.error("getTaskById error:", err);
    return res.status(500).json({ message: "Error fetching task" });
  }
};

const updateTask = async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      assignedTo,
      status,
      dueDate,
      category,
    } = req.body || {};

    const update = {};
    if (title !== undefined) update.title = String(title).trim();
    if (description !== undefined) update.description = description;
    if (project !== undefined) update.project = project || null;
    if (assignedTo !== undefined) update.assignedTo = assignedTo || null;
    if (status !== undefined) update.status = status;
    if (dueDate !== undefined) {
      update.dueDate = dueDate ? new Date(dueDate) : null;
    }
    if (category !== undefined) update.category = category;

    const task = await Task.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!task) return res.status(404).json({ message: "Task not found" });
    return res.json(task);
  } catch (err) {
    console.error("updateTask error:", err);
    return res.status(500).json({ message: "Error updating task" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    return res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("deleteTask error:", err);
    return res.status(500).json({ message: "Error deleting task" });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
