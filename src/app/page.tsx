"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Trophy, 
  Award, 
  IndianRupee, 
  ArrowRight,
  HeartPulse,
  GraduationCap,
  Lightbulb,
  Building2,
  Leaf,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import CinematicIntro from "@/components/intro/CinematicIntro";
import Footer from "@/components/layout/Footer";
import { ALLOWED_SDGS } from "@/lib/types";

export default function LandingPage() {
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F2EC]">
      {/* Fast & High-Impact Collaboration Intro (Plays on every page refresh) */}
      <AnimatePresence>
        {showIntro && <CinematicIntro onComplete={() => setShowIntro(false)} />}
      </AnimatePresence>

      {/* Main Header / Banner */}
      <header className="w-full bg-[#FAF8F4] border-b border-white/60 py-4 px-4 sm:px-8 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 neu-raised-sm p-2 rounded-2xl bg-white/90 shadow-md">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                <Image src="/wie-logo.jpeg" alt="WIE" fill className="object-contain p-0.5 rounded-lg" priority />
              </div>
              <span className="text-sm font-black text-neu-gold">×</span>
              <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                <Image src="/ieee-cs-logo.jpeg" alt="CS" fill className="object-contain p-0.5 rounded-lg" priority />
              </div>
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-neu-text tracking-wide">
                IEEE WIE & CS KARE
              </h3>
              <p className="text-[10px] text-neu-muted">
                Kalasalingam Academy of Research and Education
              </p>
            </div>
          </div>

          <Link
            href="/login"
            className="neu-btn neu-btn-gold px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md hover:scale-105 transition-transform"
          >
            <span>Enter Event Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section — BIG LOGOS PLACED PROMINENTLY ON TOP OF TITLE */}
      <motion.section 
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={!showIntro ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative pt-10 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col items-center text-center"
      >
        
        {/* BIG CLUB LOGOS DISPLAYED PROMINENTLY ON TOP OF TITLE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={!showIntro ? { opacity: 1, scale: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="flex items-center justify-center gap-4 sm:gap-10 md:gap-14 mb-8"
        >
          {/* BIG Left Logo: IEEE WIE KARE */}
          <div className="neu-raised p-4 sm:p-6 md:p-7 rounded-3xl bg-white/90 border-2 border-neu-gold/30 shadow-2xl hover:scale-105 transition-transform">
            <div className="relative w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48">
              <Image
                src="/wie-logo.jpeg"
                alt="IEEE WIE KARE"
                fill
                className="object-contain rounded-2xl"
                priority
              />
            </div>
            <span className="mt-3 text-xs sm:text-sm font-black text-neu-gold uppercase tracking-wider block">
              IEEE WIE KARE
            </span>
          </div>

          {/* Golden Collaboration Badge */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 neu-raised rounded-3xl flex items-center justify-center border-2 border-neu-gold bg-white shadow-xl">
              <span className="text-3xl sm:text-5xl font-black text-neu-gold">×</span>
            </div>
            <span className="text-[10px] sm:text-xs font-black text-neu-gold tracking-widest uppercase mt-2">
              IN COLLABORATION
            </span>
          </div>

          {/* BIG Right Logo: IEEE CS KARE */}
          <div className="neu-raised p-4 sm:p-6 md:p-7 rounded-3xl bg-white/90 border-2 border-neu-green/30 shadow-2xl hover:scale-105 transition-transform">
            <div className="relative w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48">
              <Image
                src="/ieee-cs-logo.jpeg"
                alt="IEEE CS KARE"
                fill
                className="object-contain rounded-2xl"
                priority
              />
            </div>
            <span className="mt-3 text-xs sm:text-sm font-black text-neu-green uppercase tracking-wider block">
              IEEE CS KARE
            </span>
          </div>
        </motion.div>

        {/* Event Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="neu-badge mb-5 text-neu-gold font-black tracking-widest uppercase flex items-center gap-2 border-2 border-neu-gold/30 px-5 py-2 text-xs shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-neu-gold animate-spin" style={{ animationDuration: "8s" }} />
          <span>Kalasalingam Academy of Research and Education</span>
        </motion.div>

        {/* Hero Title Directly Below Big Logos */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-black text-neu-text tracking-tight mb-4 drop-shadow-sm"
        >
          SDG FOCUSED <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5A059] via-[#D4AF37] to-[#B89243]">PROJECT EXPO</span>
        </motion.h1>

        {/* Taglines */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg sm:text-2xl lg:text-3xl font-black text-neu-green tracking-wide max-w-3xl mb-3"
        >
          INNOVATE TODAY — IMPACT TOMORROW
        </motion.p>
        <p className="text-sm sm:text-base font-extrabold text-neu-muted max-w-2xl mb-10">
          BUILDING SOLUTIONS FOR A SUSTAINABLE FUTURE
        </p>

        {/* Key Event Badges Grid */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl w-full mb-12"
        >
          <div className="neu-raised p-5 rounded-3xl flex flex-col items-center border border-white/80 shadow-lg hover:scale-105 transition-transform">
            <Calendar className="w-7 h-7 text-neu-gold mb-2" />
            <span className="text-xs font-bold text-neu-muted uppercase tracking-wider">Date</span>
            <span className="text-sm font-black text-neu-text mt-0.5">Sep 3 & 4, 2026</span>
          </div>

          <div className="neu-raised p-5 rounded-3xl flex flex-col items-center border border-white/80 shadow-lg hover:scale-105 transition-transform">
            <Clock className="w-7 h-7 text-neu-green mb-2" />
            <span className="text-xs font-bold text-neu-muted uppercase tracking-wider">Duration</span>
            <span className="text-sm font-black text-neu-text mt-0.5">24 Hours (5 PM - 5 PM)</span>
          </div>

          <div className="neu-raised p-5 rounded-3xl flex flex-col items-center border border-white/80 shadow-lg hover:scale-105 transition-transform">
            <Trophy className="w-7 h-7 text-amber-600 mb-2" />
            <span className="text-xs font-bold text-neu-muted uppercase tracking-wider">Prize Pool</span>
            <span className="text-sm font-black text-neu-text mt-0.5">₹10K Cash Prize</span>
          </div>

          <div className="neu-raised p-5 rounded-3xl flex flex-col items-center border border-white/80 shadow-lg hover:scale-105 transition-transform">
            <Award className="w-7 h-7 text-emerald-600 mb-2" />
            <span className="text-xs font-bold text-neu-muted uppercase tracking-wider">Credits</span>
            <span className="text-sm font-black text-neu-text mt-0.5">2 EE Credits</span>
          </div>
        </motion.div>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link
            href="/login"
            className="neu-btn neu-btn-gold px-10 py-4 text-lg font-black flex items-center gap-3 shadow-xl hover:scale-105 transition-all"
          >
            <span>ENTER EVENT PORTAL</span>
            <ArrowRight className="w-6 h-6" />
          </Link>
        </motion.div>
      </motion.section>

      {/* GRAND OLYMPIC PRIZE PODIUM SECTION */}
      <section className="py-16 px-4 bg-gradient-to-b from-[#FAF8F4] to-[#F4F2EC] border-y border-white/80 relative overflow-hidden">
        <div className="max-w-6xl mx-auto w-full text-center space-y-12">
          
          <div>
            <span className="neu-badge text-neu-gold font-black tracking-widest uppercase text-xs border border-neu-gold/30 px-4 py-2 bg-white">
              CHAMPIONSHIP HONORS & REWARDS
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-neu-text mt-3">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600">PRIZE POOL</span>
            </h2>
            <p className="text-sm font-semibold text-neu-muted mt-2 max-w-xl mx-auto">
              Compete for top innovation ranks, total cash prizes of ₹10,000, trophies, and 2 EE credits!
            </p>
          </div>

          {/* OLYMPIC 1, 2, 3 STAND BOARD */}
          <div className="flex flex-col md:flex-row items-end justify-center gap-6 sm:gap-8 pt-8 pb-4">
            
            {/* 2nd Place Stand (Silver - Left) */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full md:w-1/3 order-2 md:order-1 flex flex-col items-center"
            >
              {/* Stand Card Top (Silver Theme) */}
              <div className="neu-raised p-6 rounded-3xl bg-gradient-to-b from-[#F8FAFC] via-[#E2E8F0] to-[#CBD5E1] w-full border-4 border-slate-300 shadow-xl text-center relative hover:scale-105 transition-transform">
                <span className="inline-block px-3.5 py-1 rounded-full text-[11px] font-black text-slate-900 bg-white/90 uppercase tracking-wider mb-2 shadow-sm border border-slate-300">
                  🥈 2ND PLACE (SILVER)
                </span>
                <h4 className="text-xl font-black text-slate-900 tracking-tight">RUNNER UP</h4>
                <div className="my-3 flex items-center justify-center gap-1 text-slate-950">
                  <span className="text-xl font-black">₹</span>
                  <span className="text-4xl font-black tracking-tight text-slate-950">3,000</span>
                </div>
              </div>

              {/* Olympic Stand Block 2 (Silver Metallic) */}
              <div className="w-full bg-gradient-to-t from-[#475569] via-[#94A3B8] to-[#E2E8F0] h-40 md:h-52 rounded-b-3xl neu-raised flex flex-col items-center justify-center border-t-4 border-slate-200 shadow-xl mt-2">
                <span className="text-7xl font-black text-slate-900/40">2</span>
                <span className="text-xs font-black text-slate-950 uppercase tracking-widest mt-1">SILVER STAND</span>
              </div>
            </motion.div>

            {/* 1st Place Stand (Gold - Center - HIGHEST & GRANDEST) */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="w-full md:w-1/3 order-1 md:order-2 flex flex-col items-center -mt-6 md:-mt-10"
            >
              {/* Grand Crown Badge */}
              <div className="neu-badge text-amber-950 bg-yellow-300 font-black text-xs px-4 py-1.5 rounded-full shadow-lg border-2 border-yellow-400 mb-2 flex items-center gap-1.5 animate-bounce">
                <Trophy className="w-4 h-4 text-amber-950 fill-amber-600" />
                <span>GRAND CHAMPION</span>
              </div>

              {/* Stand Card Top (Gold Theme) */}
              <div className="neu-raised p-7 rounded-3xl bg-gradient-to-b from-[#FFF4A3] via-[#FFD700] to-[#F59E0B] w-full border-4 border-yellow-200 shadow-2xl text-center relative hover:scale-105 transition-transform">
                <span className="inline-block px-4 py-1 rounded-full text-xs font-black text-amber-950 bg-white/90 uppercase tracking-wider mb-2 shadow-md border border-amber-300">
                  🥇 1ST PLACE (GOLD)
                </span>
                <h4 className="text-2xl font-black text-amber-950 tracking-tight">OVERALL WINNER</h4>
                <div className="my-3 flex items-center justify-center gap-1 text-amber-950">
                  <span className="text-2xl font-black">₹</span>
                  <span className="text-5xl font-black tracking-tight text-amber-950">5,000</span>
                </div>
              </div>

              {/* Olympic Stand Block 1 (Gold Metallic) */}
              <div className="w-full bg-gradient-to-t from-[#B8860B] via-[#FFD700] to-[#FFE87C] h-56 md:h-72 rounded-b-3xl neu-raised flex flex-col items-center justify-center border-t-4 border-yellow-200 shadow-2xl mt-2">
                <span className="text-8xl font-black text-amber-950/40">1</span>
                <span className="text-sm font-black text-amber-950 uppercase tracking-widest mt-1">GOLD STAND</span>
              </div>
            </motion.div>

            {/* 3rd Place Stand (Bronze - Right) */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-full md:w-1/3 order-3 flex flex-col items-center"
            >
              {/* Stand Card Top (Bronze Theme) */}
              <div className="neu-raised p-6 rounded-3xl bg-gradient-to-b from-[#FDF6F0] via-[#F3D5C0] to-[#CD7F32] w-full border-4 border-amber-600 shadow-xl text-center relative hover:scale-105 transition-transform">
                <span className="inline-block px-3.5 py-1 rounded-full text-[11px] font-black text-amber-950 bg-white/90 uppercase tracking-wider mb-2 shadow-sm border border-amber-400">
                  🥉 3RD PLACE (BRONZE)
                </span>
                <h4 className="text-xl font-black text-amber-950 tracking-tight">2ND RUNNER UP</h4>
                <div className="my-3 flex items-center justify-center gap-1 text-amber-950">
                  <span className="text-xl font-black">₹</span>
                  <span className="text-4xl font-black tracking-tight text-amber-950">2,000</span>
                </div>
              </div>

              {/* Olympic Stand Block 3 (Bronze Metallic) */}
              <div className="w-full bg-gradient-to-t from-[#78350F] via-[#B45309] to-[#D97706] h-32 md:h-40 rounded-b-3xl neu-raised flex flex-col items-center justify-center border-t-4 border-amber-400 shadow-xl mt-2">
                <span className="text-6xl font-black text-amber-950/50">3</span>
                <span className="text-xs font-black text-amber-950 uppercase tracking-widest mt-1">BRONZE STAND</span>
              </div>
            </motion.div>

          </div>

          {/* Grand Perks Banner */}
          <div className="neu-raised p-6 rounded-3xl bg-white flex flex-wrap items-center justify-around gap-4 border border-neu-gold/30">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-neu-gold" />
              <span className="text-xs font-extrabold text-neu-text">2 EE Credits for All Registered Participants</span>
            </div>
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-neu-green" />
              <span className="text-xs font-extrabold text-neu-text">Official IEEE WIE & IEEE CS Certificates</span>
            </div>
          </div>

        </div>
      </section>

      {/* Venue & Organizer Details Banner */}
      <section className="bg-[#FAF8F4] py-14 px-4 border-y border-white/80">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="neu-raised p-6 rounded-3xl flex items-start gap-4">
            <div className="p-3.5 neu-inset rounded-2xl text-neu-gold bg-[#ECE9E1]">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neu-muted uppercase tracking-wider">Venue Location</h4>
              <p className="text-base font-black text-neu-text mt-1">Dr. Vasudevan Seminar Hall</p>
              <p className="text-xs text-neu-muted">Tiffac Core, KARE Campus</p>
            </div>
          </div>

          <div className="neu-raised p-6 rounded-3xl flex items-start gap-4">
            <div className="p-3.5 neu-inset rounded-2xl text-neu-green bg-[#ECE9E1]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neu-muted uppercase tracking-wider">Team Format</h4>
              <p className="text-base font-black text-neu-text mt-1">4 Members Per Team</p>
              <p className="text-xs text-neu-muted">Interdisciplinary Teams Welcome</p>
            </div>
          </div>

          <div className="neu-raised p-6 rounded-3xl flex items-start gap-4">
            <div className="p-3.5 neu-inset rounded-2xl text-amber-700 bg-[#ECE9E1]">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neu-muted uppercase tracking-wider">Registration Fee</h4>
              <p className="text-base font-black text-neu-text mt-1">₹350 Per Team</p>
              <p className="text-xs text-neu-muted">Includes Certificate & EE Credits</p>
            </div>
          </div>
        </div>
      </section>

      {/* Focus SDGs Showcase Section (STRICTLY ONLY THESE 5 SDGs) */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="neu-badge text-neu-gold font-black tracking-widest uppercase text-xs border border-neu-gold/30">
            Sustainable Development Goals
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-neu-text mt-3">
            THE FIVE FOCUS <span className="text-neu-gold">SDG GOALS</span>
          </h2>
          <p className="text-sm font-semibold text-neu-muted mt-2 max-w-xl mx-auto">
            All submitted projects must address one or more of these five official Sustainable Development Goals.
          </p>
        </div>

        {/* Grid of 5 SDGs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ALLOWED_SDGS.map((sdg) => {
            let IconComp = Lightbulb;
            if (sdg.key === "SDG_3") IconComp = HeartPulse;
            if (sdg.key === "SDG_4") IconComp = GraduationCap;
            if (sdg.key === "SDG_9") IconComp = Lightbulb;
            if (sdg.key === "SDG_11") IconComp = Building2;
            if (sdg.key === "SDG_13") IconComp = Leaf;

            return (
              <div
                key={sdg.key}
                className="neu-raised p-6 rounded-3xl flex flex-col justify-between hover:scale-[1.02] transition-transform border-t-4 shadow-lg bg-white/70"
                style={{ borderColor: sdg.color }}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="px-3.5 py-1 rounded-full text-xs font-black text-white shadow-sm"
                      style={{ backgroundColor: sdg.color }}
                    >
                      SDG {sdg.id}
                    </span>
                    <div className="p-3 neu-inset rounded-2xl bg-[#ECE9E1]" style={{ color: sdg.color }}>
                      <IconComp className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="text-base font-black text-neu-text mb-2">
                    {sdg.title}
                  </h3>
                  <p className="text-xs text-neu-muted leading-relaxed font-medium">
                    {sdg.subtitle}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neu-text/10 flex items-center gap-2 text-xs font-black text-neu-green">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Eligible Target Area</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Additional Message Section */}
      <section className="py-14 bg-[#FAF8F4] px-4 border-t border-white/80 text-center">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-black text-neu-text mb-2">
            TOGETHER, LET&apos;S BUILD A BETTER AND SUSTAINABLE WORLD
          </h3>
          <p className="text-xs md:text-sm text-neu-muted mb-6 font-semibold">
            Presented by IEEE Women in Engineering KARE & IEEE Computer Society KARE
          </p>
          <Link
            href="/login"
            className="inline-flex neu-btn neu-btn-gold px-10 py-4 rounded-2xl text-sm font-black items-center gap-2 shadow-lg hover:scale-105 transition-transform"
          >
            Go to Portal Login ➔
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
