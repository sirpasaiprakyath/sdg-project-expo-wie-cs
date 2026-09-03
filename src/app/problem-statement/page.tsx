"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getInitialTeams, getProblemStatements, saveProblemStatement } from "@/lib/store";
import { Team, ProblemStatement, ALLOWED_SDGS, TECH_STACK_OPTIONS } from "@/lib/types";
import { 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  HeartPulse, 
  GraduationCap, 
  Lightbulb, 
  Building2, 
  Leaf,
  PlusCircle,
  Save,
  Check,
  AlertCircle
} from "lucide-react";

export default function ProblemStatementForm() {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [team, setTeam] = useState<Team | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [selectedSdgs, setSelectedSdgs] = useState<string[]>([]);
  const [problemDescription, setProblemDescription] = useState("");
  const [proposedSolution, setProposedSolution] = useState("");
  const [keyInnovation, setKeyInnovation] = useState("");
  const [expectedImpact, setExpectedImpact] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [otherTech, setOtherTech] = useState("");

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

    if (currentTeam) {
      const psMap = getProblemStatements();
      const existing = psMap[currentTeam.id];
      if (existing) {
        setTitle(existing.title || "");
        setSelectedSdgs(existing.sdgs || []);
        setProblemDescription(existing.problemDescription || "");
        setProposedSolution(existing.proposedSolution || "");
        setKeyInnovation(existing.keyInnovation || "");
        setExpectedImpact(existing.expectedImpact || "");
        setTechStack(existing.techStack || []);
        setOtherTech(existing.otherTech || "");
      }
    }
  }, [router]);

  // Toggle SDG Goal selection (Max 5, strictly from allowed list)
  const toggleSdg = (sdgKey: string) => {
    if (selectedSdgs.includes(sdgKey)) {
      setSelectedSdgs(selectedSdgs.filter((s) => s !== sdgKey));
    } else {
      setSelectedSdgs([...selectedSdgs, sdgKey]);
    }
  };

  // Toggle Technology option
  const toggleTech = (tech: string) => {
    if (techStack.includes(tech)) {
      const updated = techStack.filter((t) => t !== tech);
      setTechStack(updated);
      if (tech === "Other") {
        setOtherTech(""); // Clear other value when deselected
      }
    } else {
      setTechStack([...techStack, tech]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSavedSuccess(false);

    // Validation
    if (!title.trim()) {
      setErrorMessage("Please enter a Problem Statement Title.");
      return;
    }
    if (selectedSdgs.length === 0) {
      setErrorMessage("Please select at least one SDG Goal.");
      return;
    }
    if (!problemDescription.trim()) {
      setErrorMessage("Please describe the Problem.");
      return;
    }
    if (!proposedSolution.trim()) {
      setErrorMessage("Please describe your Proposed Solution.");
      return;
    }
    if (!keyInnovation.trim()) {
      setErrorMessage("Please specify the Key Innovation.");
      return;
    }
    if (!expectedImpact.trim()) {
      setErrorMessage("Please describe the Expected Impact.");
      return;
    }
    if (techStack.length === 0) {
      setErrorMessage("Please select at least one Technology Stack option.");
      return;
    }
    if (techStack.includes("Other") && !otherTech.trim()) {
      setErrorMessage("Other Technology field is required when 'Other' is selected.");
      return;
    }

    if (!team) return;

    const updatedPS: ProblemStatement = {
      teamId: team.id,
      teamName: team.teamName,
      title: title.trim(),
      sdgs: selectedSdgs,
      problemDescription: problemDescription.trim(),
      proposedSolution: proposedSolution.trim(),
      keyInnovation: keyInnovation.trim(),
      expectedImpact: expectedImpact.trim(),
      techStack,
      otherTech: techStack.includes("Other") ? otherTech.trim() : null,
      updatedAt: new Date().toISOString(),
    };

    saveProblemStatement(updatedPS);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  if (!team || !sessionUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F2EC]">
        <div className="neu-raised p-8 rounded-2xl text-center">
          <p className="text-sm font-bold text-neu-muted">Loading Problem Statement Form...</p>
        </div>
      </div>
    );
  }

  const isOtherSelected = techStack.includes("Other");

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F2EC]">
      <Navbar
        role="participant"
        userName={sessionUser.userName}
        teamId={team.id}
      />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner Header */}
        <div className="neu-raised p-6 rounded-3xl bg-[#FAF8F4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="neu-badge inline-flex text-neu-gold text-xs font-bold mb-2">
              SUBMISSION PORTAL
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neu-text">
              PROBLEM STATEMENT
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-neu-muted mt-1">
              Team <strong className="text-neu-text">{team.id}</strong> — {team.teamName}
            </p>
          </div>

          <div className="neu-badge text-neu-green font-bold text-xs">
            Official 5 SDG Standard
          </div>
        </div>

        {/* Notifications */}
        {savedSuccess && (
          <div className="neu-raised p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-bold flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Problem Statement successfully submitted and saved!</span>
          </div>
        )}

        {errorMessage && (
          <div className="neu-raised p-4 rounded-2xl bg-red-50 border border-red-300 text-red-800 text-sm font-bold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 1. Problem Statement Title */}
          <div className="neu-raised p-6 rounded-3xl space-y-3">
            <label className="block text-xs font-extrabold text-neu-gold uppercase tracking-wider">
              1. PROBLEM STATEMENT TITLE *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your project title..."
              className="w-full neu-inset p-4 text-base font-bold text-neu-text placeholder:text-neu-muted/50 focus:outline-none focus:ring-2 focus:ring-neu-gold/50"
              required
            />
          </div>

          {/* 2. SDG Goals Selection (STRICTLY ONLY THE FIVE ALLOWED SDGs) */}
          <div className="neu-raised p-6 rounded-3xl space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-neu-gold uppercase tracking-wider mb-1">
                2. SUSTAINABLE DEVELOPMENT GOALS (SDGS) *
              </label>
              <p className="text-xs text-neu-muted font-medium">
                Select one or more from the five designated Sustainable Development Goals:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ALLOWED_SDGS.map((sdg) => {
                const isSelected = selectedSdgs.includes(sdg.key);
                let IconComp = Lightbulb;
                if (sdg.key === "SDG_3") IconComp = HeartPulse;
                if (sdg.key === "SDG_4") IconComp = GraduationCap;
                if (sdg.key === "SDG_9") IconComp = Lightbulb;
                if (sdg.key === "SDG_11") IconComp = Building2;
                if (sdg.key === "SDG_13") IconComp = Leaf;

                return (
                  <div
                    key={sdg.key}
                    onClick={() => toggleSdg(sdg.key)}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 select-none ${
                      isSelected
                        ? "neu-inset border-neu-gold bg-amber-50/40"
                        : "neu-raised border-transparent hover:border-neu-gold/30"
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl text-white font-extrabold shrink-0 flex items-center justify-center ${
                        isSelected ? "shadow-inner" : ""
                      }`}
                      style={{ backgroundColor: sdg.color }}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-neu-text">{sdg.title}</span>
                        {isSelected && <Check className="w-4 h-4 text-neu-gold font-bold" />}
                      </div>
                      <p className="text-[11px] text-neu-muted mt-1 leading-tight">{sdg.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Problem Description */}
          <div className="neu-raised p-6 rounded-3xl space-y-3">
            <label className="block text-xs font-extrabold text-neu-gold uppercase tracking-wider">
              3. PROBLEM DESCRIPTION *
            </label>
            <textarea
              rows={4}
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder="Describe the problem your project aims to solve..."
              className="w-full neu-inset p-4 text-sm font-medium text-neu-text placeholder:text-neu-muted/50 focus:outline-none focus:ring-2 focus:ring-neu-gold/50"
              required
            />
          </div>

          {/* 4. Proposed Solution */}
          <div className="neu-raised p-6 rounded-3xl space-y-3">
            <label className="block text-xs font-extrabold text-neu-gold uppercase tracking-wider">
              4. PROPOSED SOLUTION *
            </label>
            <textarea
              rows={4}
              value={proposedSolution}
              onChange={(e) => setProposedSolution(e.target.value)}
              placeholder="Describe your proposed approach..."
              className="w-full neu-inset p-4 text-sm font-medium text-neu-text placeholder:text-neu-muted/50 focus:outline-none focus:ring-2 focus:ring-neu-gold/50"
              required
            />
          </div>

          {/* 5. Key Innovation */}
          <div className="neu-raised p-6 rounded-3xl space-y-3">
            <label className="block text-xs font-extrabold text-neu-gold uppercase tracking-wider">
              5. KEY INNOVATION *
            </label>
            <textarea
              rows={3}
              value={keyInnovation}
              onChange={(e) => setKeyInnovation(e.target.value)}
              placeholder="What makes your solution innovative?"
              className="w-full neu-inset p-4 text-sm font-medium text-neu-text placeholder:text-neu-muted/50 focus:outline-none focus:ring-2 focus:ring-neu-gold/50"
              required
            />
          </div>

          {/* 6. Expected Impact */}
          <div className="neu-raised p-6 rounded-3xl space-y-3">
            <label className="block text-xs font-extrabold text-neu-gold uppercase tracking-wider">
              6. EXPECTED IMPACT *
            </label>
            <textarea
              rows={3}
              value={expectedImpact}
              onChange={(e) => setExpectedImpact(e.target.value)}
              placeholder="Describe the expected social, environmental or practical impact of your project..."
              className="w-full neu-inset p-4 text-sm font-medium text-neu-text placeholder:text-neu-muted/50 focus:outline-none focus:ring-2 focus:ring-neu-gold/50"
              required
            />
          </div>

          {/* 7. Technology Stack Selection */}
          <div className="neu-raised p-6 rounded-3xl space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-neu-gold uppercase tracking-wider mb-1">
                7. TECHNOLOGY STACK *
              </label>
              <p className="text-xs text-neu-muted font-medium">
                Select all technologies used in your implementation:
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {TECH_STACK_OPTIONS.map((tech) => {
                const isSelected = techStack.includes(tech);
                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => toggleTech(tech)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between border ${
                      isSelected
                        ? "neu-inset text-neu-gold border-neu-gold/60 bg-amber-50/50"
                        : "neu-btn text-neu-text border-transparent"
                    }`}
                  >
                    <span>{tech}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-neu-gold" />}
                  </button>
                );
              })}
            </div>

            {/* 8. OTHER TECHNOLOGY INPUT (ONLY DISPLAYED IF 'OTHER' IS CHECKED) */}
            {isOtherSelected && (
              <div className="pt-4 border-t border-neu-text/10 space-y-2">
                <label className="block text-xs font-extrabold text-neu-gold uppercase tracking-wider">
                  OTHER TECHNOLOGY *
                </label>
                <input
                  type="text"
                  value={otherTech}
                  onChange={(e) => setOtherTech(e.target.value)}
                  placeholder="Enter your technology"
                  className="w-full neu-inset p-3.5 text-sm font-bold text-neu-text placeholder:text-neu-muted/50 focus:outline-none focus:ring-2 focus:ring-neu-gold/50"
                  required={isOtherSelected}
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="neu-btn neu-btn-gold px-8 py-4 rounded-2xl text-base font-extrabold flex items-center gap-3 shadow-lg"
            >
              <Save className="w-5 h-5" />
              <span>SUBMIT PROBLEM STATEMENT</span>
            </button>
          </div>

        </form>

      </main>

      <Footer />
    </div>
  );
}
