const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    // Score 0–100
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    // Best score across attempts
    bestScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    // Detailed feedback from last attempt
    feedback: {
      accuracy: { type: Number, default: 0 },
      timing: { type: String, default: "" },
      suggestions: [String],
    },
    // Stars earned (1-5)
    stars: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true }
);

// One progress record per user per lesson
progressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
progressSchema.index({ userId: 1, courseId: 1 });

module.exports = mongoose.model("Progress", progressSchema);
