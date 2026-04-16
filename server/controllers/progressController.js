const Progress = require("../models/Progress");
const User = require("../models/User");
const Lesson = require("../models/Lesson");

const DEFAULT_THRESHOLD = parseFloat(process.env.DEFAULT_PASS_THRESHOLD || '0.60');

function getThreshold(lesson) {
  if (lesson && typeof lesson.passingThreshold === 'number') return lesson.passingThreshold;
  return DEFAULT_THRESHOLD;
}
// @desc    Get user's progress for a course
// @route   GET /api/progress/:courseId
exports.getCourseProgress = async (req, res, next) => {
  try {
    const progress = await Progress.find({
      userId: req.user._id,
      courseId: req.params.courseId,
    }).sort({ createdAt: 1 });

    const totalLessons = await Lesson.countDocuments({
      courseId: req.params.courseId,
      isPublished: true,
    });

    const completedLessons = progress.filter((p) => p.completed).length;
    const overallScore =
      progress.length > 0
        ? Math.round(progress.reduce((sum, p) => sum + p.bestScore, 0) / progress.length)
        : 0;

    res.json({
      progress,
      summary: {
        totalLessons,
        completedLessons,
        overallScore,
        percentComplete: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit assessment result
// @route   POST /api/progress/submit
exports.submitResult = async (req, res, next) => {
  try {
    const { courseId, lessonId, score, feedback } = req.body;

    if (score === undefined || !lessonId || !courseId) {
      console.log("❌ Progress Submit Validation Failed!");
      console.log("Expected: { courseId, lessonId, score }");
      console.log("Received Body:", req.body);
      
      return res.status(400).json({ 
        message: "courseId, lessonId, and score are required.",
        received: { courseId, lessonId, score }
      });
    }

    // Get lesson to check required accuracy
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found." });
    }

    // Check threshold to pass.
    const passed = (score / 100) >= getThreshold(lesson);
    const stars = score >= 95 ? 5 : score >= 85 ? 4 : score >= 75 ? 3 : score >= 65 ? 2 : (score / 100) >= getThreshold(lesson) ? 1 : 0;

    // Upsert progress
    let progress = await Progress.findOne({
      userId: req.user._id,
      lessonId,
    });

    if (progress) {
      progress.score = score;
      progress.bestScore = Math.max(progress.bestScore, score);
      progress.attempts += 1;
      progress.stars = Math.max(progress.stars, stars);
      if (passed && !progress.completed) {
        progress.completed = true;
        progress.completedAt = new Date();
      }
      if (feedback) progress.feedback = feedback;
      await progress.save();
    } else {
      progress = await Progress.create({
        userId: req.user._id,
        courseId,
        lessonId,
        score,
        bestScore: score,
        attempts: 1,
        completed: passed,
        completedAt: passed ? new Date() : null,
        stars,
        feedback: feedback || {},
      });
    }

    // Award points
    if (passed) {
      const user = await User.findById(req.user._id);
      user.points += lesson.pointsReward;

      // Check for badges
      const badges = [];
      if (user.badges.length === 0) {
        badges.push({ id: "first-sign", name: "First Sign", icon: "🤟" });
      }

      const totalCompleted = await Progress.countDocuments({
        userId: req.user._id,
        completed: true,
      });

      if (totalCompleted >= 10 && !user.badges.find((b) => b.id === "dedicated-10")) {
        badges.push({ id: "dedicated-10", name: "Dedicated Learner", icon: "📚" });
      }
      if (totalCompleted >= 26 && !user.badges.find((b) => b.id === "alphabet-master")) {
        badges.push({ id: "alphabet-master", name: "Alphabet Master", icon: "🏆" });
      }
      if (score >= 95 && !user.badges.find((b) => b.id === "perfectionist")) {
        badges.push({ id: "perfectionist", name: "Perfectionist", icon: "⭐" });
      }
      if (user.streak >= 7 && !user.badges.find((b) => b.id === "week-streak")) {
        badges.push({ id: "week-streak", name: "Week Warrior", icon: "🔥" });
      }

      if (badges.length > 0) {
        user.badges.push(...badges);
      }
      await user.save();

      progress = progress.toObject();
      progress.newBadges = badges;
      progress.pointsEarned = lesson.pointsReward;
    }

    res.json({
      progress,
      passed,
      message: passed ? "Great job! You passed!" : "Keep practicing, you can do it!",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user achievements
// @route   GET /api/progress/achievements
exports.getAchievements = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const totalCompleted = await Progress.countDocuments({
      userId: req.user._id,
      completed: true,
    });

    const allProgress = await Progress.find({ userId: req.user._id });
    const avgScore =
      allProgress.length > 0
        ? Math.round(allProgress.reduce((s, p) => s + p.bestScore, 0) / allProgress.length)
        : 0;

    res.json({
      points: user.points,
      streak: user.streak,
      badges: user.badges,
      totalCompleted,
      avgScore,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get summary of all courses for dashboard
// @route   GET /api/progress/summary
exports.getProgressSummary = async (req, res, next) => {
  try {
    const progress = await Progress.find({ userId: req.user._id })
      .populate({
        path: "courseId",
        select: "title color level totalLessons",
      });

    // Group progress by course
    const courseProgress = progress.reduce((acc, curr) => {
      const courseId = curr.courseId._id.toString();
      if (!acc[courseId]) {
        acc[courseId] = {
          course: curr.courseId,
          completedCount: 0,
          totalScore: 0,
          lessons: [],
        };
      }
      
      acc[courseId].lessons.push({
        lessonId: curr.lessonId,
        score: curr.bestScore,
        completed: curr.completed,
      });

      if (curr.completed) {
        acc[courseId].completedCount += 1;
        acc[courseId].totalScore += curr.bestScore;
      }
      return acc;
    }, {});

    // Format output
    const summary = Object.values(courseProgress).map(cp => {
       const percentComplete = cp.course.totalLessons > 0 
          ? Math.round((cp.completedCount / cp.course.totalLessons) * 100)
          : 0;
       const avgScore = cp.completedCount > 0
          ? Math.round(cp.totalScore / cp.completedCount)
          : 0;
          
       return {
         course: cp.course,
         completedCount: cp.completedCount,
         percentComplete,
         avgScore,
         lessons: cp.lessons
       };
    });

    res.json({ summary });
  } catch (error) {
    next(error);
  }
};
