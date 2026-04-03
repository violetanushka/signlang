import Link from "next/link";
import {
  IoLogoGithub,
  IoLogoTwitter,
  IoLogoLinkedin,
  IoHeart,
} from "react-icons/io5";

const footerLinks = {
  Platform: [
    { label: "Courses", href: "/courses" },
    { label: "Translator", href: "/translator" },
    { label: "Games", href: "/games" },
    { label: "Pricing", href: "/pricing" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  Support: [
    { label: "Help Center", href: "/help" },
    { label: "Accessibility", href: "/accessibility" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};

export default function Footer() {
  return (
    <footer
      className="relative mt-auto"
      style={{ background: "var(--bg-dark)", color: "rgba(255,255,255,0.7)" }}
    >
      {/* Gradient top border */}
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--primary), var(--accent), transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
                }}
              >
                S
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Signa
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
              Learn sign language with AI-powered real-time gesture recognition.
              Accessible, gamified, and designed for everyone — from age 5 to 95.
            </p>
            <div className="flex gap-3">
              {[IoLogoGithub, IoLogoTwitter, IoLogoLinkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                  aria-label="Social link"
                >
                  <Icon className="w-4.5 h-4.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Groups */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            &copy; {new Date().getFullYear()} Signa. All rights reserved.
          </p>
          <p
            className="text-xs flex items-center gap-1"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Made with <IoHeart className="w-3.5 h-3.5 text-red-400" /> for accessibility
          </p>
        </div>
      </div>
    </footer>
  );
}
