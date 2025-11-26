const express = require("express");
const Role = require("../models/Role");
const { protect, checkRole } = require("../middleware/authMiddleware");
const router = express.Router();

// فقط ادمین / منیجر اجازه ساخت نقش دارند
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
      res.status(500).json({ message: "Error creating role" });
    }
  }
);

module.exports = router;
