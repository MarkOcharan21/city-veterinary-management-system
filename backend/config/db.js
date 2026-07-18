const mysql = require("mysql2");
require("dotenv").config();

const requiredEnv = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME", "DB_PORT"];

requiredEnv.forEach((key) => {
  if (!(key in process.env)) {
    throw new Error(`Missing environment variable: ${key}`);
  }
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  multipleStatements: false,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed.");
    console.error(err.message);
    return;
  }

  console.log("✅ Connected to MySQL database.");

  connection.release();
});

module.exports = pool.promise();
