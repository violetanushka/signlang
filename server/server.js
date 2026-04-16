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
  .then(async () => {
    // Run auto-seed
    if (process.env.NODE_ENV !== 'production') {
      await autoSeed();
      console.log('Dev seed complete.');
    }
  })
  .catch(err => {
    console.error("❌ Fatal Database Connection Error on Startup");
  });

// AI service warmup — prevents cold-start timeouts
const http = require('http');
setTimeout(() => {
  http.get(process.env.AI_SERVICE_URL ? process.env.AI_SERVICE_URL + '/warmup' : 'http://localhost:8000/warmup', (res) => {
    console.log('AI service warmup status:', res.statusCode);
  }).on('error', () => {
    console.warn('AI service not reachable yet — start uvicorn if running locally.');
  });
}, 3000);

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
// Standard API limiter
const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased from 100
  message: { message: "Too many requests, please try again later." },
});

// High-frequency limiter for real-time assessment
const assessmentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 1000, // Allow 1000 requests per 15 mins for gestures
  message: { message: "Gesture prediction limit reached. Please slow down." },
});

app.use("/api/", standardLimiter);
app.use("/api/assessment/predict", assessmentLimiter);

// ─── Routes ───────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/progress", require("./routes/progressRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/certificates", require("./routes/certificateRoutes"));
app.use("/api/assessment", require("./routes/assessmentRoutes"));

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
