"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ShieldAlert, 
  UserCheck, 
  CheckCircle2, 
  ArrowRight
} from "lucide-react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { getInitialTeams } from "@/lib/store";
import Footer from "@/components/layout/Footer";

export default function LoginPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Handle Google Login for Participants strictly
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);

    try {
      // 1. Firebase Google Auth popup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const email = (user.email || "").toLowerCase();

      // 2. Enforce @klu.ac.in domain restriction
      if (!email.endsWith("@klu.ac.in")) {
        setErrorMsg("Access Denied: Only institutional accounts belonging to @klu.ac.in are allowed.");
        await auth.signOut();
        setLoading(false);
        return;
      }

      // 3. Match institutional email in imported CSV team data
      const teams = getInitialTeams();
      let matchedTeam = null;
      let matchedMember = null;

      for (const team of teams) {
        const found = team.members.find((m) => m.email.toLowerCase() === email);
        if (found) {
          matchedTeam = team;
          matchedMember = found;
          break;
        }
      }

      if (!matchedTeam || !matchedMember) {
        setErrorMsg("Your KLU account is authenticated, but you are not assigned to a registered team. Please contact the event coordinators.");
        setLoading(false);
        return;
      }

      // 4. Save local session & open participant dashboard
      const sessionData = {
        role: "participant",
        userEmail: email,
        userName: matchedMember.name,
        teamId: matchedTeam.id,
        teamName: matchedTeam.teamName,
        memberInfo: matchedMember,
      };

      localStorage.setItem("sdg_user_session", JSON.stringify(sessionData));
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Google Auth error:", err);
      if (err?.code === "auth/popup-blocked" || err?.code === "auth/unauthorized-domain") {
        setErrorMsg("Google Popup was blocked by browser. Click Demo Team Login below.");
      } else {
        setErrorMsg(err.message || "Failed to authenticate with Google.");
      }
      setLoading(false);
    }
  };

  // Demo Fast Participant Login
  const handleDemoParticipantLogin = () => {
    const teams = getInitialTeams();
    if (teams.length > 0) {
      const demoTeam = teams[0];
      const demoMember = demoTeam.members[0];

      const sessionData = {
        role: "participant",
        userEmail: demoMember.email,
        userName: demoMember.name,
        teamId: demoTeam.id,
        teamName: demoTeam.teamName,
        memberInfo: demoMember,
      };

      localStorage.setItem("sdg_user_session", JSON.stringify(sessionData));
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F2EC]">
      {/* Header */}
      <header className="w-full bg-[#FAF8F4] border-b border-white/60 py-4 px-4 sm:px-8">
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
            <span className="text-xs font-extrabold text-neu-text tracking-wide">
              SDG FOCUSED PROJECT EXPO 2026
            </span>
          </div>

          <button
            onClick={() => router.push("/")}
            className="neu-btn px-4 py-2 text-xs font-semibold text-neu-muted hover:text-neu-text"
          >
            ← Back to Home
          </button>
        </div>
      </header>

      {/* Main Participant Login Box (STRICTLY NO ADMIN/VOLUNTEER/REVIEWER TABS OR BUTTONS) */}
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md neu-raised-lg p-6 sm:p-8 rounded-3xl bg-[#FAF8F4]">
          
          <div className="text-center mb-6">
            <div className="neu-badge inline-block text-neu-gold text-xs font-bold mb-2">
              STUDENT PARTICIPANT PORTAL
            </div>
            <h2 className="text-2xl font-extrabold text-neu-text">Participant Login</h2>
            <p className="text-xs text-neu-muted mt-1">
              Sign in with your registered KLU institutional email
            </p>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="neu-raised p-4 rounded-2xl bg-red-50/80 border border-red-200 text-red-700 text-xs font-medium mb-6 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Authentication Notice</p>
                <p className="mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* PARTICIPANT GOOGLE LOGIN FORM */}
          <div className="flex flex-col gap-4">
            <div className="neu-inset p-4 rounded-2xl bg-[#ECE9E1] text-xs text-neu-muted space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-neu-text">
                <CheckCircle2 className="w-4 h-4 text-neu-green" />
                Institutional Google Account Only
              </div>
              <p>Only registered student accounts ending with <strong className="text-neu-gold">@klu.ac.in</strong> are permitted to access the participant dashboard.</p>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full neu-btn neu-btn-gold py-4 px-4 text-sm font-extrabold flex items-center justify-center gap-3 shadow-md hover:scale-[1.02] transition-transform disabled:opacity-50"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z" />
              </svg>
              <span>{loading ? "Authenticating..." : "CONTINUE WITH GOOGLE"}</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
