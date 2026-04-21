"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineAcademicCap,
  HiOutlineUser,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";
import {
  IoGameControllerOutline,
  IoLanguageOutline,
  IoGridOutline,
} from "react-icons/io5";
import { APP_NAME } from "@/lib/constants";
import Logo from "@/components/ui/Logo";

const navLinks = [
  { href: "/courses", label: "Courses", icon: HiOutlineAcademicCap },
  { href: "/translator", label: "Translator", icon: IoLanguageOutline },
  { href: "/games", label: "Games", icon: IoGameControllerOutline },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
      style={{
        background: scrolled ? "var(--glass-bg)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled
          ? "1px solid var(--glass-border)"
          : "1px solid transparent",
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Logo />

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-[rgba(37,99,235,0.08)]"
              style={{ color: "var(--text-secondary)" }}
            >
              <link.icon className="w-4.5 h-4.5" />
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-[rgba(37,99,235,0.08)]"
                style={{ color: "var(--text-secondary)" }}
              >
                <IoGridOutline className="w-4.5 h-4.5" />
                Dashboard
              </Link>
              <div className="w-px h-6" style={{ background: "var(--glass-border)" }}></div>
              <Link
                href="/profile"
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
                }}
                aria-label="Profile"
              >
                {user.name?.charAt(0).toUpperCase() || "U"}
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">
                Log In
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ color: "var(--text-primary)" }}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <HiOutlineXMark className="w-6 h-6" />
          ) : (
            <HiOutlineBars3 className="w-6 h-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1 glass-sm mx-4 mt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
              <div
                className="h-px my-2"
                style={{ background: "var(--glass-border)" }}
              ></div>
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <IoGridOutline className="w-5 h-5" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full text-left text-red-500"
                  >
                    <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
                    Log Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="btn btn-secondary btn-sm flex-1"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
