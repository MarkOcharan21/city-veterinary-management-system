// ============================================
// JWT Authentication Middleware
// Verifies the user's access token
// ============================================

const jwt = require("jsonwebtoken");

require("dotenv").config();

module.exports = function verifyToken(req, res, next) {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured.");
    }

    // ------------------------------------
    // Get Authorization Header
    // ------------------------------------

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // ------------------------------------
    // Check Bearer Format
    // ------------------------------------

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format.",
      });
    }

    // ------------------------------------
    // Verify JWT
    // ------------------------------------

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ------------------------------------
    // Store User Information
    // ------------------------------------

    req.user = decoded;

    next();
  } catch (err) {
    console.error("AUTH ERROR:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};
