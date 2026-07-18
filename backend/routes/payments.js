// Payment Routes — Developed by KB Trinidad

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

// POST /api/payments — Record a payment
router.post('/', verifyToken, async (req, res) => {
  const { pet_id, cashier_id, or_number, amount, purpose } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO payments (pet_id, cashier_id, or_number, amount, purpose, payment_status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [pet_id, cashier_id, or_number, amount, purpose]
    );
    res.status(201).json({
      message: 'Payment recorded.',
      payment_id: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/payments — Get all payments
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, pt.name AS pet_name, u.full_name AS cashier_name
       FROM payments p
       JOIN pets pt ON p.pet_id = pt.pet_id
       JOIN users u ON p.cashier_id = u.user_id
       ORDER BY p.paid_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/payments/:pet_id — Get payments for a specific pet
router.get('/:pet_id', verifyToken, async (req, res) => {
  const { pet_id } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT * FROM payments WHERE pet_id = ? ORDER BY paid_at DESC',
      [pet_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/payments/:id — Update payment status
router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { payment_status } = req.body;

  try {
    await db.query(
      'UPDATE payments SET payment_status = ? WHERE payment_id = ?',
      [payment_status, id]
    );
    res.json({ message: 'Payment status updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;