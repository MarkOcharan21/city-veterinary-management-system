const express = require('express');
const router = express.Router();

const db = require('../config/db');

const verifyToken = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// ============================================
// GET AUDIT LOGS
// ============================================
router.get(
  '/',
  verifyToken,
  authorize('admin'),

  async (req, res) => {

    try {

      const { search = '' } = req.query;

      let sql = `
        SELECT
          a.log_id,
          a.user_id,
          u.full_name,
          a.action,
          a.module_name,
          a.description,
          a.created_at
        FROM audit_logs a
        LEFT JOIN users u
          ON a.user_id = u.user_id
      `;

      const params = [];

      if (search.trim() !== '') {

        sql += `
          WHERE
            u.full_name LIKE ?
            OR a.action LIKE ?
            OR a.module_name LIKE ?
            OR a.description LIKE ?
        `;

        const keyword = `%${search}%`;

        params.push(
          keyword,
          keyword,
          keyword,
          keyword
        );

      }

      sql += `
        ORDER BY a.created_at DESC
      `;

      const [logs] = await db.query(sql, params);

      res.json(logs);

    }

    catch (err) {

      console.error(err);

      res.status(500).json({
        message: 'Failed to fetch audit logs.'
      });

    }

  }
);

module.exports = router;