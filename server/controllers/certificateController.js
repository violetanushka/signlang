const Certificate = require("../models/Certificate");
const Course = require("../models/Course");
const Progress = require("../models/Progress");
const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");

// @desc    Generate certificate for completed course
// @route   POST /api/certificates/generate
exports.generateCertificate = async (req, res, next) => {
  try {
    const { courseId } = req.body;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    // Check if already certified
    const existing = await Certificate.findOne({
      userId: req.user._id,
      courseId,
    });
    if (existing) {
      return res.json({ certificate: existing });
    }

    // Check if all lessons are completed
    const allProgress = await Progress.find({
      userId: req.user._id,
      courseId,
    });

    const completedCount = allProgress.filter((p) => p.completed).length;
    if (completedCount < course.totalLessons) {
      return res.status(400).json({
        message: `Complete all ${course.totalLessons} lessons to earn your certificate. You've completed ${completedCount}.`,
      });
    }

    // Calculate average score
    const avgScore = Math.round(
      allProgress.reduce((s, p) => s + p.bestScore, 0) / allProgress.length
    );

    // Generate unique ID and QR code
    const uniqueId = `SIGNA-${uuidv4().slice(0, 8).toUpperCase()}`;
    const verifyUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/certificates/verify/${uniqueId}`;
    const qrCodeData = await QRCode.toDataURL(verifyUrl);

    const certificate = await Certificate.create({
      userId: req.user._id,
      courseId,
      uniqueId,
      userName: req.user.name,
      courseName: course.title,
      courseLevel: course.level,
      score: avgScore,
      qrCodeData,
    });

    res.status(201).json({ certificate });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's certificates
// @route   GET /api/certificates
exports.getMyCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({
      userId: req.user._id,
    }).sort({ issuedAt: -1 });

    res.json({ certificates });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify certificate by unique ID (public)
// @route   GET /api/certificates/verify/:uniqueId
exports.verifyCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findOne({
      uniqueId: req.params.uniqueId,
    });

    if (!certificate) {
      return res.status(404).json({ valid: false, message: "Certificate not found." });
    }

    res.json({
      valid: certificate.isValid,
      certificate: {
        uniqueId: certificate.uniqueId,
        userName: certificate.userName,
        courseName: certificate.courseName,
        courseLevel: certificate.courseLevel,
        score: certificate.score,
        issuedAt: certificate.issuedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
