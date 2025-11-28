const express = require("express");
const { checkRole } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/create", checkRole(["admin", "manager"]), async (req, res) => {
  res.status(201).json({ message: "Created successfully" });
});

router.put("/update", checkRole(["admin", "manager"]), async (req, res) => {
  res.status(200).json({ message: "Updated successfully" });
});

module.exports = router;
