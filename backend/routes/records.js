const express = require('express');
const router = express.Router();

const db = require('../config/db');

const verifyToken = require('../middleware/auth');
const logAudit = require('../utils/logAudit');


// ============================================
// CREATE CLINICAL RECORD
// ============================================
router.post('/clinical', verifyToken, async (req, res) => {

    try {

        const {
            pet_id,
            vet_id,
            visit_date,
            diagnosis,
            treatment,
            notes
        } = req.body;

        if (
            !pet_id ||
            !vet_id ||
            !visit_date
        ) {
            return res.status(400).json({
                message: 'Pet, veterinarian and visit date are required.'
            });
        }

        const [pet] = await db.query(
            'SELECT pet_id FROM pets WHERE pet_id = ?',
            [pet_id]
        );

        if (pet.length === 0) {
            return res.status(404).json({
                message: 'Pet not found.'
            });
        }

        const [result] = await db.query(
            `
            INSERT INTO clinical_records
            (
                pet_id,
                vet_id,
                visit_date,
                diagnosis,
                treatment,
                notes
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                pet_id,
                vet_id,
                visit_date,
                diagnosis,
                treatment,
                notes
            ]
        );

        await logAudit(
            req.user.user_id,
            'CREATE',
            'CLINICAL RECORD',
            `Added clinical record for pet ID ${pet_id}.`
        );

        res.status(201).json({
            message: 'Clinical record added successfully.',
            clinical_id: result.insertId
        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({
            message: 'Failed to create clinical record.'
        });

    }

});


// ============================================
// GET CLINICAL HISTORY
// ============================================
router.get('/clinical/:pet_id', verifyToken, async (req, res) => {

    try {

        const { pet_id } = req.params;

        const [rows] = await db.query(
            `
            SELECT
                c.*,
                u.full_name AS vet_name
            FROM clinical_records c
            JOIN users u
                ON c.vet_id = u.user_id
            WHERE c.pet_id = ?
            ORDER BY c.visit_date DESC
            `,
            [pet_id]
        );

        res.json(rows);

    }

    catch (err) {

        console.error(err);

        res.status(500).json({
            message: 'Failed to fetch clinical records.'
        });

    }

});


// ============================================
// ADD MEDICINE
// ============================================
router.post('/medicine', verifyToken, async (req, res) => {

    try {

        const {
            clinical_id,
            medicine_name,
            dosage,
            frequency,
            prescribed_date
        } = req.body;

        if (
            !clinical_id ||
            !medicine_name
        ) {

            return res.status(400).json({
                message: 'Clinical record and medicine name are required.'
            });

        }

        const [clinical] = await db.query(
            'SELECT clinical_id FROM clinical_records WHERE clinical_id = ?',
            [clinical_id]
        );

        if (clinical.length === 0) {

            return res.status(404).json({
                message: 'Clinical record not found.'
            });

        }

        const [result] = await db.query(
            `
            INSERT INTO medicine_records
            (
                clinical_id,
                medicine_name,
                dosage,
                frequency,
                prescribed_date
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                clinical_id,
                medicine_name,
                dosage,
                frequency,
                prescribed_date
            ]
        );

        await logAudit(
            req.user.user_id,
            'CREATE',
            'MEDICINE RECORD',
            `Added medicine "${medicine_name}" to clinical record ${clinical_id}.`
        );

        res.status(201).json({
            message: 'Medicine added successfully.',
            medicine_id: result.insertId
        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({
            message: 'Failed to add medicine.'
        });

    }

});


// ============================================
// GET MEDICINES
// ============================================
router.get('/medicine/:clinical_id', verifyToken, async (req, res) => {

    try {

        const { clinical_id } = req.params;

        const [rows] = await db.query(
            `
            SELECT *
            FROM medicine_records
            WHERE clinical_id = ?
            ORDER BY prescribed_date DESC
            `,
            [clinical_id]
        );

        res.json(rows);

    }

    catch (err) {

        console.error(err);

        res.status(500).json({
            message: 'Failed to fetch medicine records.'
        });

    }

});

module.exports = router;