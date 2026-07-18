// ============================================
// Audit Logging Utility
// Saves user activities into audit_logs table
// ============================================

const db = require("../config/db");

/**
 * Save an audit log.
 *
 * @param {number} user_id
 * @param {string} action
 * @param {string} module_name
 * @param {string} description
 * @returns {Promise<boolean>}
 */

async function logAudit(user_id, action, module_name, description) {
  try {
    if (!user_id || !action || !module_name) {
      console.warn("Audit log skipped: Missing required fields.");
      return false;
    }

    await db.query(
      `
      INSERT INTO audit_logs
      (
        user_id,
        action,
        module_name,
        description
      )
      VALUES (?, ?, ?, ?)
      `,
      [user_id, action, module_name, description || null],
    );

    return true;
  } catch (err) {
    console.error("AUDIT LOG ERROR:");
    console.error(err.message);

    return false;
  }
}

module.exports = logAudit;
