const router = require("express").Router();
const {
  generateCertificate,
  getMyCertificates,
  verifyCertificate,
} = require("../controllers/certificateController");
const { auth } = require("../middleware/auth");

// Public
router.get("/verify/:uniqueId", verifyCertificate);

// Protected
router.get("/", auth, getMyCertificates);
router.post("/generate", auth, generateCertificate);

module.exports = router;
