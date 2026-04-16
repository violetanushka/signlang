"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import CourseCard from "@/components/learning/CourseCard";
import api from "@/lib/api";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { motion } from "framer-motion";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'beginner', 'intermediate', 'pro'
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses");
        if (mounted) {
          setCourses(res.data.courses || []);
        }
      } catch (err) {
        console.warn("Courses load failed:", err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCourses();

    return () => {
      mounted = false;
    };
  }, []); // ✅ IMPORTANT: empty dependency

  const filteredCourses = courses.filter((c) => {
    const matchFilter = filter === "all" || c.level === filter;
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero relative">
      <Navbar />

      {/* Orbs */}
      <div className="orb orb-blue" style={{ top: "10%", right: "10%" }} />
      <div className="orb orb-green" style={{ bottom: "20%", left: "5%" }} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-28 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Explore Courses
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Start from scratch or advance your existing skills. Our AI-guided
            courses adapt to your pace.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-12 glass-sm p-3">
          {/* Level Tabs */}
          <div className="flex bg-[var(--bg-secondary)] rounded-lg p-1 w-full sm:w-auto overflow-x-auto">
            {["all", "beginner", "intermediate", "pro"].map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-semibold capitalize whitespace-nowrap transition-colors ${
                  filter === level
                    ? "bg-white shadow text-[var(--primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:max-w-xs">
            <HiOutlineMagnifyingGlass
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 h-10 py-0"
            />
          </div>
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[300px] skeleton" />
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredCourses.map((course, i) => (
              <motion.div key={course._id} custom={i} variants={fadeUp}>
                <CourseCard course={course} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20 glass-card">
            <p className="text-lg mb-2" style={{ color: "var(--text-primary)" }}>
              No courses found matching your criteria.
            </p>
            <button
              onClick={() => {
                setFilter("all");
                setSearch("");
              }}
              className="btn btn-secondary mt-4"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
