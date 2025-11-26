// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// احراز هویت پایه
const protect = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(403).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // انتظار داریم توکن شامل roles باشد
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
      roles: decoded.roles || []     // ⬅️ بسیار مهم
    };

    next();
  } catch (err) {
    console.error('JWT verify error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// چک کردن نقش ها (RBAC)
const checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    const userRoles = req.user?.roles || [];

    // آیا حداقل یکی از نقش‌های مورد انتظار وجود دارد؟
    const ok = allowedRoles.some(role => userRoles.includes(role));
    if (!ok) {
      return res.status(403).json({ message: 'Access denied. Insufficient role.' });
    }

    next();
  };
};

// نقش خاص: فقط مدیر
const manager = (req, res, next) => {
  const userRoles = req.user?.roles || [];
  if (!userRoles.includes('manager')) {
    return res.status(403).json({ message: 'Not authorized as manager' });
  }
  next();
};

module.exports = { protect, checkRole, manager };
