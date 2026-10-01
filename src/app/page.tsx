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
    if (typeof window !== "undefined" && sessionStorage.getItem("sdg_intro_done") === "true") {
      setShowIntro(false);
    }
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
          KHEPRIX’26 <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5A059] via-[#D4AF37] to-[#B89243]">PROJECT EXPO</span>
        </motion.h1>

        {/* Taglines */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg sm:text-2xl lg:text-3xl font-black text-neu-green tracking-wide max-w-3xl mb-3"
        >
          BORN FROM VISION. BUILT FOR ETERNITY.
        </motion.p>
        <p className="text-sm sm:text-base font-extrabold text-neu-gold tracking-widest uppercase max-w-2xl mb-4">
          CREATE YOUR LEGACY
        </p>

        {/* Event Pitch */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="max-w-2xl mx-auto neu-inset p-4 rounded-2xl bg-[#ECE9E1]/80 mb-8 border border-white/60 text-xs sm:text-sm font-semibold text-neu-text leading-relaxed"
        >
          Ready to discover how real-world applications work and reimagine them from the ground up? 💻🔥 Join <strong>KHEPRIX’26</strong>, an industry-oriented Coding Challenge + Project Expo designed to challenge and elevate your technical defense!
        </motion.div>

        {/* Key Event Badges Grid */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl w-full mb-10"
        >
          <div className="neu-raised p-5 rounded-3xl flex flex-col items-center border border-white/80 shadow-lg hover:scale-105 transition-transform">
            <Calendar className="w-7 h-7 text-neu-gold mb-2" />
            <span className="text-xs font-bold text-neu-muted uppercase tracking-wider">Event Date</span>
            <span className="text-sm font-black text-neu-text mt-0.5">02 October 2026</span>
          </div>

          <div className="neu-raised p-5 rounded-3xl flex flex-col items-center border border-white/80 shadow-lg hover:scale-105 transition-transform">
            <Clock className="w-7 h-7 text-neu-green mb-2" />
            <span className="text-xs font-bold text-neu-muted uppercase tracking-wider">Timing</span>
            <span className="text-sm font-black text-neu-text mt-0.5">9:00 AM – 5:00 PM</span>
          </div>

          <div className="neu-raised p-5 rounded-3xl flex flex-col items-center border border-white/80 shadow-lg hover:scale-105 transition-transform">
            <MapPin className="w-7 h-7 text-amber-600 mb-2" />
            <span className="text-xs font-bold text-neu-muted uppercase tracking-wider">Venue</span>
            <span className="text-sm font-black text-neu-text mt-0.5">8501 & 8601 Labs</span>
          </div>

          <div className="neu-raised p-5 rounded-3xl flex flex-col items-center border border-white/80 shadow-lg hover:scale-105 transition-transform">
            <Users className="w-7 h-7 text-emerald-600 mb-2" />
            <span className="text-xs font-bold text-neu-muted uppercase tracking-wider">Team Size</span>
            <span className="text-sm font-black text-neu-text mt-0.5">Max 4 Members</span>
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

      {/* CORE CHALLENGE SKILL PILLARS */}
      <section className="py-12 px-4 bg-[#FAF8F4] border-y border-white/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <span className="neu-badge text-neu-gold font-black tracking-widest uppercase text-xs border border-neu-gold/30">
              INDUSTRY-ORIENTED TRACKS
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-neu-text mt-2">
              FIVE CORE TECHNICAL CHALLENGE PILLARS
            </h3>
            <p className="text-xs sm:text-sm text-neu-muted font-medium mt-1">
              Demonstrate architectural depth and engineering agility across these domains
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { icon: "🧩", title: "Reverse Engineering", desc: "Deconstruct systems & uncover algorithmic flow" },
              { icon: "🏗️", title: "Software Architecture", desc: "Resilient component & data design patterns" },
              { icon: "💻", title: "Feature Development", desc: "Build dynamic, scalable production capabilities" },
              { icon: "🧪", title: "Testing & Debugging", desc: "Eliminate bottlenecks & ensure robust edge cases" },
              { icon: "🔎", title: "Code Review & Defense", desc: "Technical presentation & jury defense" },
            ].map((pillar, i) => (
              <div key={i} className="neu-raised p-5 rounded-2xl bg-white/80 hover:scale-105 transition-transform flex flex-col items-center text-center">
                <span className="text-3xl mb-2">{pillar.icon}</span>
                <h4 className="text-xs font-black text-neu-text">{pillar.title}</h4>
                <p className="text-[11px] text-neu-muted mt-1 leading-snug">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EVENT HIGHLIGHTS & HONORS SECTION */}
      <section className="py-16 px-4 bg-gradient-to-b from-[#FAF8F4] to-[#F4F2EC] border-b border-white/80 relative overflow-hidden">
        <div className="max-w-6xl mx-auto w-full text-center space-y-12">
          
          <div>
            <span className="neu-badge text-neu-gold font-black tracking-widest uppercase text-xs border border-neu-gold/30 px-4 py-2 bg-white">
              🎯 EXCLUSIVE EVENT HIGHLIGHTS
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-neu-text mt-3">
              ACADEMIC CREDITS & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600">SPECIAL PRIZE POOL</span>
            </h2>
            <p className="text-sm font-semibold text-neu-muted mt-2 max-w-xl mx-auto">
              Compete for IEEE Membership, Special Prize Pool for the Best-Performing Team, and earn official credits!
            </p>
          </div>

          {/* Highlights 6-Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            <div className="neu-raised p-6 rounded-3xl bg-white/90 border border-amber-200/80 shadow-md hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl p-2.5 neu-inset rounded-2xl bg-amber-50">🎓</span>
                <h4 className="text-sm font-black text-neu-text">2 EE Credits</h4>
              </div>
              <p className="text-xs text-neu-muted leading-relaxed font-semibold">
                Direct academic accreditation for all participating <strong>3rd & 4th Year Students</strong> upon successful completion.
              </p>
            </div>

            <div className="neu-raised p-6 rounded-3xl bg-white/90 border border-emerald-200/80 shadow-md hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl p-2.5 neu-inset rounded-2xl bg-emerald-50">📚</span>
                <h4 className="text-sm font-black text-neu-text">Intensive Learning Structure</h4>
              </div>
              <p className="text-xs text-neu-muted leading-relaxed font-semibold">
                <strong>2 Online Courses</strong> + <strong>15 Hours Coding Challenge</strong> + <strong>8 Hours Project Expo</strong>.
              </p>
            </div>

            <div className="neu-raised p-6 rounded-3xl bg-white/90 border border-blue-200/80 shadow-md hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl p-2.5 neu-inset rounded-2xl bg-blue-50">🏆</span>
                <h4 className="text-sm font-black text-neu-text">IEEE Membership for Top 2 Teams</h4>
              </div>
              <p className="text-xs text-neu-muted leading-relaxed font-semibold">
                Prestigious <strong>IEEE Memberships</strong> awarded to the <strong>Top 2 Teams</strong> to empower international engineering careers.
              </p>
            </div>

            <div className="neu-raised p-6 rounded-3xl bg-white/90 border border-purple-200/80 shadow-md hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl p-2.5 neu-inset rounded-2xl bg-purple-50">🎁</span>
                <h4 className="text-sm font-black text-neu-text">Special Prize Pool</h4>
              </div>
              <p className="text-xs text-neu-muted leading-relaxed font-semibold">
                Dedicated <strong>Special Prize Pool</strong> awarded to the <strong>Best-Performing Team</strong> of KHEPRIX’26!
              </p>
            </div>

            <div className="neu-raised p-6 rounded-3xl bg-white/90 border border-rose-200/80 shadow-md hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl p-2.5 neu-inset rounded-2xl bg-rose-50">🎓</span>
                <h4 className="text-sm font-black text-neu-text">Group 3: 2nd Year Certificate</h4>
              </div>
              <p className="text-xs text-neu-muted leading-relaxed font-semibold">
                Official certificates for <strong>2nd Year Students</strong> (Group 3) verifying challenge completion and project display.
              </p>
            </div>

            <div className="neu-raised p-6 rounded-3xl bg-white/90 border border-teal-200/80 shadow-md hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl p-2.5 neu-inset rounded-2xl bg-teal-50">👥</span>
                <h4 className="text-sm font-black text-neu-text">Team Size: Max 4 Members</h4>
              </div>
              <p className="text-xs text-neu-muted leading-relaxed font-semibold">
                Interdisciplinary teams of up to 4 members collaborating across reverse engineering & software deployment.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Venue & Logistics Banner */}
      <section className="bg-[#FAF8F4] py-14 px-4 border-b border-white/80">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="neu-raised p-6 rounded-3xl flex items-start gap-4">
            <div className="p-3.5 neu-inset rounded-2xl text-neu-gold bg-[#ECE9E1]">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neu-muted uppercase tracking-wider">Venue Location</h4>
              <p className="text-base font-black text-neu-text mt-1">8501 & 8601 Labs</p>
              <p className="text-xs text-neu-muted">Kalasalingam Academy of Research and Education</p>
            </div>
          </div>

          <div className="neu-raised p-6 rounded-3xl flex items-start gap-4">
            <div className="p-3.5 neu-inset rounded-2xl text-neu-green bg-[#ECE9E1]">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neu-muted uppercase tracking-wider">Event Schedule</h4>
              <p className="text-base font-black text-neu-text mt-1">9:00 AM – 5:00 PM</p>
              <p className="text-xs text-neu-muted">02 October 2026 • Full Day Expo</p>
            </div>
          </div>

          <div className="neu-raised p-6 rounded-3xl flex items-start gap-4">
            <div className="p-3.5 neu-inset rounded-2xl text-amber-700 bg-[#ECE9E1]">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neu-muted uppercase tracking-wider">Top Honors</h4>
              <p className="text-base font-black text-neu-text mt-1">IEEE Membership + Cash Pool</p>
              <p className="text-xs text-neu-muted">Top 2 Teams & Best Performing Team</p>
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
          <span className="neu-badge text-neu-gold font-bold text-xs uppercase mb-3 inline-block">
            02 OCTOBER 2026 • 8501 & 8601 LABS
          </span>
          <h3 className="text-2xl md:text-3xl font-black text-neu-text mb-2">
            BORN FROM VISION. BUILT FOR ETERNITY. CREATE YOUR LEGACY.
          </h3>
          <p className="text-xs md:text-sm text-neu-muted mb-6 font-semibold">
            Organized by IEEE Women in Engineering KARE & IEEE Computer Society KARE
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
