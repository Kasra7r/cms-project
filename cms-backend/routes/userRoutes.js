const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { protect, checkRole } = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  changePassword
} = require("../controllers/userController");
const User = require("../models/User");
const Role = require("../models/Role");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

router.get("/me", protect, getProfile);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/profile/avatar", protect, upload.single("avatar"), uploadAvatar);
router.delete("/profile/avatar", protect, deleteAvatar);
router.put("/profile/password", protect, changePassword);

router.get("/", protect, checkRole(["admin", "manager"]), async (req, res) => {
  try {
    const users = await User.find().populate("roles", "name");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

router.delete("/:id", protect, checkRole(["admin"]), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user" });
  }
});

router.patch(
  "/:id/role",
  protect,
  checkRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const { role } = req.body;
      if (!role) return res.status(400).json({ message: "Role name is required" });

      const user = await User.findById(req.params.id).populate("roles", "name");
      if (!user) return res.status(404).json({ message: "User not found" });

      const roleDoc = await Role.findOne({ name: role });
      if (!roleDoc) return res.status(404).json({ message: "Role not found" });

      const hasRole = user.roles.some(r => r.name === role);

      if (hasRole) {
        user.roles = user.roles.filter(r => r.name !== role);
      } else {
        user.roles.push(roleDoc._id);
      }

      await user.save();
      const updated = await User.findById(user._id).populate("roles", "name");
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Error updating role" });
    }
  }
);

module.exports = router;
