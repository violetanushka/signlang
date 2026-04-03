"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import LessonSidebar from "@/components/learning/LessonSidebar";
import LessonPlayer from "@/components/learning/LessonPlayer";

export default function LessonWrapperPage() {
  const { courseId, lessonId } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [userProgress, setUserProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Basic protection: requires login
    if (user === null) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    const fetchLessonData = async () => {
      try {
        setLoading(true);
        // Fire parallel requests
        const [courseRes, progRes, lessonRes] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get(`/progress/${courseId}`),
          api.get(`/courses/${courseId}/lessons/${lessonId}`)
        ]);

        setCourse(courseRes.data.course);
        setLessons(courseRes.data.lessons);
        setUserProgress(progRes.data.progress);
        setCurrentLesson(lessonRes.data.lesson);
      } catch (err) {
        console.error(err);
        router.push("/courses");
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [courseId, lessonId, user, router]);

  if (loading || user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course || !currentLesson) return null;

  // Find next lesson ID for the "Next" button
  const currentIndex = lessons.findIndex((l) => l._id === currentLesson._id);
  const nextLessonId = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1]._id : null;

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[var(--bg-primary)]">
      {/* Sidebar hidden on small screens; added a trigger for mobile later */}
      <div className="hidden lg:block">
        <LessonSidebar
          course={course}
          lessons={lessons}
          currentLessonId={currentLesson._id}
          userProgress={userProgress}
          isAdmin={user?.role === "admin"}
        />
      </div>

      {/* Main Content Area */}
      <LessonPlayer
        course={course}
        lesson={currentLesson}
        nextLessonId={nextLessonId}
      />
    </div>
  );
}
