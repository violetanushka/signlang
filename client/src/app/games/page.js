"use client";

import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { HiOutlinePuzzlePiece, HiOutlineBolt, HiOutlineQuestionMarkCircle } from "react-icons/hi2";

export default function GamesHubPage() {
  const games = [
    {
      id: "matching",
      title: "Memory Match",
      description: "Match the ASL gestures to their correct English letters and words.",
      icon: <HiOutlinePuzzlePiece className="w-10 h-10" />,
      color: "var(--primary)",
      bg: "rgba(37,99,235,0.1)",
      link: "/games/matching"
    },
    {
      id: "speed",
      title: "Speed Challenge",
      description: "How fast can you sign a sequence of letters? Test your reaction time.",
      icon: <HiOutlineBolt className="w-10 h-10" />,
      color: "var(--warning)",
      bg: "rgba(245,158,11,0.1)",
      link: "/games/speed"
    },
    {
      id: "quiz",
      title: "Sign Language Knowledge",
      description: "Multiple choice quick quizzes to test your vocabulary retention.",
      icon: <HiOutlineQuestionMarkCircle className="w-10 h-10" />,
      color: "var(--accent)",
      bg: "rgba(139,92,246,0.1)",
      link: "/games/quiz"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <Navbar />

      <main className="flex-1 mt-20 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 relative z-10">
        
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <div className="text-6xl mb-6 drop-shadow-lg">🎮</div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-[var(--text-primary)]">
            Signa Arcade
          </h1>
          <p className="text-lg text-[var(--text-secondary)]">
            Practice American Sign Language through engaging minigames. Earn points, build streaks, and master the alphabet faster!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {games.map((game) => (
             <Link 
               href={game.link} 
               key={game.id}
               className="glass-card hover:scale-105 transition-transform duration-300 p-8 flex flex-col h-full border border-[var(--glass-border)] group"
             >
               <div 
                 className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-xl transition-all group-hover:shadow-2xl"
                 style={{ backgroundColor: game.bg, color: game.color }}
               >
                 {game.icon}
               </div>

               <h2 className="text-2xl font-bold mb-3 text-[var(--text-primary)]">{game.title}</h2>
               <p className="text-sm text-[var(--text-secondary)] flex-1 leading-relaxed">
                 {game.description}
               </p>

               <div className="mt-8 font-bold text-sm tracking-wider uppercase" style={{ color: game.color }}>
                 Play Now &rarr;
               </div>
             </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
