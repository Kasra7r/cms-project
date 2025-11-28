const Project = require("../models/Project");

exports.createProject = async (req, res) => {
  try {
    const { name, owner, description, status, startDate, dueDate } = req.body || {};

    if (!name) {
      return res.status(400).json({ message: "Project name is required." });
    }

    const project = await Project.create({
      name: String(name).trim(),
      owner: owner ? String(owner).trim() : undefined,
      description: description ? String(description).trim() : undefined,
      status: status || "Planned",
      startDate: startDate ? new Date(startDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined
    });

    return res.status(201).json(project);
  } catch (err) {
    console.error("createProject error:", err);
    return res.status(500).json({ message: "Error creating project" });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const skip = (page - 1) * limit;

    const { q, status } = req.query || {};
    const filter = {};

    if (status) filter.status = status;

    if (q) {
      const regex = new RegExp(String(q).trim(), "i");
      filter.$or = [{ name: regex }, { owner: regex }, { description: regex }];
    }

    const [items, total] = await Promise.all([
      Project.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Project.countDocuments(filter)
    ]);

    return res.json({
      items,
      total,
      page,
      limit
    });
  } catch (err) {
    console.error("getProjects error:", err);
    return res.status(500).json({ message: "Error fetching projects" });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    return res.json(project);
  } catch (err) {
    console.error("getProjectById error:", err);
    return res.status(500).json({ message: "Error fetching project" });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { name, owner, description, status, startDate, dueDate } = req.body || {};

    const update = {};
    if (name !== undefined) update.name = String(name).trim();
    if (owner !== undefined) update.owner = owner ? String(owner).trim() : "";
    if (description !== undefined) update.description = description;
    if (status !== undefined) update.status = status;
    if (startDate !== undefined) update.startDate = startDate ? new Date(startDate) : null;
    if (dueDate !== undefined) update.dueDate = dueDate ? new Date(dueDate) : null;

    const project = await Project.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true
    });

    if (!project) return res.status(404).json({ message: "Project not found" });
    return res.json(project);
  } catch (err) {
    console.error("updateProject error:", err);
    return res.status(500).json({ message: "Error updating project" });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    return res.json({ message: "Project deleted" });
  } catch (err) {
    console.error("deleteProject error:", err);
    return res.status(500).json({ message: "Error deleting project" });
  }
};
