const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* -------------------------------------------------------
   Helper: Generate a signed JWT token for a user
-------------------------------------------------------- */
function signToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      roles: user.roles || [],
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/* -------------------------------------------------------
   Helper: Extract role names (handles object or string)
-------------------------------------------------------- */
function extractRoleNames(roles) {
  const arr = Array.isArray(roles) ? roles : [];
  const names = arr
    .map(r => (typeof r === "string" ? r : r?.name))
    .filter(Boolean);

  return names.length ? names : ["member"];
}

/* -------------------------------------------------------
   Helper: Normalize email formatting
-------------------------------------------------------- */
function normEmail(v) {
  return (v || "").trim().toLowerCase();
}

/* -------------------------------------------------------
   POST /api/auth/register
   Register a new user
-------------------------------------------------------- */
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password, roles: roleIds } = req.body || {};

    // Validate required fields
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "username, email and password are required." });
    }

    const emailN = normEmail(email);

    // Prevent duplicate email registration
    const exists = await User.findOne({ email: emailN });
    if (exists)
      return res
        .status(400)
        .json({ message: "User already exists with this email." });

    // Create user (password hashing handled by pre-save hook in schema)
    const user = await User.create({
      username: String(username).trim(),
      email: emailN,
      password,
      roles: Array.isArray(roleIds) ? roleIds : [],
    });

    // Populate roles to return readable names
    const populated = await User.findById(user._id).populate("roles", "name");
    const roleNames = extractRoleNames(populated?.roles);

    // Create JWT
    const token = signToken({
      _id: populated._id,
      email: populated.email,
      username: populated.username,
      roles: roleNames,
    });

    // Successful response
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
    // Handle duplicate email error
    if (err && err.code === 11000) {
      return res.status(400).json({ message: "Email already in use." });
    }

    console.error("register error:", err);
    return res
      .status(500)
      .json({ message: "Internal Server Error during registration" });
  }
};

/* -------------------------------------------------------
   POST /api/auth/login
   Authenticate user and return token
-------------------------------------------------------- */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    // Validate required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required." });
    }

    const emailN = normEmail(email);

    // Fetch user (password may require select: +password)
    let query = User.findOne({ email: emailN }).populate("roles", "name");
    query = query.select("+password"); // ensure password is included

    const user = await query;
    if (!user)
      return res.status(400).json({ message: "Invalid credentials." });

    // Compare password (use schema method if available)
    let isMatch = false;
    if (typeof user.matchPassword === "function") {
      isMatch = await user.matchPassword(password);
    } else {
      isMatch = await bcrypt.compare(password, user.password || "");
    }

    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials." });

    // Prepare token roles
    const roleNames = extractRoleNames(user.roles);

    // Create JWT
    const token = signToken({
      _id: user._id,
      email: user.email,
      username: user.username,
      roles: roleNames,
    });

    // Successful login response
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
    return res
      .status(500)
      .json({ message: "Internal Server Error during login" });
  }
};
