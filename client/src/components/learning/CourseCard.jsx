"use client";

import Link from "next/link";
import { HiOutlineAcademicCap, HiOutlineClock } from "react-icons/hi2";

export default function CourseCard({ course }) {
  const levelColors = {
    beginner: "#10B981",
    intermediate: "#2563EB",
    pro: "#8B5CF6",
  };

  const levelColor = levelColors[course.level] || course.color;

  return (
    <Link
      href={`/courses/${course._id}`}
      className="glass-card flex flex-col group h-full overflow-hidden transition-all duration-300 hover:scale-[1.02]"
    >
      {/* Top Banner */}
      <div
        className="h-24 w-full relative"
        style={{
          background: `linear-gradient(135deg, ${levelColor}22 0%, ${levelColor}11 100%)`,
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <HiOutlineAcademicCap
            className="w-16 h-16"
            style={{ color: levelColor }}
          />
        </div>
        <div
          className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md"
          style={{
            background: `${levelColor}22`,
            color: levelColor,
            border: `1px solid ${levelColor}44`,
          }}
        >
          {course.level}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <h3
          className="text-lg font-bold mb-2 group-hover:underline decoration-2 underline-offset-4"
          style={{ color: "var(--text-primary)", decorationColor: levelColor }}
        >
          {course.title}
        </h3>

        <p
          className="text-sm line-clamp-2 mb-4 flex-1"
          style={{ color: "var(--text-secondary)" }}
        >
          {course.description}
        </p>

        {/* Footer Meta */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              <HiOutlineAcademicCap className="w-4 h-4" />
              {course.totalLessons} Lessons
            </div>
            <div
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              <HiOutlineClock className="w-4 h-4" />
              {course.estimatedHours}h
            </div>
          </div>
          <div
            className="text-sm font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {course.price === 0 ? "Free" : `₹${course.price}`}
          </div>
        </div>
      </div>
    </Link>
  );
}
