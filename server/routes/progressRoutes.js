const router = require("express").Router();
const {
  getCourseProgress,
  submitResult,
  getAchievements,
  getProgressSummary,
} = require("../controllers/progressController");
const { auth } = require("../middleware/auth");

router.get("/achievements", auth, getAchievements);
router.get("/summary", auth, getProgressSummary);
router.get("/:courseId", auth, getCourseProgress);
router.post("/submit", auth, submitResult);

module.exports = router;
