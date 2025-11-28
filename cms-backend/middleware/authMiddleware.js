const jwt = require("jsonwebtoken");

const normalizeRoles = roles => {
  if (!Array.isArray(roles)) return [];
  return roles
    .map(r => (typeof r === "string" ? r : r?.name))
    .filter(Boolean);
};

const protect = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(403)
      .json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
      roles: normalizeRoles(decoded.roles),
    };

    next();
  } catch (err) {
    console.error("JWT verify error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    const userRoles = req.user?.roles || [];
    const ok = allowedRoles.some(role => userRoles.includes(role));
    if (!ok) {
      return res
        .status(403)
        .json({ message: "Access denied. Insufficient role." });
    }
    next();
  };
};

const manager = (req, res, next) => {
  const userRoles = req.user?.roles || [];
  if (!userRoles.includes("manager")) {
    return res
      .status(403)
      .json({ message: "Not authorized as manager" });
  }
  next();
};

module.exports = { protect, checkRole, manager };
