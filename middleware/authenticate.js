const jwt = require("jsonwebtoken");

/**
 * Middleware to verify JWT and attach decoded user to req.user.
 * Works for any role — pass the expected role to restrict further.
 *
 * Usage:
 *   authenticate              — any valid token
 *   authenticate("user")      — only tokens with role === "user"
 *   authenticate("admin")     — only tokens with role === "admin"
 */
const authenticate = (...allowedRoles) => (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization token missing",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = authenticate;