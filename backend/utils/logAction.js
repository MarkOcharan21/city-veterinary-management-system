const db = require("../config/db");

/**
 * Logs an action to the audit_logs table.
 *
 * @param {number} userId
 * @param {string} action
 * @param {string} moduleName
 * @param {string} description
 * @returns {Promise<boolean>}
 */

const logAction = async (userId, action, moduleName, description) => {
  try {
    if (!userId || !action || !moduleName) {
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
      [userId, action, moduleName, description || null],
    );

    return true;
  } catch (error) {
    console.error("AUDIT LOG ERROR:");
    console.error(error.message);

    return false;
  }
};

module.exports = logAction;
