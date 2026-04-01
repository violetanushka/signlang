const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// ─── Connect Database ─────────────────────────
const autoSeed = require("./seeds/autoSeed");

connectDB()
  .then(() => {
    // Run auto-seed
    return autoSeed();
  })
  .catch(err => {
    console.error("❌ Fatal Database Connection Error on Startup");
  });

// ─── Middleware ────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", process.env.CLIENT_URL].filter(Boolean),
  credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting ────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { message: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

// ─── Routes ───────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/progress", require("./routes/progressRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/certificates", require("./routes/certificateRoutes"));

// ─── Health Check ─────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Error Handler ────────────────────────────
app.use(require("./middleware/errorHandler"));

// ─── Start Server ─────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Signa API Server running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}\n`);
});

module.exports = app;
