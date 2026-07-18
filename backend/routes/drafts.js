const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');


// GET DRAFTS
router.get('/', verifyToken, async (req, res) => {

  try {

    const [rows] = await db.query(`
      SELECT *
      FROM draft_registrations
      ORDER BY created_at DESC
    `);

    res.json(rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error.'
    });
  }
});


// CREATE DRAFT
router.post('/', verifyToken, async (req, res) => {

  const {
    owner_name,
    pet_name,
    species
  } = req.body;

  try {

    await db.query(`
      INSERT INTO draft_registrations (
        owner_name,
        pet_name,
        species,
        sync_status
      )
      VALUES (?, ?, ?, 'pending')
    `, [
      owner_name,
      pet_name,
      species
    ]);

    res.status(201).json({
      message: 'Draft saved.'
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error.'
    });
  }
});

module.exports = router;