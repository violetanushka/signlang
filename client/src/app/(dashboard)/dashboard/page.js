"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import {
  HiOutlineAcademicCap,
  HiOutlineStar,
  HiOutlineBolt,
  HiOutlinePlay,
  HiOutlineArrowRight,
} from "react-icons/hi2";
import { IoGridOutline } from "react-icons/io5";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDashboard = async () => {
      try {
        const [achievementsRes, summaryRes] = await Promise.all([
          api.get("/progress/achievements"),
          api.get("/progress/summary")
        ]);

        setStats(achievementsRes.data);
        setSummaries(summaryRes.data.summary || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Navbar />

      <main className="flex-1 mt-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header Greeting */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ color: "var(--text-primary)" }}>
            Welcome back, {user.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
            Ready to continue your sign language journey?
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content Area: Resumes & Activity */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Stats Banner */}
            <motion.div 
              initial="hidden" animate="visible" variants={fadeUp} custom={0}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              <div className="glass-card p-5 text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-[rgba(37,99,235,0.1)] flex items-center justify-center mb-3">
                  <HiOutlineAcademicCap className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div className="text-2xl font-bold text-[var(--text-primary)]">{stats?.totalCompleted || 0}</div>
                <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Lessons</div>
              </div>
              
              <div className="glass-card p-5 text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-[rgba(245,158,11,0.1)] flex items-center justify-center mb-3">
                  <span className="text-[var(--warning)] text-xl">🔥</span>
                </div>
                <div className="text-2xl font-bold text-[var(--text-primary)]">{stats?.streak || 0}</div>
                <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Day Streak</div>
              </div>
              
              <div className="glass-card p-5 text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-[rgba(139,92,246,0.1)] flex items-center justify-center mb-3">
                  <HiOutlineBolt className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <div className="text-2xl font-bold text-[var(--text-primary)]">{stats?.points || 0}</div>
                <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Points</div>
              </div>

              <div className="glass-card p-5 text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-[rgba(16,185,129,0.1)] flex items-center justify-center mb-3">
                  <HiOutlineStar className="w-5 h-5 text-[var(--success)]" />
                </div>
                <div className="text-2xl font-bold text-[var(--text-primary)]">{stats?.avgScore || 0}%</div>
                <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Avg Score</div>
              </div>
            </motion.div>

            {/* Continue Learning */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <HiOutlinePlay className="w-5 h-5 text-[var(--primary)]" />
                  Continue Learning
                </h2>
                <Link href="/courses" className="text-sm font-semibold text-[var(--primary)] hover:underline">
                  View all courses
                </Link>
              </div>

              <div className="space-y-4">
                {summaries.length === 0 ? (
                  <div className="glass-card p-8 text-center border-dashed border-2 flex flex-col items-center">
                    <IoGridOutline className="w-12 h-12 text-[var(--text-muted)] mb-3" />
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">No course activity yet</h3>
                    <p className="text-[var(--text-secondary)] text-sm mb-4">Start your first lesson to see your progress here.</p>
                    <Link href="/courses" className="btn btn-primary">Browse Courses</Link>
                  </div>
                ) : summaries.map((summary) => (
                  <div key={summary.course._id} className="glass-card p-5 flex flex-col sm:flex-row items-center gap-6 group hover:shadow-lg transition-transform hover:scale-[1.01]">
                    
                    <div className="w-full sm:w-1/3 flex-shrink-0">
                      <div className="h-28 rounded-xl flex items-center justify-center relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${summary.course.color}22, ${summary.course.color}44)` }}>
                        <IoGridOutline className="w-12 h-12 opacity-30" style={{ color: summary.course.color }} />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/50 backdrop-blur-sm" style={{ color: summary.course.color }}>
                          {summary.course.level}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 w-full text-center sm:text-left">
                      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">{summary.course.title}</h3>
                      
                      <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mt-2 mb-4">
                        <span>{summary.completedCount} / {summary.course.totalLessons} Lessons</span>
                        <span>•</span>
                        <span className={summary.avgScore >= 50 ? "text-[var(--success)]" : "text-[var(--warning)]"}>
                          Avg score: {summary.avgScore}%
                        </span>
                      </div>

                      <div className="progress-bar w-full h-1.5 mb-4">
                        <div className="progress-bar-fill" style={{ width: `${summary.percentComplete}%`, background: summary.course.color }}></div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <Link href={`/courses/${summary.course._id}`} className="btn btn-primary sm:w-auto w-full">
                          Resume Course <HiOutlineArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </div>
                    </div>
                    
                  </div>
                ))}
              </div>
            </motion.div>

          </div>

          {/* Right Sidebar: Gamification / Achievements */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Badges Widget */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="glass-card p-6">
              <h3 className="font-bold text-lg mb-4 text-[var(--text-primary)]">Your Badges</h3>
              
              {stats?.badges && stats.badges.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {stats.badges.map((badge) => (
                    <div key={badge.id} className="text-center p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)]">
                      <div className="text-3xl mb-2 drop-shadow-sm">{badge.icon}</div>
                      <div className="text-xs font-bold text-[var(--text-primary)] line-clamp-1">{badge.name}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--glass-border)] border-dashed">
                  <div className="text-3xl mb-2 opacity-50 text-grayscale">🏆</div>
                  <p className="text-sm text-[var(--text-muted)] font-medium">No badges yet. Complete your first lesson!</p>
                  <Link href="/courses" className="mt-3 btn btn-sm btn-primary">Start Learning</Link>
                </div>
              )}
            </motion.div>

            {/* Daily Streak Info */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="glass-card p-6 border-l-4 border-[var(--warning)]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[rgba(245,158,11,0.1)] flex items-center justify-center text-2xl">🔥</div>
                <div>
                  <h3 className="font-bold text-lg text-[var(--text-primary)]">{stats?.streak || 0} Day Streak</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Practice tomorrow to keep it alive!</p>
                </div>
              </div>
              
              {/* Fake week calendar */}
              <div className="flex justify-between items-center mt-6">
                {["M","T","W","T","F","S","S"].map((day, idx) => {
                  const isActive = idx < (stats?.streak || 0);
                  const isToday = idx === Math.max((stats?.streak || 1) - 1, 0);
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2">
                      <span className="text-[10px] font-bold text-[var(--text-muted)]">{day}</span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        isActive 
                          ? isToday 
                            ? "bg-[var(--warning)] text-white shadow-lg shadow-orange-500/30 font-extrabold ring-4 ring-orange-500/20" 
                            : "bg-[rgba(245,158,11,0.2)] text-[var(--warning)]" 
                          : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                      }`}>
                        {isActive ? "✓" : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}
