// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ---- helpers
function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, username: user.username, roles: user.roles || [] },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function extractRoleNames(roles) {
  const arr = Array.isArray(roles) ? roles : [];
  const names = arr.map(r => (typeof r === "string" ? r : r?.name)).filter(Boolean);
  return names.length ? names : ["member"];
}

function normEmail(v) {
  return (v || "").trim().toLowerCase();
}

// ---- POST /api/auth/register
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password, roles: rolesIds } = req.body || {};
    if (!username || !email || !password) {
      return res.status(400).json({ message: "username, email and password are required." });
    }

    const emailN = normEmail(email);

    const exists = await User.findOne({ email: emailN });
    if (exists) return res.status(400).json({ message: "User already exists with this email." });

    // اگر اسکیما pre-save hash دارد، همان را استفاده می‌کنیم
    const user = await User.create({
      username: String(username).trim(),
      email: emailN,
      password, // pre-save hook hashes it
      roles: Array.isArray(rolesIds) ? rolesIds : [],
    });

    const populated = await User.findById(user._id).populate("roles", "name");
    const roleNames = extractRoleNames(populated?.roles);

    const token = signToken({
      _id: populated._id,
      email: populated.email,
      username: populated.username,
      roles: roleNames,
    });

    return res.status(201).json({
      token,
      user: {
        id: populated._id.toString(),
        name: populated.username,
        email: populated.email,
        roles: roleNames,
      },
    });
  } catch (err) {
    // duplicate key safety
    if (err && err.code === 11000) {
      return res.status(400).json({ message: "Email already in use." });
    }
    console.error("register error:", err);
    return res.status(500).json({ message: "Internal Server Error during registration" });
  }
};

// ---- POST /api/auth/login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required." });
    }

    const emailN = normEmail(email);

    // اگر در مدل password: { select: false } هست، باید +password بگیریم
    let query = User.findOne({ email: emailN }).populate("roles", "name");
    // اطمینان از داشتن فیلد password برای matchPassword:
    query = query.select("+password");
    const user = await query;

    if (!user) return res.status(400).json({ message: "Invalid credentials." });

    // اگر متد matchPassword دارید از همان استفاده می‌کنیم؛ وگرنه fallback
    let isMatch = false;
    if (typeof user.matchPassword === "function") {
      isMatch = await user.matchPassword(password);
    } else {
      isMatch = await bcrypt.compare(password, user.password || "");
    }
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials." });

    const roleNames = extractRoleNames(user.roles);
    const token = signToken({
      _id: user._id,
      email: user.email,
      username: user.username,
      roles: roleNames,
    });

    return res.status(200).json({
      token,
      user: {
        id: user._id.toString(),
        name: user.username,
        email: user.email,
        roles: roleNames,
      },
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Internal Server Error during login" });
  }
};
