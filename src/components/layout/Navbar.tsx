"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  LayoutDashboard, 
  QrCode, 
  FileText, 
  Presentation, 
  LogOut, 
  Menu, 
  X,
  User,
  ShieldAlert,
  SlidersHorizontal
} from "lucide-react";
import { UserRole } from "@/lib/types";

interface NavbarProps {
  role?: UserRole;
  userName?: string;
  teamId?: string;
  onLogout?: () => void;
}

export default function Navbar({ role = "participant", userName, teamId, onLogout }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Participant Navigation Links ONLY (No admin/volunteer/reviewer links)
  const participantLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/attendance", label: "Attendance", icon: QrCode },
    { href: "/problem-statement", label: "Problem Statement", icon: FileText },
    { href: "/ppt-upload", label: "PPT Upload", icon: Presentation },
  ];

  const adminLinks = [
    { href: "/admin", label: "Admin Console", icon: LayoutDashboard },
    { href: "/admin/import", label: "Import Teams CSV", icon: SlidersHorizontal },
  ];

  const links = role === "admin" ? adminLinks : participantLinks;

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("sdg_user_session");
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F4F2EC]/90 backdrop-blur-md border-b border-white/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logos & Title */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 neu-raised-sm p-1.5 rounded-xl bg-white/90 shadow-md">
              <Image src="/wie-logo.jpeg" alt="IEEE WIE" fill className="object-contain p-0.5 rounded-lg" priority />
            </div>
            <span className="text-sm font-black text-neu-gold">×</span>
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 neu-raised-sm p-1.5 rounded-xl bg-white/90 shadow-md">
              <Image src="/ieee-cs-logo.jpeg" alt="IEEE CS" fill className="object-contain p-0.5 rounded-lg" priority />
            </div>
          </div>

          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-extrabold text-neu-text tracking-tight group-hover:text-neu-gold transition-colors">
              SDG PROJECT EXPO
            </span>
            <span className="text-[10px] font-medium text-neu-muted tracking-wider">
              IEEE WIE & CS KARE
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "neu-inset text-neu-gold font-bold"
                    : "neu-btn text-neu-muted hover:text-neu-text"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-neu-gold" : "text-neu-muted"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout Button */}
        <div className="hidden md:flex items-center gap-3">
          {teamId && (
            <div className="neu-badge text-[11px] font-bold text-neu-gold border border-neu-gold/30">
              {teamId}
            </div>
          )}
          {userName && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-neu-text neu-raised-sm">
              <User className="w-3.5 h-3.5 text-neu-green" />
              <span>{userName}</span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="neu-btn px-3 py-2 text-xs font-bold text-neu-red hover:bg-red-50/50 flex items-center gap-1.5"
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-neu-red" />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          {teamId && (
            <span className="text-xs font-bold text-neu-gold neu-badge">{teamId}</span>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="neu-btn p-2 text-neu-text"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/50 bg-[#F4F2EC] px-4 pt-3 pb-6 space-y-2 neu-raised rounded-b-2xl mx-2 my-1">
          {userName && (
            <div className="px-3 py-2 text-xs font-semibold text-neu-muted border-b border-neu-text/10 flex items-center justify-between mb-2">
              <span>Logged in as: <strong className="text-neu-text">{userName}</strong></span>
              <span className="capitalize text-neu-gold font-bold">({role})</span>
            </div>
          )}

          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive ? "neu-inset text-neu-gold" : "neu-btn text-neu-text"
                }`}
              >
                <Icon className="w-5 h-5 text-neu-gold" />
                {link.label}
              </Link>
            );
          })}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="w-full mt-4 neu-btn py-3 text-sm font-bold text-neu-red flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
