const express = require('express');
const router = express.Router();

const db = require('../config/db');

const verifyToken = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const logAudit = require('../utils/logAudit');

// ============================================
// CREATE PET
// ============================================
router.post(
    '/',
    verifyToken,

    async (req, res) => {

        try {

            let {
                owner_id,
                name,
                species,
                breed,
                color,
                birthdate,
                sex
            } = req.body;

            name = name?.trim();
            species = species?.trim();
            breed = breed?.trim();
            color = color?.trim();

            if (
                !owner_id ||
                !name ||
                !species ||
                !sex
            ) {

                return res.status(400).json({
                    message: 'Required fields are missing.'
                });

            }

            const [owner] = await db.query(
                `
                SELECT owner_id
                FROM owners
                WHERE owner_id = ?
                `,
                [owner_id]
            );

            if (owner.length === 0) {

                return res.status(404).json({
                    message: 'Owner not found.'
                });

            }

            const qr_code =
                `PET-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

            const [result] = await db.query(
                `
                INSERT INTO pets
                (
                    owner_id,
                    name,
                    species,
                    breed,
                    color,
                    birthdate,
                    sex,
                    qr_code
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    owner_id,
                    name,
                    species,
                    breed,
                    color,
                    birthdate,
                    sex,
                    qr_code
                ]
            );

            await logAudit(
                req.user.user_id,
                'CREATE',
                'PETS',
                `Registered pet "${name}".`
            );

            res.status(201).json({
                message: 'Pet registered successfully.',
                pet_id: result.insertId,
                qr_code
            });

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                message: 'Failed to register pet.'
            });

        }

    }
);

// ============================================
// GET ALL PETS
// ============================================
router.get(
    '/',
    verifyToken,

    async (req, res) => {

        try {

            const { search = '' } = req.query;

            let sql = `
                SELECT
                    p.*,
                    u.full_name AS owner_name,
                    b.barangay_name
                FROM pets p

                INNER JOIN owners o
                    ON p.owner_id = o.owner_id

                INNER JOIN users u
                    ON o.user_id = u.user_id

                LEFT JOIN barangays b
                    ON o.barangay_id = b.barangay_id
            `;

            const params = [];

            if (search.trim() !== '') {

                sql += `
                    WHERE
                        p.name LIKE ?
                        OR species LIKE ?
                        OR breed LIKE ?
                        OR u.full_name LIKE ?
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
                ORDER BY p.registered_at DESC
            `;

            const [pets] = await db.query(sql, params);

            res.json(pets);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                message: 'Failed to fetch pets.'
            });

        }

    }
);

// ============================================
// GET PET BY ID
// ============================================
router.get(
    '/:id',
    verifyToken,

    async (req, res) => {

        try {

            const { id } = req.params;

            const [pet] = await db.query(
                `
                SELECT
                    p.*,
                    u.full_name AS owner_name,
                    b.barangay_name
                FROM pets p

                INNER JOIN owners o
                    ON p.owner_id = o.owner_id

                INNER JOIN users u
                    ON o.user_id = u.user_id

                LEFT JOIN barangays b
                    ON o.barangay_id = b.barangay_id

                WHERE p.pet_id = ?
                `,
                [id]
            );

            if (pet.length === 0) {

                return res.status(404).json({
                    message: 'Pet not found.'
                });

            }

            res.json(pet[0]);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                message: 'Failed to fetch pet.'
            });

        }

    }
);

// ============================================
// GET OWNER PETS
// ============================================
router.get(
    '/owner/:owner_id',
    verifyToken,

    async (req, res) => {

        try {

            const { owner_id } = req.params;

            const [pets] = await db.query(
                `
                SELECT *
                FROM pets
                WHERE owner_id = ?
                ORDER BY registered_at DESC
                `,
                [owner_id]
            );

            res.json(pets);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                message: 'Failed to fetch owner pets.'
            });

        }

    }
);

// ============================================
// UPDATE PET
// ============================================
router.put(
    '/:id',
    verifyToken,

    async (req, res) => {

        try {

            const { id } = req.params;

            const {
                name,
                species,
                breed,
                color,
                birthdate,
                sex
            } = req.body;

            const [existing] = await db.query(
                `
                SELECT pet_id
                FROM pets
                WHERE pet_id = ?
                `,
                [id]
            );

            if (existing.length === 0) {

                return res.status(404).json({
                    message: 'Pet not found.'
                });

            }

            await db.query(
                `
                UPDATE pets
                SET
                    name = ?,
                    species = ?,
                    breed = ?,
                    color = ?,
                    birthdate = ?,
                    sex = ?
                WHERE pet_id = ?
                `,
                [
                    name,
                    species,
                    breed,
                    color,
                    birthdate,
                    sex,
                    id
                ]
            );

            await logAudit(
                req.user.user_id,
                'UPDATE',
                'PETS',
                `Updated pet ID ${id}.`
            );

            res.json({
                message: 'Pet updated successfully.'
            });

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                message: 'Failed to update pet.'
            });

        }

    }
);

// ============================================
// DELETE PET
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
                SELECT pet_id
                FROM pets
                WHERE pet_id = ?
                `,
                [id]
            );

            if (existing.length === 0) {

                return res.status(404).json({
                    message: 'Pet not found.'
                });

            }

            await db.query(
                `
                DELETE FROM pets
                WHERE pet_id = ?
                `,
                [id]
            );

            await logAudit(
                req.user.user_id,
                'DELETE',
                'PETS',
                `Deleted pet ID ${id}.`
            );

            res.json({
                message: 'Pet deleted successfully.'
            });

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                message: 'Failed to delete pet.'
            });

        }

    }
);

module.exports = router;