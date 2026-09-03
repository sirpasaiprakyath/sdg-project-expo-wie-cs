"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface CinematicIntroProps {
  onComplete: () => void;
}

export default function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const [stage, setStage] = useState<number>(0);

  useEffect(() => {
    // Ultra-Fast & Buttery Smooth Timeline (~3.6s)
    const t0 = setTimeout(() => setStage(1), 100);   // Logos glide in with 3D Glassmorphism
    const t1 = setTimeout(() => setStage(2), 1200);  // Champagne light glow connection & collaboration badge
    const t2 = setTimeout(() => setStage(3), 2200);  // Metallic Shimmer Title reveal
    const t3 = setTimeout(() => {
      sessionStorage.setItem("sdg_intro_done", "true");
      onComplete();
    }, 3600);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  const handleSkip = () => {
    sessionStorage.setItem("sdg_intro_done", "true");
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F4F2EC] overflow-hidden select-none"
    >
      {/* Warm Ivory Radial Ambient Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,1)_0%,rgba(244,242,236,0.96)_65%,rgba(235,232,222,1)_100%)] pointer-events-none" />

      {/* Skip Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        onClick={handleSkip}
        className="absolute top-6 right-6 z-50 neu-btn px-4 py-2 text-xs font-extrabold text-neu-gold hover:text-neu-text tracking-widest uppercase border border-neu-gold/30 shadow-md backdrop-blur-md"
      >
        Skip Intro ➔
      </motion.button>

      {/* Main Container */}
      <div className="relative w-full max-w-4xl h-[480px] flex flex-col items-center justify-center p-4">
        
        {/* LOGOS CONVERGENCE & CHAMPAGNE LIGHT GLOW (Stages 1 & 2) */}
        {stage < 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center my-4"
          >
            {/* Logos Row */}
            <div className="relative flex items-center justify-center gap-6 sm:gap-12 md:gap-14 mb-6">
              
              {/* CHAMPAGNE LIGHT GLOW BEAM (Stage 2) */}
              {stage >= 2 && (
                <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 0.8 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute inset-x-0 h-1 bg-gradient-to-r from-[#C5A059] via-[#FFF5D6] to-[#3B7A57] blur-[2px] z-0"
                />
              )}

              {/* Left Logo: IEEE WIE KARE */}
              <motion.div
                initial={{ opacity: 0, x: -90, rotateY: -15, scale: 0.85 }}
                animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="neu-raised-lg p-4 sm:p-5 rounded-3xl bg-white/95 border-2 border-neu-gold/40 shadow-2xl relative z-10"
              >
                <div className="relative w-28 h-28 sm:w-36 sm:h-36">
                  <Image
                    src="/wie-logo.jpeg"
                    alt="IEEE WIE KARE"
                    fill
                    className="object-contain rounded-2xl"
                    priority
                  />
                </div>
                <span className="mt-2.5 text-xs font-black text-neu-gold uppercase tracking-wider block text-center">
                  IEEE WIE KARE
                </span>
              </motion.div>

              {/* Metallic Collaboration Badge */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
                className="z-10 flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 neu-raised rounded-2xl flex items-center justify-center border-2 border-neu-gold bg-white shadow-xl">
                  <span className="text-3xl font-black text-neu-gold">×</span>
                </div>
                <span className="text-[10px] font-black text-neu-gold tracking-widest uppercase mt-1.5">
                  COLLABORATION
                </span>
              </motion.div>

              {/* Right Logo: IEEE CS KARE */}
              <motion.div
                initial={{ opacity: 0, x: 90, rotateY: 15, scale: 0.85 }}
                animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="neu-raised-lg p-4 sm:p-5 rounded-3xl bg-white/95 border-2 border-neu-green/40 shadow-2xl relative z-10"
              >
                <div className="relative w-28 h-28 sm:w-36 sm:h-36">
                  <Image
                    src="/ieee-cs-logo.jpeg"
                    alt="IEEE CS KARE"
                    fill
                    className="object-contain rounded-2xl"
                    priority
                  />
                </div>
                <span className="mt-2.5 text-xs font-black text-neu-green uppercase tracking-wider block text-center">
                  IEEE CS KARE
                </span>
              </motion.div>

            </div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xs sm:text-sm font-black uppercase tracking-widest text-neu-gold"
            >
              KALASALINGAM ACADEMY OF RESEARCH AND EDUCATION
            </motion.p>
          </motion.div>
        )}

        {/* METALLIC SHIMMER EVENT TITLE REVEAL (Stage 3) */}
        {stage >= 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center text-center px-4"
          >
            <div className="neu-badge mb-5 text-neu-gold border-2 border-neu-gold/40 uppercase tracking-widest text-xs font-black py-1.5 px-5 shadow-sm">
              24-HOUR HYBRID PROJECT EXPO 2026
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-neu-text tracking-tight mb-3">
              SDG FOCUSED <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5A059] via-[#D4AF37] to-[#B89243]">PROJECT EXPO</span>
            </h1>

            <p className="text-lg sm:text-2xl font-black text-neu-green tracking-wide max-w-2xl mb-2">
              INNOVATE TODAY — IMPACT TOMORROW
            </p>

            <p className="text-xs sm:text-sm font-bold text-neu-muted max-w-xl">
              BUILDING SOLUTIONS FOR A SUSTAINABLE FUTURE
            </p>
          </motion.div>
        )}

      </div>
    </motion.div>
  );
}
