const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const db = require("../config/db");

const verifyToken = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const logAudit = require("../utils/logAudit");

// ============================================
// GET ALL USERS
// ============================================
router.get(
  "/",
  verifyToken,
  authorize("admin"),

  async (req, res) => {
    try {
      const [users] = await db.query(`
        SELECT
            user_id,
            full_name,
            email,
            role,
            is_active,
            last_login,
            created_at
        FROM users
        ORDER BY created_at DESC
      `);

      res.json(users);
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: "Failed to fetch users.",
      });
    }
  },
);

// ============================================
// GET ALL PET OWNER USERS
// ============================================
router.get(
  "/pet-owners",
  verifyToken,

  async (req, res) => {
    try {
      const [users] = await db.query(`
        SELECT
            u.user_id,
            u.full_name,
            u.email
        FROM users u
        LEFT JOIN owners o
            ON u.user_id = o.user_id
        WHERE
            u.role = 'pet_owner'
            AND o.owner_id IS NULL
        ORDER BY u.full_name ASC
      `);

      res.json(users);
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: "Failed to fetch pet owners.",
      });
    }
  },
);

// ============================================
// CREATE USER
// ============================================
router.post(
  "/",
  verifyToken,
  authorize("admin"),

  async (req, res) => {
    try {
      let { full_name, email, password, role } = req.body;

      full_name = full_name?.trim();
      email = email?.trim().toLowerCase();

      if (!full_name || !email || !password || !role) {
        return res.status(400).json({
          message: "All fields are required.",
        });
      }

      const validRoles = ["admin", "veterinarian", "staff", "pet_owner"];

      if (!validRoles.includes(role)) {
        return res.status(400).json({
          message: "Invalid role.",
        });
      }

      const [existing] = await db.query(
        `
        SELECT user_id
        FROM users
        WHERE email = ?
        `,
        [email],
      );

      if (existing.length > 0) {
        return res.status(400).json({
          message: "Email already exists.",
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const [result] = await db.query(
        `
        INSERT INTO users
        (
          full_name,
          email,
          password_hash,
          role
        )
        VALUES (?, ?, ?, ?)
        `,
        [full_name, email, passwordHash, role],
      );

      await logAudit(
        req.user.user_id,
        "CREATE",
        "USERS",
        `Created user "${full_name}".`,
      );

      res.status(201).json({
        message: "User created successfully.",
        user_id: result.insertId,
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: "Failed to create user.",
      });
    }
  },
);

// ============================================
// UPDATE USER
// ============================================
router.put(
  "/:id",
  verifyToken,
  authorize("admin"),

  async (req, res) => {
    try {
      const { id } = req.params;

      let { full_name, email, role } = req.body;

      full_name = full_name?.trim();
      email = email?.trim().toLowerCase();

      if (!full_name || !email || !role) {
        return res.status(400).json({
          message: "All fields are required.",
        });
      }

      const validRoles = ["admin", "veterinarian", "staff", "pet_owner"];

      if (!validRoles.includes(role)) {
        return res.status(400).json({
          message: "Invalid role.",
        });
      }

      const [existingUser] = await db.query(
        `
        SELECT user_id
        FROM users
        WHERE user_id = ?
        `,
        [id],
      );

      if (existingUser.length === 0) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      const [duplicate] = await db.query(
        `
        SELECT user_id
        FROM users
        WHERE email = ?
        AND user_id <> ?
        `,
        [email, id],
      );

      if (duplicate.length > 0) {
        return res.status(400).json({
          message: "Email already exists.",
        });
      }

      await db.query(
        `
        UPDATE users
        SET
          full_name = ?,
          email = ?,
          role = ?
        WHERE user_id = ?
        `,
        [full_name, email, role, id],
      );

      await logAudit(
        req.user.user_id,
        "UPDATE",
        "USERS",
        `Updated user ID ${id}.`,
      );

      res.json({
        message: "User updated successfully.",
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: "Failed to update user.",
      });
    }
  },
);

// ============================================
// DELETE USER
// ============================================
router.delete(
  "/:id",
  verifyToken,
  authorize("admin"),

  async (req, res) => {
    try {
      const { id } = req.params;

      if (Number(id) === req.user.user_id) {
        return res.status(400).json({
          message: "You cannot delete your own account.",
        });
      }

      const [existing] = await db.query(
        `
        SELECT user_id
        FROM users
        WHERE user_id = ?
        `,
        [id],
      );

      if (existing.length === 0) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      await db.query(
        `
        DELETE FROM users
        WHERE user_id = ?
        `,
        [id],
      );

      await logAudit(
        req.user.user_id,
        "DELETE",
        "USERS",
        `Deleted user ID ${id}.`,
      );

      res.json({
        message: "User deleted successfully.",
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: "Failed to delete user.",
      });
    }
  },
);

module.exports = router;
