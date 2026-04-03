"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import { HiOutlineArrowLeft, HiOutlineArrowPath } from "react-icons/hi2";

const CARDS_DATA = [
  { id: 1, type: 'letter', content: 'A', pairId: 'pair_A' },
  { id: 2, type: 'sign', content: 'A', pairId: 'pair_A' },
  { id: 3, type: 'letter', content: 'B', pairId: 'pair_B' },
  { id: 4, type: 'sign', content: 'B', pairId: 'pair_B' },
  { id: 5, type: 'letter', content: 'C', pairId: 'pair_C' },
  { id: 6, type: 'sign', content: 'C', pairId: 'pair_C' },
  { id: 7, type: 'letter', content: 'D', pairId: 'pair_D' },
  { id: 8, type: 'sign', content: 'D', pairId: 'pair_D' },
];

export default function MatchingGame() {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);

  const shuffleCards = () => {
    const shuffled = [...CARDS_DATA].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  useEffect(() => {
    shuffleCards();
  }, []);

  const handleFlip = (index) => {
    // Prevent clicking if 2 cards are already flipped, or if clicking already matched/flipped cards
    if (flipped.length >= 2 || flipped.includes(index) || matched.includes(cards[index].pairId)) return;
    
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstIdx, secondIdx] = newFlipped;
      
      if (cards[firstIdx].pairId === cards[secondIdx].pairId) {
        setMatched(prev => [...prev, cards[firstIdx].pairId]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000); // Wait 1 sec before flipping back
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      <Navbar />
      
      <main className="flex-1 mt-20 max-w-4xl mx-auto w-full px-4 py-10">
        
        <div className="flex justify-between items-center mb-8">
          <Link href="/games" className="inline-flex items-center gap-2 text-sm font-medium hover:underline text-[var(--text-secondary)]">
            <HiOutlineArrowLeft className="w-4 h-4" /> Back to Arcade
          </Link>

          <div className="flex gap-4 items-center">
            <div className="glass-sm px-4 py-2 font-bold text-[var(--text-primary)]">
              Moves: {moves}
            </div>
            <button onClick={shuffleCards} className="btn border border-[var(--glass-border)] bg-white ml-2 text-gray-700">
               <HiOutlineArrowPath className="w-4 h-4" /> Restart
            </button>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Memory Match</h1>
          <p className="text-[var(--text-muted)] mt-2">Match the English letter with its ASL sign substitute.</p>
        </div>

        {matched.length === CARDS_DATA.length / 2 && (
          <div className="text-center mb-8 p-6 glass-card bg-[var(--success)]/10 border border-[var(--success)]/20 animate-fade-in">
             <h2 className="text-2xl font-bold text-[var(--success)] mb-2">You Won!</h2>
             <p className="text-sm font-medium text-[var(--text-secondary)]">Completed in {moves} moves.</p>
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 sm:gap-6 perspective-1000">
          {cards.map((card, idx) => {
            const isFlipped = flipped.includes(idx) || matched.includes(card.pairId);

            return (
              <div 
                key={`${card.id}-${idx}`}
                onClick={() => handleFlip(idx)}
                className={`relative w-full aspect-square rounded-2xl cursor-pointer transition-all duration-500 preserve-3d ${
                  isFlipped ? "rotate-y-180" : ""
                } ${matched.includes(card.pairId) ? "opacity-60 scale-95" : "hover:scale-105"}`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                
                {/* Back (Cover) */}
                <div className="absolute inset-0 backface-hidden rounded-2xl bg-[var(--primary)] flex flex-col items-center justify-center shadow-lg border-2 border-[var(--glass-border)] box-border p-2">
                  <div className="w-full h-full border border-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-3xl font-bold opacity-30 text-white">?</span>
                  </div>
                </div>

                {/* Front (Content) */}
                <div 
                  className="absolute inset-0 backface-hidden rounded-2xl bg-white flex flex-col items-center justify-center shadow-lg border-2 border-[var(--glass-border)] rotate-y-180"
                  style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                >
                  <span className={`text-5xl font-extrabold ${card.type === 'sign' ? 'text-[var(--primary)] font-serif' : 'text-slate-800'}`}>
                    {card.content}
                  </span>
                  <span className="absolute bottom-3 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    {card.type}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
