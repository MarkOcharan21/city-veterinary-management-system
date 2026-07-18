// Analytics routes for dashboard metrics and charts - Developed by Mark Lawrence Ocharan

const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/auth");

// GET /api/analytics/summary
router.get("/summary", verifyToken, async (req, res) => {
  try {
    const [[{ total_pets }]] = await db.query(
      "SELECT COUNT(*) as total_pets FROM pets",
    );
    const [[{ total_owners }]] = await db.query(
      "SELECT COUNT(*) as total_owners FROM owners",
    );
    const [[{ total_vaccinations }]] = await db.query(
      "SELECT COUNT(*) as total_vaccinations FROM vaccinations",
    );
    const [[{ total_payments }]] = await db.query(
      "SELECT COUNT(*) as total_payments FROM payments",
    );
    const [[{ total_revenue }]] = await db.query(
      "SELECT COALESCE(SUM(amount),0) as total_revenue FROM payments WHERE payment_status='verified'",
    );
    const [[{ active_users }]] = await db.query(
      "SELECT COUNT(*) as active_users FROM users",
    );
    const [[{ unpaid }]] = await db.query(
      "SELECT COUNT(*) as unpaid FROM payments WHERE payment_status='pending'",
    );
    const [[{ pending_registrations }]] = await db.query(
      "SELECT COUNT(*) as pending_registrations FROM draft_registrations WHERE sync_status='pending'",
    );
    const [[{ overdue_vaccinations }]] = await db.query(
      "SELECT COUNT(*) as overdue_vaccinations FROM vaccinations WHERE next_due_date < CURDATE()",
    );
    const [[{ vaccinated_pets }]] = await db.query(
      "SELECT COUNT(DISTINCT pet_id) as vaccinated_pets FROM vaccinations",
    );

    res.json({
      total_pets,
      total_owners,
      total_vaccinations,
      total_payments,
      total_revenue,
      active_users,
      unpaid,
      pending_registrations,
      overdue_vaccinations,
      vaccinated_pets,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

// GET /api/analytics/pets-by-species
router.get("/pets-by-species", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT species, COUNT(*) as count FROM pets GROUP BY species",
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// GET /api/analytics/pets-by-barangay
router.get("/pets-by-barangay", verifyToken, async (req, res) => {
    try {

        const [rows] = await db.query(`
            SELECT
                b.barangay_name,
                COUNT(p.pet_id) AS count
            FROM pets p
            JOIN owners o
                ON p.owner_id = o.owner_id
            LEFT JOIN barangays b
                ON o.barangay_id = b.barangay_id
            GROUP BY b.barangay_name
            ORDER BY count DESC
        `);

        res.json(rows);

    } catch(err){

        console.error(err);

        res.status(500).json({
            message:"Server error."
        });

    }
});

// GET /api/analytics/monthly-vaccinations
router.get("/monthly-vaccinations", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DATE_FORMAT(date_given, '%b %Y') as month, COUNT(*) as count
       FROM vaccinations GROUP BY DATE_FORMAT(date_given, '%Y-%m')
       ORDER BY MIN(date_given) ASC LIMIT 12`,
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// GET /api/analytics/monthly-registrations
router.get("/monthly-registrations", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DATE_FORMAT(registered_at, '%b %Y') as month, COUNT(*) as count
       FROM pets GROUP BY DATE_FORMAT(registered_at, '%Y-%m')
       ORDER BY MIN(registered_at) ASC LIMIT 12`,
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// GET /api/analytics/payment-status
router.get("/payment-status", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT payment_status, COUNT(*) as count FROM payments GROUP BY payment_status",
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// GET /api/analytics/vaccination-status
router.get("/vaccination-status", verifyToken, async (req, res) => {
  try {
    const [[{ vaccinated }]] = await db.query(
      "SELECT COUNT(DISTINCT pet_id) as vaccinated FROM vaccinations",
    );
    const [[{ total }]] = await db.query("SELECT COUNT(*) as total FROM pets");
    const [[{ overdue }]] = await db.query(
      "SELECT COUNT(*) as overdue FROM vaccinations WHERE next_due_date < CURDATE()",
    );
    res.json([
      { status: "Vaccinated", count: vaccinated },
      { status: "Unvaccinated", count: Math.max(0, total - vaccinated) },
      { status: "Overdue", count: overdue },
    ]);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ============================================
// GET RECENT PETS
// ============================================

router.get(
  "/recent-pets",
  verifyToken,

  async (req, res) => {
    try {
      const [rows] = await db.query(`
                SELECT
                    pet_id,
                    name,
                    species,
                    registered_at
                FROM pets
                ORDER BY registered_at DESC
                LIMIT 5
            `);

      res.json(rows);
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: "Server error.",
      });
    }
  },
);

router.get(
  "/recent-vaccinations",
  verifyToken,

  async (req, res) => {
    try {
      const [rows] = await db.query(`
                SELECT
                    p.name AS pet_name,
                    v.vaccine_name,
                    v.date_given
                FROM vaccinations v
                JOIN pets p
                    ON p.pet_id = v.pet_id
                ORDER BY v.date_given DESC
                LIMIT 5
            `);

      res.json(rows);
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: "Server error.",
      });
    }
  },
);

router.get(
  "/recent-payments",
  verifyToken,
  async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT
          amount,
          payment_status,
          paid_at
        FROM payments
        ORDER BY paid_at DESC
        LIMIT 5
      `);

      res.json(rows);

    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: "Server error.",
      });
    }
  }
);

router.get(
  "/recent-activities",
  verifyToken,

  async (req, res) => {
    try {
      const [rows] = await db.query(`
                SELECT
                    action,
                    module_name,
                    description,
                    created_at
                FROM audit_logs
                ORDER BY created_at DESC
                LIMIT 5
            `);

      res.json(rows);
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: "Server error.",
      });
    }
  },
);

module.exports = router;
