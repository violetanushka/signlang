const Course = require("../models/Course");
const Lesson = require("../models/Lesson");

// @desc    Get all courses
// @route   GET /api/courses
exports.getCourses = async (req, res, next) => {
  try {
    const { level } = req.query;
    const filter = { isPublished: true };
    if (level) filter.level = level;

    const courses = await Course.find(filter).sort({ order: 1 });
    res.json({ courses });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course with lessons
// @route   GET /api/courses/:id
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    const lessons = await Lesson.find({
      courseId: course._id,
      isPublished: true,
    }).sort({ order: 1 });

    res.json({ course, lessons });
  } catch (error) {
    next(error);
  }
};

// @desc    Get lessons for a course
// @route   GET /api/courses/:id/lessons
exports.getCourseLessons = async (req, res, next) => {
  try {
    const lessons = await Lesson.find({
      courseId: req.params.id,
      isPublished: true,
    }).sort({ order: 1 });

    res.json({ lessons });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single lesson
// @route   GET /api/courses/:courseId/lessons/:lessonId
exports.getLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findOne({
      _id: req.params.lessonId,
      courseId: req.params.courseId,
    });

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found." });
    }

    res.json({ lesson });
  } catch (error) {
    next(error);
  }
};
