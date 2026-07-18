// ============================================
// Authentication Routes
// Handles User Registration and Login
// ============================================

const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

require("dotenv").config();

const VALID_ROLES = ["admin", "veterinarian", "staff", "pet_owner"];

const JWT_EXPIRES_IN = "8h";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============================================
// REGISTER USER
// POST /api/auth/register
// ============================================

router.post("/register", async (req, res) => {
  try {
    let { full_name, email, password, role } = req.body;

    //-----------------------------------
    // Required fields
    //-----------------------------------

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    //-----------------------------------
    // Sanitize
    //-----------------------------------

    full_name = full_name.trim();
    email = email.trim().toLowerCase();
    password = password.trim();

    //-----------------------------------
    // Email validation
    //-----------------------------------

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        message: "Invalid email address.",
      });
    }

    //-----------------------------------
    // Password validation
    //-----------------------------------

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    //-----------------------------------
    // Role validation
    //-----------------------------------

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({
        message: "Invalid user role.",
      });
    }

    //-----------------------------------
    // Existing email
    //-----------------------------------

    const [existing] = await db.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Email already registered.",
      });
    }

    //-----------------------------------
    // Hash password
    //-----------------------------------

    const passwordHash = await bcrypt.hash(password, 10);

    //-----------------------------------
    // Insert user
    //-----------------------------------

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

    res.status(201).json({
      message: "User registered successfully.",
      user_id: result.insertId,
    });
  } catch (err) {
    console.error("REGISTER ERROR:");
    console.error(err);

    res.status(500).json({
      message: "Internal server error.",
    });
  }
});

// ============================================
// LOGIN USER
// POST /api/auth/login
// ============================================

router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    //-----------------------------------
    // Required fields
    //-----------------------------------

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    email = email.trim().toLowerCase();
    password = password.trim();

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        message: "Invalid email address.",
      });
    }

    //-----------------------------------
    // Find user
    //-----------------------------------

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const user = rows[0];

    //-----------------------------------
    // Check if account is active
    //-----------------------------------

    if (!user.is_active) {
      return res.status(403).json({
        message: "Your account has been deactivated.",
      });
    }

    //-----------------------------------
    // Verify password
    //-----------------------------------

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    //-----------------------------------
    // Generate JWT
    //-----------------------------------

    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      },
    );

    //-----------------------------------
    // Update Last Login
    //-----------------------------------

    await db.query(
      `
  UPDATE users
  SET last_login = NOW()
  WHERE user_id = ?
  `,
      [user.user_id],
    );

    //-----------------------------------
    // Success response
    //-----------------------------------

    return res.status(200).json({
      message: "Login successful.",

      token,

      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:");
    console.error(err);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
});

module.exports = router;
