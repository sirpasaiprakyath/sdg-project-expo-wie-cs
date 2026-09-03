"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getInitialTeams, getProblemStatements, getReviewRounds, getEvaluations, saveEvaluation } from "@/lib/store";
import { Team, ProblemStatement, ReviewRound, ReviewerEvaluation, ALLOWED_SDGS } from "@/lib/types";
import { 
  FileText, 
  Presentation, 
  ExternalLink, 
  Search, 
  Layers, 
  Users, 
  CheckCircle2, 
  Clock, 
  Code,
  Sparkles,
  HeartPulse,
  GraduationCap,
  Lightbulb,
  Building2,
  Leaf,
  Star,
  Award,
  AlertTriangle,
  Save
} from "lucide-react";

export default function ReviewerWorkspace() {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [problemStatements, setProblemStatements] = useState<Record<string, ProblemStatement>>({});
  const [rounds, setRounds] = useState<ReviewRound[]>([]);
  const [evaluations, setEvaluations] = useState<ReviewerEvaluation[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Evaluation states
  const [marksInput, setMarksInput] = useState<string>("");
  const [feedbackComments, setFeedbackComments] = useState<string>("");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const [reviewerAuth, setReviewerAuth] = useState<boolean>(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeErr, setPasscodeErr] = useState<string | null>(null);

  useEffect(() => {
    const rawSession = localStorage.getItem("sdg_user_session");
    if (rawSession) {
      const sess = JSON.parse(rawSession);
      if (sess.role === "reviewer" || sess.role === "admin") {
        setSessionUser(sess);
        setReviewerAuth(true);
      }
    }

    const loadedTeams = getInitialTeams();
    setTeams(loadedTeams);
    setProblemStatements(getProblemStatements());
    setRounds(getReviewRounds());
    setEvaluations(getEvaluations());

    if (loadedTeams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(loadedTeams[0].id);
    }
  }, [selectedTeamId]);

  const activeRound = rounds.find((r) => r.isActive) || null;

  // Sync existing evaluation for active round when team changes
  useEffect(() => {
    if (selectedTeamId && activeRound) {
      const existing = evaluations.find(
        (e) => e.teamId === selectedTeamId && e.roundId === activeRound.id
      );
      if (existing) {
        setMarksInput(String(existing.marks));
        setFeedbackComments(existing.comments || "");
      } else {
        setMarksInput("");
        setFeedbackComments("");
      }
    }
  }, [selectedTeamId, activeRound, evaluations]);

  const handleSaveMarks = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId || !activeRound || !sessionUser) return;

    const val = Number(marksInput);
    if (isNaN(val) || val < 0 || val > 100) {
      alert("Please enter valid marks between 0 and 100.");
      return;
    }

    const currentTeam = teams.find((t) => t.id === selectedTeamId);
    if (!currentTeam) return;

    const newEval: ReviewerEvaluation = {
      id: `eval_${activeRound.id}_${currentTeam.id}_${sessionUser.userEmail}`,
      roundId: activeRound.id,
      roundName: activeRound.name,
      roundNumber: activeRound.roundNumber,
      teamId: currentTeam.id,
      teamName: currentTeam.teamName,
      reviewerId: sessionUser.userEmail,
      reviewerName: sessionUser.userName,
      marks: val,
      comments: feedbackComments.trim(),
      updatedAt: new Date().toISOString(),
    };

    saveEvaluation(newEval);
    const updatedEvals = getEvaluations();
    setEvaluations(updatedEvals);
    setSaveSuccessMsg(`✓ ${activeRound.name} Marks (${val}/100) Saved for Team ${currentTeam.id}!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleReviewerAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "221210") {
      const sessionData = {
        role: "reviewer",
        userEmail: "reviewer@klu.ac.in",
        userName: "Faculty Reviewer",
      };
      localStorage.setItem("sdg_user_session", JSON.stringify(sessionData));
      setSessionUser(sessionData);
      setReviewerAuth(true);
      setPasscodeErr(null);
    } else {
      setPasscodeErr("Invalid Reviewer Passcode.");
    }
  };

  const filteredTeams = teams.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.id.toLowerCase().includes(q) ||
      t.teamName.toLowerCase().includes(q) ||
      t.members.some((m) => m.name.toLowerCase().includes(q) || m.regNo.toLowerCase().includes(q))
    );
  });

  const currentTeam = teams.find((t) => t.id === selectedTeamId);
  const currentPS = currentTeam ? problemStatements[currentTeam.id] : null;

  if (!reviewerAuth) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F4F2EC]">
        <header className="w-full bg-[#FAF8F4] border-b border-white/60 py-4 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="text-xs font-extrabold text-neu-text tracking-wide">
              FACULTY REVIEWER WORKSPACE — DIRECT ACCESS
            </span>
            <button onClick={() => router.push("/")} className="neu-btn px-4 py-2 text-xs font-semibold text-neu-muted hover:text-neu-text">
              ← Home
            </button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 py-12">
          <div className="w-full max-w-md neu-raised-lg p-6 sm:p-8 rounded-3xl bg-[#FAF8F4]">
            <div className="text-center mb-6">
              <div className="neu-badge inline-block text-neu-gold text-xs font-bold mb-2">
                REVIEWER AUTHENTICATION
              </div>
              <h2 className="text-2xl font-extrabold text-neu-text">Faculty Reviewer Login</h2>
              <p className="text-xs text-neu-muted mt-1">
                Enter reviewer passcode to access team problem statements & PPT decks
              </p>
            </div>

            {passcodeErr && (
              <div className="neu-raised p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-bold mb-4">
                {passcodeErr}
              </div>
            )}

            <form onSubmit={handleReviewerAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neu-muted uppercase mb-2">
                  Reviewer Passcode
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter Reviewer Security Passcode"
                  className="w-full neu-inset p-3.5 text-sm text-neu-text focus:outline-none focus:ring-2 focus:ring-neu-gold/50"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full neu-btn neu-btn-gold py-3.5 text-sm font-extrabold flex items-center justify-center gap-2 shadow-md"
              >
                <span>Unlock Reviewer Workspace</span>
              </button>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F2EC]">
      <Navbar role="reviewer" userName={sessionUser?.userName || "Faculty Reviewer"} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Active Round Status Banner */}
        {activeRound ? (
          <div className="neu-raised p-5 rounded-2xl bg-amber-50/80 border border-neu-gold/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 neu-inset rounded-xl text-neu-gold bg-white">
                <Star className="w-6 h-6 fill-neu-gold" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-neu-gold uppercase tracking-widest block">
                  ● ACTIVE EVALUATION ROUND
                </span>
                <h3 className="text-base font-extrabold text-neu-text">{activeRound.name}</h3>
              </div>
            </div>
            <span className="neu-badge text-emerald-800 bg-emerald-100 font-extrabold text-xs px-3 py-1.5">
              READY FOR MARKS ENTRY
            </span>
          </div>
        ) : (
          <div className="neu-raised p-6 rounded-2xl bg-amber-50/80 border border-amber-300 flex items-center gap-4 text-amber-900">
            <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-sm font-extrabold">NO ACTIVE REVIEW ROUND</h4>
              <p className="text-xs font-medium text-amber-700 mt-0.5">
                The event administrator has not opened a review round yet. Marks evaluation will unlock as soon as Admin activates a round.
              </p>
            </div>
          </div>
        )}

        {saveSuccessMsg && (
          <div className="neu-raised p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-bold flex items-center gap-3 animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Directory Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Team Directory List */}
          <div className="neu-raised p-6 rounded-3xl space-y-4 bg-[#FAF8F4]">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-neu-text uppercase tracking-wider">Select Team ({filteredTeams.length})</h2>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-neu-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Team ID, Name, Reg No..."
                className="w-full neu-inset pl-10 pr-4 py-2.5 text-xs font-semibold text-neu-text placeholder:text-neu-muted/50 focus:outline-none focus:ring-2 focus:ring-neu-gold/40 rounded-xl"
              />
            </div>

            <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {filteredTeams.map((t) => {
                const ps = problemStatements[t.id];
                const isSelected = t.id === selectedTeamId;
                const roundEval = activeRound
                  ? evaluations.find((e) => e.teamId === t.id && e.roundId === activeRound.id)
                  : null;

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTeamId(t.id)}
                    className={`cursor-pointer p-4 rounded-2xl transition-all flex items-center justify-between gap-3 ${
                      isSelected ? "neu-inset border-2 border-neu-gold bg-amber-50/50" : "neu-raised-sm hover:scale-[1.01]"
                    }`}
                  >
                    <div>
                      <span className="neu-badge text-neu-gold font-black text-[10px]">{t.id}</span>
                      <h4 className="text-xs font-bold text-neu-text mt-1 truncate max-w-[150px]">{t.teamName}</h4>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {roundEval ? (
                        <span className="neu-badge text-emerald-800 bg-emerald-100 text-[10px] font-black">
                          {activeRound?.name} Done ({roundEval.marks}/100)
                        </span>
                      ) : activeRound ? (
                        <span className="neu-badge text-amber-800 bg-amber-100 text-[10px] font-bold">
                          {activeRound.name} Pending
                        </span>
                      ) : null}

                      <div className="flex items-center gap-1">
                        {(ps || t.problemStatementSubmitted) && (
                          <span className="text-[9px] font-extrabold text-emerald-700">PS ✓</span>
                        )}
                        {t.pptSubmitted && (
                          <span className="text-[9px] font-extrabold text-neu-gold">PPT ✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Team Problem Statement & PPT View */}
          {currentTeam ? (
            <div className="lg:col-span-2 space-y-6">
              
              {/* Marks Entry Form for Active Round */}
              {activeRound ? (
                <form onSubmit={handleSaveMarks} className="neu-raised p-6 sm:p-8 rounded-3xl space-y-5 bg-[#FAF8F4] border-2 border-neu-gold/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-neu-gold uppercase tracking-widest block">
                        ● EVALUATION MARKS FOR {activeRound.name.toUpperCase()}
                      </span>
                      <h3 className="text-lg font-black text-neu-text">Enter Team Marks (0 - 100)</h3>
                    </div>
                    <span className="neu-badge text-neu-gold font-black text-xs px-3.5 py-1.5 bg-white shadow-sm">
                      MAX 100 PTS
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-neu-muted uppercase">
                      Enter Marks out of 100 *
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={marksInput}
                      onChange={(e) => setMarksInput(e.target.value)}
                      placeholder="e.g. 85"
                      className="w-full neu-inset p-4 text-xl font-black text-neu-text placeholder:text-neu-muted/40 focus:outline-none focus:ring-2 focus:ring-neu-gold/50 rounded-2xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-neu-muted uppercase">
                      Reviewer Feedback / Remarks (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={feedbackComments}
                      onChange={(e) => setFeedbackComments(e.target.value)}
                      placeholder="Enter constructive evaluation feedback..."
                      className="w-full neu-inset p-3.5 text-xs font-semibold text-neu-text focus:outline-none focus:ring-2 focus:ring-neu-gold/50 rounded-2xl"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full neu-btn neu-btn-gold py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-md"
                  >
                    <Save className="w-5 h-5" />
                    <span>SUBMIT {activeRound.name.toUpperCase()} MARKS</span>
                  </button>
                </form>
              ) : (
                <div className="neu-raised p-6 rounded-3xl bg-amber-50/70 border border-amber-300 text-amber-900 text-xs font-bold text-center">
                  Notice: No review round is currently active. Admin must open a round before marks can be entered.
                </div>
              )}

              {/* Problem Details */}
              <div className="neu-raised p-6 sm:p-8 rounded-3xl space-y-6 bg-[#FAF8F4]">
                
                {/* Team Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neu-text/10 pb-5">
                  <div>
                    <span className="neu-badge text-neu-gold font-extrabold text-xs">{currentTeam.id}</span>
                    <h2 className="text-2xl font-extrabold text-neu-text mt-1">{currentTeam.teamName}</h2>
                    <p className="text-xs text-neu-muted mt-1 font-semibold">
                      Registered Team Members: {currentTeam.members.map(m => `${m.name} (${m.regNo})`).join(", ")}
                    </p>
                  </div>

                  {/* Direct PPT Action Button */}
                  {currentTeam.pptUrl ? (
                    <a
                      href={currentTeam.pptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="neu-btn neu-btn-gold px-5 py-3 text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shrink-0 rounded-2xl"
                    >
                      <Presentation className="w-4 h-4" />
                      <span>VIEW PPT DECK</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </a>
                  ) : (
                    <span className="neu-badge text-amber-800 bg-amber-100/80 font-extrabold text-xs px-3 py-2 shrink-0">
                      PPT Deck Pending
                    </span>
                  )}
                </div>

                {/* Problem Statement Content */}
                {currentPS ? (
                  <div className="space-y-6">
                    
                    {/* Project Title */}
                    <div>
                      <span className="text-[10px] font-extrabold text-neu-gold uppercase tracking-widest block mb-1">
                        PROJECT TITLE
                      </span>
                      <h3 className="text-lg font-extrabold text-neu-text">{currentPS.title}</h3>
                    </div>

                    {/* Target SDGs Badges */}
                    <div>
                      <span className="text-[10px] font-extrabold text-neu-gold uppercase tracking-widest block mb-2">
                        TARGET SUSTAINABLE DEVELOPMENT GOALS (SDGs)
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {currentPS.sdgs.map((sdgKey) => {
                          const goal = ALLOWED_SDGS.find(g => g.key === sdgKey);
                          return (
                            <span
                              key={sdgKey}
                              style={{ backgroundColor: goal?.color || "#4C9F38" }}
                              className="px-3 py-1.5 rounded-xl text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{goal ? goal.title : sdgKey.replace("_", " ")}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Problem Description */}
                    <div>
                      <span className="text-[10px] font-extrabold text-neu-gold uppercase tracking-widest block mb-1">
                        1. PROBLEM DESCRIPTION & CHALLENGE
                      </span>
                      <div className="neu-inset p-4 rounded-2xl bg-[#ECE9E1] text-xs font-semibold text-neu-text leading-relaxed">
                        {currentPS.problemDescription}
                      </div>
                    </div>

                    {/* Proposed Solution */}
                    <div>
                      <span className="text-[10px] font-extrabold text-neu-gold uppercase tracking-widest block mb-1">
                        2. PROPOSED SOLUTION & METHODOLOGY
                      </span>
                      <div className="neu-inset p-4 rounded-2xl bg-[#ECE9E1] text-xs font-semibold text-neu-text leading-relaxed">
                        {currentPS.proposedSolution}
                      </div>
                    </div>

                    {/* Key Innovation & Target Impact Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-extrabold text-neu-gold uppercase tracking-widest block mb-1">
                          3. KEY INNOVATION & NOVELTY
                        </span>
                        <div className="neu-inset p-4 rounded-2xl bg-[#ECE9E1] text-xs font-semibold text-neu-text leading-relaxed min-h-[100px]">
                          {currentPS.keyInnovation}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-extrabold text-neu-gold uppercase tracking-widest block mb-1">
                          4. EXPECTED TARGET IMPACT
                        </span>
                        <div className="neu-inset p-4 rounded-2xl bg-[#ECE9E1] text-xs font-semibold text-neu-text leading-relaxed min-h-[100px]">
                          {currentPS.expectedImpact}
                        </div>
                      </div>
                    </div>

                    {/* Tech Stack Tags */}
                    <div>
                      <span className="text-[10px] font-extrabold text-neu-gold uppercase tracking-widest block mb-2">
                        TECHNOLOGY STACK
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {currentPS.techStack.map((tech) => (
                          <span key={tech} className="neu-badge text-neu-text bg-[#ECE9E1] text-xs font-bold flex items-center gap-1">
                            <Code className="w-3 h-3 text-neu-gold" />
                            <span>{tech}</span>
                          </span>
                        ))}
                        {currentPS.otherTech && (
                          <span className="neu-badge text-neu-text bg-[#ECE9E1] text-xs font-bold">
                            + {currentPS.otherTech}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Primary Presentation Deck Card */}
                    <div className="neu-inset p-6 rounded-3xl bg-[#ECE9E1] flex flex-col sm:flex-row items-center justify-between gap-4 border border-neu-gold/30">
                      <div>
                        <h4 className="text-sm font-extrabold text-neu-text">Team Presentation Deck</h4>
                        <p className="text-xs text-neu-muted mt-0.5">Direct Google Drive presentation uploaded by {currentTeam.id}</p>
                      </div>

                      {currentTeam.pptUrl ? (
                        <a
                          href={currentTeam.pptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="neu-btn neu-btn-gold px-6 py-3 text-xs font-black flex items-center gap-2 shadow-md shrink-0 rounded-2xl"
                        >
                          <Presentation className="w-4 h-4" />
                          <span>OPEN PRESENTATION DECK</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-xs font-bold text-amber-800 bg-amber-100 px-4 py-2 rounded-xl">
                          No PPT uploaded yet
                        </span>
                      )}
                    </div>

                  </div>
                ) : (
                  <div className="neu-inset p-10 text-center rounded-2xl text-xs font-extrabold text-neu-muted space-y-2">
                    <FileText className="w-10 h-10 text-neu-muted mx-auto opacity-50" />
                    <p>Problem Statement has not been submitted by {currentTeam.teamName} ({currentTeam.id}) yet.</p>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 neu-raised p-12 rounded-3xl text-center text-xs font-bold text-neu-muted bg-[#FAF8F4]">
              Select a team from the left directory to view their problem statement and presentation deck.
            </div>
          )}

        </div>

      </main>

      <Footer />
    </div>
  );
}
