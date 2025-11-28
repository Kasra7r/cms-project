const express = require("express");
const Role = require("../models/Role");
const { protect, checkRole } = require("../middleware/authMiddleware");
const router = express.Router();

router.post(
  "/create",
  protect,
  checkRole(["admin", "manager"]),
  async (req, res) => {
    const { name, permissions } = req.body;
    try {
      const newRole = new Role({ name, permissions });
      await newRole.save();
      res.status(201).json(newRole);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: "Role name already exists" });
      }
      res.status(500).json({ message: "Error creating role" });
    }
  }
);

module.exports = router;
