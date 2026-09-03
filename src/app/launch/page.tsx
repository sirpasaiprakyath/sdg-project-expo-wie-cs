"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ShieldCheck, Home } from "lucide-react";
import CinematicIntro from "@/components/intro/CinematicIntro";
import { saveSiteLaunchState } from "@/lib/store";

export default function DedicatedLaunchPage() {
  const router = useRouter();
  const [isLaunching, setIsLaunching] = useState(false);

  const handleLaunchNow = () => {
    // Save site launched state
    saveSiteLaunchState({
      isReadyForLaunch: true,
      isLaunched: true,
      launchedAt: new Date().toISOString(),
    });
    // Trigger cinematic intro
    setIsLaunching(true);
  };

  const handleIntroComplete = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#F4F2EC] flex flex-col items-center justify-center p-4 sm:p-8 text-center select-none relative overflow-hidden">
      
      {/* Background Radial Ambient Lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.9)_0%,rgba(244,242,236,0.95)_60%,rgba(235,232,222,1)_100%)] pointer-events-none" />

      {/* Cinematic Intro Overlay when Launching */}
      <AnimatePresence>
        {isLaunching && <CinematicIntro onComplete={handleIntroComplete} />}
      </AnimatePresence>

      {/* Top Header Navigation */}
      <header className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2 neu-badge bg-white/90 text-neu-gold font-extrabold text-xs px-4 py-2 border border-neu-gold/30 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-neu-gold" />
          <span>OFFICIAL EVENT LAUNCH CONSOLE</span>
        </div>

        <Link
          href="/"
          className="neu-btn px-4 py-2 text-xs font-black text-neu-muted hover:text-neu-text flex items-center gap-2 shadow-sm bg-white/90"
        >
          <Home className="w-4 h-4" />
          <span>Enter Website Directly</span>
        </Link>
      </header>

      {/* Main Grand Launch Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-3xl neu-raised-lg p-8 sm:p-14 rounded-3xl bg-[#FAF8F4] border-4 border-neu-gold/40 shadow-2xl space-y-8 my-12"
      >
        
        {/* Institution Badge */}
        <div>
          <span className="neu-badge text-neu-gold font-black text-xs sm:text-sm px-5 py-2 bg-white border border-neu-gold/40 tracking-widest uppercase shadow-sm">
            KALASALINGAM ACADEMY OF RESEARCH AND EDUCATION
          </span>
        </div>

        {/* LOGOS CONVERGENCE CARDS */}
        <div className="flex items-center justify-center gap-4 sm:gap-10 my-6">
          
          {/* IEEE WIE Logo Card */}
          <div className="neu-raised p-4 sm:p-6 rounded-3xl bg-white border-2 border-neu-gold/50 shadow-xl flex flex-col items-center">
            <div className="relative w-24 h-24 sm:w-36 sm:h-36">
              <Image
                src="/wie-logo.jpeg"
                alt="IEEE WIE KARE"
                fill
                className="object-contain p-1"
                priority
              />
            </div>
            <span className="mt-3 text-xs font-black text-neu-gold uppercase tracking-wider">
              IEEE WIE KARE
            </span>
          </div>

          {/* Collaboration Multiply Badge */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 neu-raised rounded-2xl flex items-center justify-center border-2 border-neu-gold bg-white shadow-xl">
              <span className="text-3xl sm:text-4xl font-black text-neu-gold">×</span>
            </div>
            <span className="text-[10px] font-black text-neu-gold tracking-widest uppercase mt-2">
              IN ASSOCIATION WITH
            </span>
          </div>

          {/* IEEE CS Logo Card */}
          <div className="neu-raised p-4 sm:p-6 rounded-3xl bg-white border-2 border-neu-green/50 shadow-xl flex flex-col items-center">
            <div className="relative w-24 h-24 sm:w-36 sm:h-36">
              <Image
                src="/ieee-cs-logo.jpeg"
                alt="IEEE CS KARE"
                fill
                className="object-contain p-1"
                priority
              />
            </div>
            <span className="mt-3 text-xs font-black text-neu-green uppercase tracking-wider">
              IEEE CS KARE
            </span>
          </div>

        </div>

        {/* Grand Event Title */}
        <div className="space-y-3">
          <div className="inline-block neu-badge text-neu-gold border-2 border-neu-gold/40 text-xs font-black px-4 py-1.5 uppercase tracking-widest">
            24-HOUR HYBRID PROJECT EXPO 2026
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-neu-text tracking-tight">
            SDG FOCUSED <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5A059] via-[#D4AF37] to-[#B89243]">PROJECT EXPO</span>
          </h1>

          <p className="text-sm sm:text-lg font-black text-neu-green tracking-wide">
            INNOVATE TODAY — IMPACT TOMORROW
          </p>

          <p className="text-xs sm:text-sm font-semibold text-neu-muted max-w-lg mx-auto">
            Official platform inauguration for registered participant teams, faculty reviewers, and event coordinators.
          </p>
        </div>

        {/* BIG GRAND LAUNCH BUTTON */}
        <div className="pt-4 space-y-4">
          <button
            onClick={handleLaunchNow}
            className="neu-btn bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-amber-950 px-10 sm:px-14 py-5 sm:py-6 rounded-3xl text-xl sm:text-2xl font-black shadow-2xl hover:scale-105 transition-transform flex items-center justify-center gap-4 mx-auto border-4 border-yellow-300 w-full sm:w-auto"
          >
            <Sparkles className="w-8 h-8 fill-amber-950" />
            <span>🚀 LAUNCH EVENT NOW</span>
            <ArrowRight className="w-7 h-7" />
          </button>

          <p className="text-[11px] font-bold text-neu-muted">
            Clicking this triggers the grand intro sequence and unlocks the live website landing page.
          </p>
        </div>

      </motion.div>

    </div>
  );
}
