const express = require("express");
const router = express.Router();

const db = require("../config/db");

const verifyToken = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const logAudit = require("../utils/logAudit");

// ============================================
// CREATE OWNER
// ============================================
router.post(
  "/",
  verifyToken,

  async (req, res) => {
    try {
      let {
        user_id,
        barangay_id,
        address,
        contact_number,
        id_type,
        id_number,
      } = req.body;

      address = address?.trim();
      barangay_id = parseInt(barangay_id);
      contact_number = contact_number?.trim();
      id_type = id_type?.trim();
      id_number = id_number?.trim();

      if (!user_id || !address || !barangay_id || !contact_number) {
        return res.status(400).json({
          message: "Required fields are missing.",
        });
      }

      // Check if barangay exists
      const [barangay] = await db.query(
        `
SELECT barangay_id
FROM barangays
WHERE barangay_id = ?
`,
        [barangay_id],
      );

      if (barangay.length === 0) {
        return res.status(404).json({
          message: "Barangay not found.",
        });
      }

      // Check if user exists
      const [user] = await db.query(
        `
                SELECT user_id
                FROM users
                WHERE user_id = ?
                `,
        [user_id],
      );

      if (user.length === 0) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      // Prevent duplicate owner profile
      const [existingOwner] = await db.query(
        `
                SELECT owner_id
                FROM owners
                WHERE user_id = ?
                `,
        [user_id],
      );

      if (existingOwner.length > 0) {
        return res.status(400).json({
          message: "Owner profile already exists.",
        });
      }

      const [result] = await db.query(
        `
                INSERT INTO owners
                (
                    user_id,
                    barangay_id,
                    address,                    
                    contact_number,
                    id_type,
                    id_number
                )
                VALUES (?, ?, ?, ?, ?, ?)
                `,
        [user_id, barangay_id, address, contact_number, id_type, id_number],
      );

      await logAudit(
        req.user.user_id,
        "CREATE",
        "OWNERS",
        `Created owner profile for user ID ${user_id}.`,
      );

      res.status(201).json({
        message: "Owner profile created successfully.",
        owner_id: result.insertId,
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: "Failed to create owner profile.",
      });
    }
  },
);

// ============================================
// GET ALL OWNERS
// ============================================
router.get(
  "/",
  verifyToken,

  async (req, res) => {
    try {
      const { search = "" } = req.query;

      let sql = `
                SELECT
    o.owner_id,
    u.full_name,
    u.email,
    b.barangay_name,
    o.address,
    o.contact_number,
    o.id_type,
    o.id_number,
    o.created_at
FROM owners o
INNER JOIN users u
    ON o.user_id = u.user_id
LEFT JOIN barangays b
    ON o.barangay_id = b.barangay_id
            `;

      const params = [];

      if (search.trim() !== "") {
        sql += `
                    WHERE
                        u.full_name LIKE ?
                        OR u.email LIKE ?
                        OR b.barangay_name LIKE ?
                        OR o.contact_number LIKE ?
                `;

        const keyword = `%${search}%`;

        params.push(keyword, keyword, keyword, keyword);
      }

      sql += `
                ORDER BY u.full_name ASC
            `;

      const [owners] = await db.query(sql, params);

      res.json(owners);
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: "Failed to fetch owners.",
      });
    }
  },
);

// ============================================
// GET OWNER BY ID
// ============================================
router.get(
  "/:id",
  verifyToken,

  async (req, res) => {
    try {
      const { id } = req.params;

      const [owner] = await db.query(
        `
                SELECT
    o.owner_id,
    u.full_name,
    u.email,
    b.barangay_name,
    b.barangay_id,
    o.address,
    o.contact_number,
    o.id_type,
    o.id_number,
    o.created_at
FROM owners o
INNER JOIN users u
    ON o.user_id = u.user_id
LEFT JOIN barangays b
    ON o.barangay_id = b.barangay_id
WHERE o.owner_id = ?
                `,
        [id],
      );

      if (owner.length === 0) {
        return res.status(404).json({
          message: "Owner not found.",
        });
      }

      res.json(owner[0]);
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: "Failed to fetch owner.",
      });
    }
  },
);

// ============================================
// UPDATE OWNER
// ============================================
router.put(
  "/:id",
  verifyToken,

  async (req, res) => {
    try {
      const { id } = req.params;

      const { barangay_id, address, contact_number, id_type, id_number } =
        req.body;

      const [existing] = await db.query(
        `
                SELECT owner_id
                FROM owners
                WHERE owner_id = ?
                `,
        [id],
      );

      if (existing.length === 0) {
        return res.status(404).json({
          message: "Owner not found.",
        });
      }

      await db.query(
        `
                UPDATE owners
                SET
                    barangay_id = ?,
                    address = ?,
                    contact_number = ?,
                    id_type = ?,
                    id_number = ?
                WHERE owner_id = ?
                `,
        [barangay_id, address, contact_number, id_type, id_number, id],
      );

      await logAudit(
        req.user.user_id,
        "UPDATE",
        "OWNERS",
        `Updated owner ID ${id}.`,
      );

      res.json({
        message: "Owner updated successfully.",
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: "Failed to update owner.",
      });
    }
  },
);

// ============================================
// DELETE OWNER
// ============================================
router.delete(
  "/:id",
  verifyToken,
  authorize("admin"),

  async (req, res) => {
    try {
      const { id } = req.params;

      const [barangay] = await db.query(
        `
SELECT barangay_id
FROM barangays
WHERE barangay_id = ?
`,
        [barangay_id],
      );

      if (barangay.length === 0) {
        return res.status(404).json({
          message: "Barangay not found.",
        });
      }

      const [existing] = await db.query(
        `
                SELECT owner_id
                FROM owners
                WHERE owner_id = ?
                `,
        [id],
      );

      if (existing.length === 0) {
        return res.status(404).json({
          message: "Owner not found.",
        });
      }

      await db.query(
        `
                DELETE FROM owners
                WHERE owner_id = ?
                `,
        [id],
      );

      await logAudit(
        req.user.user_id,
        "DELETE",
        "OWNERS",
        `Deleted owner ID ${id}.`,
      );

      res.json({
        message: "Owner deleted successfully.",
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: "Failed to delete owner.",
      });
    }
  },
);

module.exports = router;
