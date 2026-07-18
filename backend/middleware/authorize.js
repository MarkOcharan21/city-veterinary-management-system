// ============================================
// Role Authorization Middleware
// Restricts route access based on user roles
// ============================================

module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // ------------------------------------
      // Validate Middleware Configuration
      // ------------------------------------

      if (allowedRoles.length === 0) {
        throw new Error("No roles specified for authorize middleware.");
      }

      // ------------------------------------
      // Check Authentication
      // ------------------------------------

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized. Please log in.",
        });
      }

      // ------------------------------------
      // Check Role Permission
      // ------------------------------------

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied. You do not have permission to perform this action.",
        });
      }

      next();
    } catch (err) {
      console.error("AUTHORIZE ERROR:", err.message);

      return res.status(500).json({
        success: false,
        message: "Authorization failed.",
      });
    }
  };
};
