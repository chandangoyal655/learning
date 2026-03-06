// ══════════════════════════════════════════════
//  ParkIQ — Express Server
//  Run:  node server.js
//  Dev:  npx nodemon server.js
// ══════════════════════════════════════════════
const connectDB = require("./config/db");
const express = require("express");
const cors = require("cors");
const path = require("path");

const slotsRouter = require("./routes/slots");
const bookingsRouter = require("./routes/bookings");

const app = express();
connectDB();
const PORT = process.env.PORT || 3000;

// ── Middleware ──
app.use(cors()); // Amonllow frontend requests
app.use(express.json()); // Parse JSON bodies
app.use(express.static("public")); // Serve the HTML frontend

// ── API Routes ──
app.use("/api/slots", slotsRouter);
app.use("/api/bookings", bookingsRouter);

// ── Health Check ──
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "ParkIQ", time: new Date().toISOString() });
});

// ── Catch-all: serve frontend for any non-API route ──
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ── Global error handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// ── Start ──
app.listen(PORT, () => {
  console.log(`\n  🅿️  ParkIQ Server running at http://localhost:${PORT}`);
  console.log(`  📡  API base: http://localhost:${PORT}/api`);
  console.log(`\n  Routes:`);
  console.log(`    GET  /api/health`);
  console.log(`    GET  /api/slots`);
  console.log(`    GET  /api/slots/stats`);
  console.log(`    GET  /api/slots/random/:zone`);
  console.log(`    GET  /api/slots/:id`);
  console.log(`    POST /api/bookings`);
  console.log(`    GET  /api/bookings`);
  console.log(`    GET  /api/bookings/:id`);
  console.log(`    DELETE /api/bookings/:id\n`);
});

module.exports = app;
