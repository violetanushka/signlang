/**
 * assessmentRoutes.js
 * Proxies prediction requests from the Next.js client to the FastAPI AI service.
 * This keeps port 8000 (AI service) server-side only.
 */
const express = require("express");
const router  = express.Router();
const http    = require("http");
const https   = require("https");
const { auth } = require("../middleware/auth");

const AI_BASE = (process.env.AI_SERVICE_URL || "http://localhost:8000").replace(/\/$/, "");

/**
 * Forward a JSON body to the AI service and stream the response back.
 * Uses Node's built-in http/https so we avoid adding an axios/node-fetch dep.
 */
function proxyToAI(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const url     = new URL(AI_BASE + path);
    const lib     = url.protocol === "https:" ? https : http;

    const options = {
      hostname: url.hostname,
      port:     url.port || (url.protocol === "https:" ? 443 : 80),
      path:     url.pathname + url.search,
      method:   "POST",
      headers: {
        "Content-Type":   "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = lib.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ statusCode: res.statusCode, body: { raw: data } });
        }
      });
    });

    req.on("error", reject);
    req.setTimeout(8000, () => {
      req.destroy(new Error("AI service request timed out"));
    });
    req.write(payload);
    req.end();
  });
}

/**
 * POST /api/assessment/predict
 * Body: { landmarks: [...21 points], sessionId: string }
 * Response: { predicted_class, confidence, top3, method }
 */
router.post("/predict", auth, async (req, res, next) => {
  try {
    const { landmarks, sessionId } = req.body;

    if (!landmarks || !Array.isArray(landmarks)) {
      return res.status(400).json({ message: "landmarks array is required." });
    }

    console.log(`[API] Received landmarks length: ${landmarks.length}`);

    const result = await proxyToAI("/predict/ensemble", { landmarks });

    if (result.statusCode >= 500) {
      return res.status(502).json({ message: "AI service error.", detail: result.body });
    }

    // Pass the AI response straight through to the client
    return res.status(result.statusCode).json(result.body);
  } catch (err) {
    // AI service unreachable — return heuristic fallback signal
    if (err.code === "ECONNREFUSED" || err.message.includes("timed out")) {
      return res.status(503).json({
        predicted_class: "nothing",
        confidence: 0,
        top3: [],
        method: "unavailable",
        message: "AI service is not running.",
        models_info: {
          cnn: { status: "offline", conf: 0 },
          knn: { status: "offline", conf: 0 },
          heuristic: { status: "offline", conf: 0 }
        }
      });
    }
    next(err);
  }
});

/**
 * GET /api/assessment/health
 * Checks connectivity to the AI service — handy for the dashboard.
 */
router.get("/health", async (req, res) => {
  try {
    const url = new URL(AI_BASE + "/health");
    const lib = url.protocol === "https:" ? https : http;
    const result = await new Promise((resolve, reject) => {
      const req = lib.get(url.toString(), (r) => {
        let d = "";
        r.on("data", c => (d += c));
        r.on("end", () => resolve({ ok: r.statusCode === 200, status: r.statusCode }));
      });
      req.on("error", reject);
      req.setTimeout(3000, () => req.destroy(new Error("timeout")));
    });
    return res.json({ ai_service: result.ok ? "online" : "degraded", ...result });
  } catch {
    return res.json({ ai_service: "offline" });
  }
});

module.exports = router;
