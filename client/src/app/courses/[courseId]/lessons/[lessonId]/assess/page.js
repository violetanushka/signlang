"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import PracticeMode from "@/components/webcam/PracticeMode";
import { HiOutlineArrowLeft, HiOutlineTrophy } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";

export default function AssessmentPage() {
  const { courseId, lessonId } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  // Result state
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user === null) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [courseRes, lessonRes] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get(`/courses/${courseId}/lessons/${lessonId}`)
        ]);

        setCourse(courseRes.data.course);
        setLesson(lessonRes.data.lesson);
      } catch (err) {
        console.error(err);
        router.push(`/courses/${courseId}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, lessonId, user, router]);

  const handlePracticeComplete = async (score, feedback) => {
    try {
      setSubmitting(true);
      
      const payload = {
        courseId,
        lessonId,
        score,
        feedback: {
          accuracy: score,
          timing: "Good",
          suggestions: feedback.suggestions || []
        }
      };

      const res = await api.post("/progress/submit", payload);
      setResult(res.data);
    } catch (err) {
      console.error("Failed to submit progress", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course || !lesson) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Navbar />

      <main className="flex-1 mt-20 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={`/courses/${course._id}/lessons/${lesson._id}`}
            className="inline-flex items-center gap-2 text-sm font-medium hover:underline text-[var(--text-secondary)]"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Back to Lesson
          </Link>
          <div className="badge badge-primary">AI Practice Assessment</div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Camera Area */}
          <div className="lg:col-span-2 glass-card p-6 h-[600px] flex flex-col">
            <h1 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">
              Practice: {lesson.title}
            </h1>
            
            {result ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-24 h-24 rounded-full bg-[rgba(16,185,129,0.15)] flex items-center justify-center text-[var(--success)] shadow-xl mb-6 border border-[var(--success)]">
                  <HiOutlineTrophy className="w-12 h-12" />
                </div>
                
                <h2 className="text-3xl font-extrabold mb-2 text-[var(--text-primary)]">
                  Assessment Passed!
                </h2>
                
                <p className="text-lg mb-8 text-[var(--text-secondary)]">
                  {result.message}
                </p>

                {/* Score Breakdown inside Result */}
                <div className="w-full max-w-md space-y-4 mb-8">
                  <div className="flex justify-between items-center p-4 glass-sm rounded-xl">
                    <span className="font-semibold text-[var(--text-secondary)]">Final Score</span>
                    <span className="text-2xl font-bold text-[var(--success)]">{result.progress.score}%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 glass-sm rounded-xl">
                    <span className="font-semibold text-[var(--text-secondary)]">Points Earned</span>
                    <span className="text-xl font-bold text-[var(--warning)]">+{result.progress.pointsEarned || 0}</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => window.location.reload()} className="btn btn-secondary">
                    Practice Again
                  </button>
                  <Link href={`/courses/${courseId}`} className="btn btn-primary">
                    Return to Course
                  </Link>
                </div>
              </motion.div>
            ) : submitting ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="font-medium text-[var(--text-muted)]">Saving your progress...</p>
              </div>
            ) : (
              <div className="flex-1">
                <PracticeMode 
                  targetGesture={lesson.content?.value || "A"} 
                  onComplete={handlePracticeComplete} 
                />
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-6 border-t-4 border-[var(--accent)]">
              <h3 className="font-bold text-lg mb-2 text-[var(--text-primary)]">Checklist</h3>
              <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-[rgba(37,99,235,0.1)] flex items-center justify-center flex-shrink-0 mt-0.5 text-[var(--primary)] font-bold text-xs">1</div>
                  Ensure your entire hand is visible to the camera.
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-[rgba(37,99,235,0.1)] flex items-center justify-center flex-shrink-0 mt-0.5 text-[var(--primary)] font-bold text-xs">2</div>
                  Good lighting helps the AI recognize the gesture clearly.
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-[rgba(37,99,235,0.1)] flex items-center justify-center flex-shrink-0 mt-0.5 text-[var(--primary)] font-bold text-xs">3</div>
                  Hold the pose steady for a moment until the bar hits 100%.
                </li>
              </ul>
            </div>

            {/* Display new badges if any */}
            <AnimatePresence>
              {result?.progress?.newBadges?.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-6 bg-[rgba(245,158,11,0.05)] border-[rgba(245,158,11,0.2)] text-center relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-2 text-2xl animate-bounce">🎉</div>
                  <h3 className="font-bold text-[var(--warning)] mb-4 uppercase tracking-wider text-xs">
                    New Achievement Unlocked!
                  </h3>
                  {result.progress.newBadges.map(badge => (
                    <div key={badge.id} className="mb-2">
                      <div className="text-4xl mb-2">{badge.icon}</div>
                      <div className="font-bold text-sm text-[var(--text-primary)]">{badge.name}</div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>
    </div>
  );
}
