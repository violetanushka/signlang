const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      required: true,
    },
    // Content
    content: {
      type: { type: String, enum: ["letter", "number", "word", "phrase"], default: "letter" },
      value: { type: String, required: true }, // e.g., "A", "Hello"
      instructions: { type: String, default: "" },
      audioUrl: { type: String, default: "" },
      subtitles: { type: String, default: "" },
    },
    // SVG animation data for the gesture
    gestureData: {
      // Key landmark positions for this gesture (normalized 0-1 coords)
      landmarks: [[Number]],
      // SVG path data for animated hand
      svgFrames: [String],
      // Description for screen readers
      altText: { type: String, default: "" },
    },
    // Reference images
    referenceImages: [
      {
        url: String,
        caption: String,
      },
    ],
    // Assessment config
    assessmentConfig: {
      requiredAccuracy: { type: Number, default: 70 }, // minimum % to pass
      timeLimit: { type: Number, default: 30 }, // seconds
      attempts: { type: Number, default: 3 },
    },
    // Points earned for completing
    pointsReward: {
      type: Number,
      default: 10,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound index for ordering
lessonSchema.index({ courseId: 1, order: 1 });

module.exports = mongoose.model("Lesson", lessonSchema);
