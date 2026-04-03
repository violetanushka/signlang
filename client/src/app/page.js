"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import {
  HiOutlineAcademicCap,
  HiOutlineHandRaised,
  HiOutlineTrophy,
  HiOutlineShieldCheck,
  HiOutlineLanguage,
  HiOutlineSparkles,
  HiOutlinePlay,
  HiOutlineArrowRight,
  HiOutlineStar,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import { IoGameControllerOutline } from "react-icons/io5";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const features = [
  {
    icon: HiOutlineHandRaised,
    title: "AI Gesture Recognition",
    desc: "Real-time webcam detection at 30 FPS with instant accuracy feedback.",
    color: "#2563EB",
  },
  {
    icon: HiOutlineAcademicCap,
    title: "Structured Courses",
    desc: "From alphabets to fluent conversations — Beginner, Intermediate, Pro.",
    color: "#8B5CF6",
  },
  {
    icon: IoGameControllerOutline,
    title: "Gamified Learning",
    desc: "Earn points, badges, and stars. Mini games keep learning fun.",
    color: "#10B981",
  },
  {
    icon: HiOutlineLanguage,
    title: "Text-to-Sign Translator",
    desc: "Type any sentence and see it broken down into sign gestures.",
    color: "#F59E0B",
  },
  {
    icon: HiOutlineShieldCheck,
    title: "Certified Learning",
    desc: "Earn verifiable certificates with unique IDs and QR codes.",
    color: "#EF4444",
  },
  {
    icon: HiOutlineSparkles,
    title: "Fully Accessible",
    desc: "Built for everyone — voice assist, high contrast, keyboard navigation.",
    color: "#06B6D4",
  },
];

const stats = [
  { value: "26+", label: "ASL Letters" },
  { value: "30", label: "FPS Detection" },
  { value: "100%", label: "Accessible" },
  { value: "Free", label: "To Start" },
];

const testimonials = [
  {
    name: "Sarah M.",
    role: "Parent",
    text: "My 6-year-old daughter loves learning sign language with Signa! The animations and games keep her engaged for hours.",
    rating: 5,
  },
  {
    name: "Dr. James K.",
    role: "Educator",
    text: "The AI feedback system is remarkably accurate. I recommend Signa to all my students studying ASL.",
    rating: 5,
  },
  {
    name: "Priya R.",
    role: "Student",
    text: "As someone who is hard of hearing, I appreciate how accessible this platform is. It's truly designed for everyone.",
    rating: 5,
  },
];

const levels = [
  {
    level: "Beginner",
    desc: "Alphabets, Numbers, Basic Greetings",
    price: "Free",
    color: "#10B981",
    features: ["26 ASL Letters", "Numbers 0-9", "Basic Greetings", "AI Practice Mode"],
  },
  {
    level: "Intermediate",
    desc: "Common Phrases & Conversations",
    price: "$29",
    color: "#2563EB",
    popular: true,
    features: ["100+ Common Phrases", "Conversation Practice", "Speed Challenges", "Certificate"],
  },
  {
    level: "Pro",
    desc: "Fluent Communication Mastery",
    price: "$49",
    color: "#8B5CF6",
    features: ["Advanced Expressions", "Context Signs", "Real-time Translation", "Premium Badge"],
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
        {/* Animated Orbs */}
        <div className="orb orb-blue" style={{ top: "10%", left: "5%" }} />
        <div className="orb orb-purple" style={{ top: "60%", right: "10%" }} />
        <div className="orb orb-green" style={{ bottom: "10%", left: "40%" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — Text */}
            <motion.div
              initial="hidden"
              animate="visible"
              className="text-center lg:text-left"
            >
              <motion.div variants={fadeUp} custom={0} className="mb-6">
                <span className="badge badge-primary text-xs">
                  ✨ AI-Powered Learning
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6"
                style={{ color: "var(--text-primary)" }}
              >
                Learn Sign Language{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
                  }}
                >
                  with AI
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-lg sm:text-xl max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                Real-time gesture recognition, interactive lessons, and gamified
                learning — all designed to be accessible for everyone.
              </motion.p>

              <motion.div
                variants={fadeUp}
                custom={3}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link href="/register" className="btn btn-primary btn-lg">
                  <HiOutlinePlay className="w-5 h-5" />
                  Start Learning Free
                </Link>
                <Link href="/courses" className="btn btn-secondary btn-lg">
                  Browse Courses
                  <HiOutlineArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={fadeUp}
                custom={4}
                className="grid grid-cols-4 gap-4 mt-12 max-w-lg mx-auto lg:mx-0"
              >
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div
                      className="text-2xl font-bold"
                      style={{ color: "var(--primary)" }}
                    >
                      {stat.value}
                    </div>
                    <div
                      className="text-xs mt-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — Hero Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:flex justify-center"
            >
              <div className="relative">
                {/* Glowing background circle */}
                <div
                  className="absolute inset-0 rounded-full blur-3xl opacity-30"
                  style={{ background: "var(--primary)" }}
                />
                {/* Main illustration card */}
                <div className="relative glass-card p-8 max-w-md">
                  <div className="space-y-6">
                    {/* Hand SVG */}
                    <div className="flex justify-center">
                      <svg
                        width="180"
                        height="180"
                        viewBox="0 0 200 200"
                        className="drop-shadow-lg"
                      >
                        <defs>
                          <linearGradient id="handGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#2563EB" />
                            <stop offset="100%" stopColor="#8B5CF6" />
                          </linearGradient>
                        </defs>
                        <circle cx="100" cy="100" r="90" fill="url(#handGrad)" opacity="0.1" />
                        {/* Simplified hand icon */}
                        <g transform="translate(50, 35)" fill="url(#handGrad)">
                          <path d="M45 10c0-5.5 4.5-10 10-10s10 4.5 10 10v55h-20V10z" opacity="0.9"/>
                          <path d="M20 25c0-5.5 4.5-10 10-10s10 4.5 10 10v50H20V25z" opacity="0.8"/>
                          <path d="M70 25c0-5.5 4.5-10 10-10s10 4.5 10 10v50H70V25z" opacity="0.8"/>
                          <path d="M0 45c0-5.5 4.5-10 10-10s10 4.5 10 10v40H0V45z" opacity="0.7"/>
                          <rect x="0" y="75" width="90" height="55" rx="20" opacity="0.9"/>
                        </g>
                      </svg>
                    </div>

                    {/* Fake detection UI */}
                    <div className="glass-sm p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          Detected: Letter A
                        </span>
                        <span className="badge badge-success">98%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: "98%" }} />
                      </div>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        ✅ Perfect form! Try the next letter.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-24 relative" style={{ background: "var(--bg-secondary)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.span
              variants={fadeUp}
              custom={0}
              className="badge badge-accent mb-4 inline-block"
            >
              Features
            </motion.span>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Everything you need to master{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
                }}
              >
                sign language
              </span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg max-w-2xl mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              Powered by AI, designed for accessibility, and built to make learning
              sign language a delightful experience.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                custom={i}
                className="glass-card p-7 group cursor-default"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                  style={{
                    background: `${feature.color}15`,
                    color: feature.color,
                  }}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-24 relative bg-gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} custom={0} className="badge badge-primary mb-4 inline-block">
              How It Works
            </motion.span>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-3xl sm:text-4xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Learn in 4 simple steps
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { step: "01", title: "Watch", desc: "See animated demonstrations of each sign gesture.", icon: "🎬" },
              { step: "02", title: "Practice", desc: "Turn on your webcam and practice the gesture.", icon: "📸" },
              { step: "03", title: "Get Feedback", desc: "AI analyzes your gesture and gives instant feedback.", icon: "🤖" },
              { step: "04", title: "Level Up", desc: "Pass assessments, earn badges, and unlock new content.", icon: "🏆" },
            ].map((item, i) => (
              <motion.div key={item.step} variants={fadeUp} custom={i} className="text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <div
                  className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: "var(--primary)" }}
                >
                  Step {item.step}
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {item.title}
                </h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="py-24 relative" style={{ background: "var(--bg-secondary)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} custom={0} className="badge badge-warning mb-4 inline-block">
              Pricing
            </motion.span>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Choose your learning path
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg max-w-xl mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              Start free, upgrade when you&apos;re ready. Score 90%+ to unlock discounts!
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {levels.map((plan, i) => (
              <motion.div
                key={plan.level}
                variants={fadeUp}
                custom={i}
                className={`glass-card p-8 relative ${
                  plan.popular ? "ring-2 ring-[var(--primary)] scale-105" : ""
                }`}
              >
                {plan.popular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--primary), var(--accent))",
                    }}
                  >
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3
                    className="text-sm font-bold uppercase tracking-wider mb-2"
                    style={{ color: plan.color }}
                  >
                    {plan.level}
                  </h3>
                  <div
                    className="text-4xl font-extrabold mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {plan.price}
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {plan.desc}
                  </p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <HiOutlineCheckCircle
                        className="w-5 h-5 flex-shrink-0"
                        style={{ color: plan.color }}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`btn w-full ${
                    plan.popular ? "btn-primary" : "btn-secondary"
                  }`}
                >
                  {plan.price === "Free" ? "Start Free" : "Get Started"}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-24 relative bg-gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} custom={0} className="badge badge-success mb-4 inline-block">
              Testimonials
            </motion.span>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-3xl sm:text-4xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Loved by learners worldwide
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                custom={i}
                className="glass-card p-7"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <HiOutlineStar
                      key={j}
                      className="w-5 h-5"
                      style={{ color: "#F59E0B", fill: "#F59E0B" }}
                    />
                  ))}
                </div>
                <p
                  className="text-sm leading-relaxed mb-5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
                    }}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {t.name}
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {t.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
          }}
        />
        <div className="orb" style={{ background: "white", opacity: 0.1, width: 300, height: 300, top: "-10%", right: "-5%" }} />
        <div className="orb" style={{ background: "white", opacity: 0.08, width: 200, height: 200, bottom: "-5%", left: "10%" }} />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative z-10 max-w-3xl mx-auto px-4 text-center"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Start your sign language journey today
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="text-lg text-white/80 mb-8 max-w-xl mx-auto"
          >
            Join thousands of learners. Free to start, powered by AI,
            designed for everyone.
          </motion.p>
          <motion.div variants={fadeUp} custom={2} className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/register"
              className="btn btn-lg"
              style={{
                background: "white",
                color: "var(--primary)",
                fontWeight: 700,
              }}
            >
              <HiOutlinePlay className="w-5 h-5" />
              Get Started — It&apos;s Free
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </>
  );
}
