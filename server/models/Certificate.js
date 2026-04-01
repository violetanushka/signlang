const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
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
    uniqueId: {
      type: String,
      required: true,
      unique: true,
    },
    userName: {
      type: String,
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    courseLevel: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    qrCodeData: {
      type: String,
      default: "",
    },
    pdfUrl: {
      type: String,
      default: "",
    },
    isValid: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

certificateSchema.index({ userId: 1, courseId: 1 });

module.exports = mongoose.model("Certificate", certificateSchema);
