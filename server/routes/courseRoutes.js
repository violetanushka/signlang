const router = require("express").Router();
const {
  getCourses,
  getCourse,
  getCourseLessons,
  getLesson,
} = require("../controllers/courseController");

router.get("/", getCourses);
router.get("/:id", getCourse);
router.get("/:id/lessons", getCourseLessons);
router.get("/:courseId/lessons/:lessonId", getLesson);

module.exports = router;
