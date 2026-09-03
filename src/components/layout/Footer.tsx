import React from "react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-[#FAF8F4] border-t border-white/80 py-10 px-4 mt-auto select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Branding & Organizers */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 neu-raised-sm p-2 rounded-xl bg-white/70">
            <div className="relative w-8 h-8">
              <Image src="/wie-logo.jpeg" alt="IEEE WIE" fill className="object-contain rounded" />
            </div>
            <span className="text-xs font-bold text-neu-gold">×</span>
            <div className="relative w-8 h-8">
              <Image src="/ieee-cs-logo.jpeg" alt="IEEE CS" fill className="object-contain rounded" />
            </div>
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-neu-text tracking-wide">
              SDG FOCUSED PROJECT EXPO 2026
            </h4>
            <p className="text-[11px] font-medium text-neu-muted">
              Organized by IEEE WIE KARE & IEEE CS KARE
            </p>
            <p className="text-[10px] text-neu-muted/80">
              Kalasalingam Academy of Research and Education
            </p>
          </div>
        </div>

        {/* Center: Tagline */}
        <div className="text-center md:text-right">
          <p className="text-xs font-semibold text-neu-gold tracking-wider uppercase">
            INNOVATE TODAY — IMPACT TOMORROW
          </p>
          <p className="text-[11px] text-neu-muted mt-1">
            Together, let&apos;s build a better and sustainable world.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-neu-text/10 mt-6 pt-4 text-center text-[11px] text-neu-muted">
        © 2026 Kalasalingam Academy of Research and Education. All rights reserved.
      </div>
    </footer>
  );
}
