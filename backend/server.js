// Main Express Server
// City Veterinary Management System

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const errorHandler = require("./middleware/errorHandler");

const app = express();

/* ==========================
   MIDDLEWARE
========================== */

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

/* ==========================
   TEST ROUTE
========================== */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "City Veterinary Management System API is running.",
  });
});

/* ==========================
   API ROUTES
========================== */

app.use("/api/auth", require("./routes/auth"));

app.use("/api/pets", require("./routes/pets"));

app.use("/api/owners", require("./routes/owners"));

app.use("/api/vaccinations", require("./routes/vaccinations"));

app.use("/api/payments", require("./routes/payments"));

app.use("/api/records", require("./routes/records"));

app.use("/api/analytics", require("./routes/analytics"));

app.use("/api/barangays", require("./routes/barangays"));

app.use("/api/users", require("./routes/users"));

app.use("/api/reports", require("./routes/reports"));

app.use("/api/audit", require("./routes/audit"));

app.use("/api/drafts", require("./routes/drafts"));

/* ==========================
   404
========================== */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found.",
  });
});

/* ==========================
   ERROR HANDLER
========================== */

app.use(errorHandler);

/* ==========================
   SERVER
========================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("");
  console.log("======================================");
  console.log(" CityVet Server Running");
  console.log(` API : http://localhost:${PORT}`);
  console.log(` Client : ${process.env.CLIENT_URL || "http://localhost:5173"}`);
  console.log("======================================");
});
