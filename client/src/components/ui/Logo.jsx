import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

/**
 * Reusable Logo component for the SignBridge platform.
 * Supports responsive sizing and provides consistent branding across the app.
 */
export default function Logo({ className = "" }) {
  return (
    <Link 
      href="/" 
      className={`flex items-center gap-3 group transition-all duration-300 hover:scale-[1.02] active:scale-95 ${className}`}
      aria-label={`${APP_NAME} Home`}
    >
      <div className="relative h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 transition-transform group-hover:rotate-3">
        <Image
          src="/logo.png"
          alt={`${APP_NAME} logo`}
          fill
          sizes="(max-width: 768px) 32px, (max-width: 1024px) 40px, 48px"
          priority
          className="object-contain"
        />
      </div>
      
      <span 
        className="text-xl md:text-2xl font-bold tracking-tight bg-clip-text text-transparent group-hover:opacity-90 transition-opacity"
        style={{
          backgroundImage: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
        }}
      >
        {APP_NAME}
      </span>
    </Link>
  );
}
