const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');


// PET MASTERLIST
router.get('/pets', verifyToken, async (req, res) => {

  try {

    const [rows] = await db.query(`
      SELECT
        p.*,
        o.full_name AS owner_name
      FROM pets p
      JOIN owners o ON p.owner_id = o.owner_id
      ORDER BY p.created_at DESC
    `);

    res.json(rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error.'
    });
  }
});


// PAYMENT REPORT
router.get('/payments', verifyToken, async (req, res) => {

  try {

    const [rows] = await db.query(`
      SELECT *
      FROM payments
      ORDER BY payment_date DESC
    `);

    res.json(rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error.'
    });
  }
});


// VACCINATION REPORT
router.get('/vaccinations', verifyToken, async (req, res) => {

  try {

    const [rows] = await db.query(`
      SELECT
        v.*,
        p.name AS pet_name
      FROM vaccinations v
      JOIN pets p ON v.pet_id = p.pet_id
      ORDER BY v.date_given DESC
    `);

    res.json(rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error.'
    });
  }
});

module.exports = router;