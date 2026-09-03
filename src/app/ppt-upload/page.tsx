"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getInitialTeams, saveTeams } from "@/lib/store";
import { Team } from "@/lib/types";
import { 
  Presentation, 
  CheckCircle2, 
  Link as LinkIcon, 
  Save, 
  ExternalLink,
  FolderOpen,
  FileCheck,
  Share2,
  Copy,
  Info
} from "lucide-react";

export default function PptUploadPage() {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [pptUrl, setPptUrl] = useState("");
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    const rawSession = localStorage.getItem("sdg_user_session");
    if (!rawSession) {
      router.push("/login");
      return;
    }
    const sess = JSON.parse(rawSession);
    setSessionUser(sess);

    const teams = getInitialTeams();
    const currentTeam = teams.find((t) => t.id === sess.teamId) || teams[0];
    setTeam(currentTeam);
    if (currentTeam?.pptUrl) {
      setPptUrl(currentTeam.pptUrl);
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!team || !pptUrl.trim()) return;

    const teams = getInitialTeams();
    const idx = teams.findIndex((t) => t.id === team.id);
    if (idx !== -1) {
      teams[idx].pptSubmitted = true;
      teams[idx].pptUrl = pptUrl.trim();
      teams[idx].pptSubmittedAt = new Date().toISOString();
      saveTeams(teams);
      setTeam(teams[idx]);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);
    }
  };

  if (!team || !sessionUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F2EC]">
        <div className="neu-raised p-8 rounded-2xl text-center">
          <p className="text-sm font-bold text-neu-muted">Loading PPT Upload Portal...</p>
        </div>
      </div>
    );
  }

  const DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/19-55Z17VMh3KuwUnJYb426la6xjhGqgc";

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F2EC]">
      <Navbar
        role="participant"
        userName={sessionUser.userName}
        teamId={team.id}
      />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Banner */}
        <div className="neu-raised p-6 sm:p-8 rounded-3xl bg-[#FAF8F4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="neu-badge inline-flex text-neu-green text-xs font-bold mb-2">
              PRESENTATION DECK SUBMISSION
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neu-text">
              PPT SUBMISSION PORTAL
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-neu-muted mt-1">
              Team: <strong className="text-neu-gold font-extrabold">{team.id}</strong> — {team.teamName}
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="neu-raised p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-bold flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Presentation link successfully saved!</span>
          </div>
        )}

        {/* STEP-BY-STEP SUBMISSION INSTRUCTIONS */}
        <div className="neu-raised p-6 sm:p-8 rounded-3xl space-y-6 bg-[#FAF8F4] border border-white/80">
          <div className="flex items-center gap-3">
            <div className="p-3 neu-inset rounded-2xl text-neu-gold bg-[#ECE9E1]">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-neu-text">PPT Upload Guidelines & Steps</h2>
              <p className="text-xs text-neu-muted">Follow these 5 steps to upload your presentation to the official Drive</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="neu-inset p-4 rounded-2xl bg-[#ECE9E1] space-y-1.5">
              <span className="text-xs font-black text-neu-gold uppercase">STEP 1: OPEN GOOGLE DRIVE</span>
              <p className="text-xs text-neu-text font-semibold">
                Click the button below to open the official event submission Drive folder in a new tab.
              </p>
            </div>

            <div className="neu-inset p-4 rounded-2xl bg-[#ECE9E1] space-y-1.5">
              <span className="text-xs font-black text-neu-gold uppercase">STEP 2: NAME YOUR FILE</span>
              <p className="text-xs text-neu-text font-semibold">
                Name your file strictly with your Team ID & Name: <strong className="text-neu-gold">{team.id}_{team.teamName}.pptx</strong>
              </p>
            </div>

            <div className="neu-inset p-4 rounded-2xl bg-[#ECE9E1] space-y-1.5">
              <span className="text-xs font-black text-neu-gold uppercase">STEP 3: UPLOAD FILE</span>
              <p className="text-xs text-neu-text font-semibold">
                Upload your presentation PPTX or PDF file into the designated Google Drive folder.
              </p>
            </div>

            <div className="neu-inset p-4 rounded-2xl bg-[#ECE9E1] space-y-1.5">
              <span className="text-xs font-black text-neu-gold uppercase">STEP 4: SET VIEW PERMISSION & COPY LINK</span>
              <p className="text-xs text-neu-text font-semibold">
                Ensure file sharing is set to &quot;Anyone with link can view&quot;, then copy the shared URL.
              </p>
            </div>

          </div>

          {/* PROMINENT GOOGLE DRIVE BUTTON */}
          <div className="pt-2 flex flex-col items-center justify-center">
            <a
              href={DRIVE_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto neu-btn neu-btn-gold px-8 py-4 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-3 shadow-xl hover:scale-105 transition-all"
            >
              <FolderOpen className="w-5 h-5 text-neu-text" />
              <span>GO TO EVENT GOOGLE DRIVE</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* LINK SUBMISSION FORM */}
        <div className="neu-raised p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 neu-inset rounded-2xl text-neu-green bg-[#ECE9E1]">
              <Presentation className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-neu-text">STEP 5: PASTE COPIED LINK & SUBMIT</h3>
              <p className="text-xs text-neu-muted">Paste your copied Google Drive presentation share URL below.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-extrabold text-neu-gold uppercase tracking-wider mb-2">
                COPIED DRIVE PRESENTATION URL *
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={pptUrl}
                  onChange={(e) => setPptUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full neu-inset p-4 pl-11 text-sm font-semibold text-neu-text placeholder:text-neu-muted/50 focus:outline-none focus:ring-2 focus:ring-neu-gold/50"
                  required
                />
                <LinkIcon className="w-5 h-5 text-neu-muted absolute left-3.5 top-3.5" />
              </div>
            </div>

            {team.pptSubmitted && team.pptUrl && (
              <div className="neu-inset p-4 rounded-2xl bg-[#ECE9E1] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-neu-green uppercase">STATUS: SUBMITTED</span>
                  <p className="text-xs font-semibold text-neu-text truncate max-w-md">{team.pptUrl}</p>
                </div>
                <a
                  href={team.pptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neu-btn p-2.5 text-neu-gold flex items-center gap-1.5 text-xs font-bold"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Uploaded File</span>
                </a>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="neu-btn neu-btn-green px-8 py-3.5 rounded-2xl text-sm font-extrabold flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>SAVE PRESENTATION LINK</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
