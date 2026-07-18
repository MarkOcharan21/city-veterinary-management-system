// ============================================
// Global Error Handler Middleware
// ============================================

module.exports = (err, req, res, next) => {
  console.error("SERVER ERROR:");
  console.error(err.stack || err);

  const isDevelopment = process.env.NODE_ENV !== "production";

  res.status(err.status || 500).json({
    success: false,
    message: isDevelopment ? err.message : "Internal Server Error",
  });
};
