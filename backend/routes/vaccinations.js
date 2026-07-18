const express = require('express');
const router = express.Router();

const db = require('../config/db');

const verifyToken = require('../middleware/auth');

const authorize = require('../middleware/authorize');

const logAudit = require('../utils/logAudit');


// ============================================
// CREATE VACCINATION
// ============================================
router.post(
    '/',
    verifyToken,

    async (req, res) => {

        try {

            const {
                pet_id,
                veterinarian_id,
                vaccine_name,
                date_given,
                next_due_date,
                remarks
            } = req.body;

            if (
                !pet_id ||
                !veterinarian_id ||
                !vaccine_name ||
                !date_given
            ) {

                return res.status(400).json({
                    message: 'Required fields are missing.'
                });

            }

            const [pet] = await db.query(
                `
                SELECT pet_id
                FROM pets
                WHERE pet_id = ?
                `,
                [pet_id]
            );

            if (pet.length === 0) {

                return res.status(404).json({
                    message: 'Pet not found.'
                });

            }

            const [veterinarian] = await db.query(
                `
                SELECT user_id
                FROM users
                WHERE user_id = ?
                AND role = 'veterinarian'
                `,
                [veterinarian_id]
            );

            if (veterinarian.length === 0) {

                return res.status(404).json({
                    message: 'Veterinarian not found.'
                });

            }

            const [result] = await db.query(
                `
                INSERT INTO vaccinations
                (
                    pet_id,
                    veterinarian_id,
                    vaccine_name,
                    date_given,
                    next_due_date,
                    remarks
                )
                VALUES (?, ?, ?, ?, ?, ?)
                `,
                [
                    pet_id,
                    veterinarian_id,
                    vaccine_name,
                    date_given,
                    next_due_date,
                    remarks
                ]
            );

            await logAudit(
                req.user.user_id,
                'CREATE',
                'VACCINATIONS',
                `Recorded vaccination for pet ID ${pet_id}.`
            );

            res.status(201).json({
                message: 'Vaccination recorded successfully.',
                vaccination_id: result.insertId
            });

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                message: 'Failed to record vaccination.'
            });

        }

    }
);

// ============================================
// GET ALL VACCINATIONS
// ============================================
router.get(
  "/",
  verifyToken,

  async (req, res) => {
    try {

      const [rows] = await db.query(`
        SELECT
          v.*,
          p.name AS pet_name,
          u.full_name AS veterinarian_name
        FROM vaccinations v
        INNER JOIN pets p
          ON v.pet_id = p.pet_id
        INNER JOIN users u
          ON v.veterinarian_id = u.user_id
        ORDER BY v.date_given DESC
      `);

      res.json(rows);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message: "Failed to fetch vaccinations."
      });

    }
  }
);

// ============================================
// GET VACCINATION HISTORY
// ============================================
router.get(
    '/:pet_id',
    verifyToken,

    async (req, res) => {

        try {

            const { pet_id } = req.params;

            const [rows] = await db.query(
                `
                SELECT
                    v.*,
                    u.full_name AS veterinarian_name
                FROM vaccinations v
                INNER JOIN users u
                    ON v.veterinarian_id = u.user_id
                WHERE v.pet_id = ?
                ORDER BY v.date_given DESC
                `,
                [pet_id]
            );

            res.json(rows);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                message: 'Failed to fetch vaccination history.'
            });

        }

    }
);


// ============================================
// UPDATE VACCINATION
// ============================================
router.put(
    '/:id',
    verifyToken,

    async (req, res) => {

        try {

            const { id } = req.params;

            const {
                pet_id,
                veterinarian_id,
                vaccine_name,
                date_given,
                next_due_date,
                remarks
            } = req.body;

            const [existing] = await db.query(
                `
                SELECT vaccination_id
                FROM vaccinations
                WHERE vaccination_id = ?
                `,
                [id]
            );

            if (existing.length === 0) {

                return res.status(404).json({
                    message: 'Vaccination record not found.'
                });

            }

            await db.query(
                `
                UPDATE vaccinations
                SET
                    pet_id = ?,
                    veterinarian_id = ?,
                    vaccine_name = ?,
                    date_given = ?,
                    next_due_date = ?,
                    remarks = ?
                WHERE vaccination_id = ?
                `,
                [
                    pet_id,
                    veterinarian_id,
                    vaccine_name,
                    date_given,
                    next_due_date,
                    remarks,
                    id
                ]
            );

            await logAudit(
                req.user.user_id,
                'UPDATE',
                'VACCINATIONS',
                `Updated vaccination ID ${id}.`
            );

            res.json({
                message: 'Vaccination updated successfully.'
            });

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                message: 'Failed to update vaccination.'
            });

        }

    }
);


// ============================================
// DELETE VACCINATION
// ============================================
router.delete(
    '/:id',
    verifyToken,
    authorize('admin'),

    async (req, res) => {

        try {

            const { id } = req.params;

            const [existing] = await db.query(
                `
                SELECT vaccination_id
                FROM vaccinations
                WHERE vaccination_id = ?
                `,
                [id]
            );

            if (existing.length === 0) {

                return res.status(404).json({
                    message: 'Vaccination record not found.'
                });

            }

            await db.query(
                `
                DELETE FROM vaccinations
                WHERE vaccination_id = ?
                `,
                [id]
            );

            await logAudit(
                req.user.user_id,
                'DELETE',
                'VACCINATIONS',
                `Deleted vaccination ID ${id}.`
            );

            res.json({
                message: 'Vaccination deleted successfully.'
            });

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                message: 'Failed to delete vaccination.'
            });

        }

    }
);

module.exports = router;