"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TeamQRModal from "@/components/qr/TeamQRModal";
import { getInitialTeams, getProblemStatements, getAttendanceRecords, getSessions, getReviewRounds, getEvaluations, subscribeSessions, subscribeAttendanceRecords } from "@/lib/store";
import { Team, TeamMember, ProblemStatement, AttendanceRecord, ReviewRound, ReviewerEvaluation, AttendanceSession } from "@/lib/types";
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  Presentation, 
  QrCode, 
  Users, 
  Award,
  Sparkles,
  ArrowRight,
  Star
} from "lucide-react";
import Link from "next/link";

export default function ParticipantDashboard() {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [problemStatement, setProblemStatement] = useState<ProblemStatement | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [rounds, setRounds] = useState<ReviewRound[]>([]);
  const [evaluations, setEvaluations] = useState<ReviewerEvaluation[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);

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
    setRounds(getReviewRounds());
    setEvaluations(getEvaluations());

    if (currentTeam) {
      const psMap = getProblemStatements();
      if (psMap[currentTeam.id]) {
        setProblemStatement(psMap[currentTeam.id]);
      }
    }

    const unsubSessions = subscribeSessions((activeSessions) => {
      setSessions(activeSessions);
    });

    const unsubRecords = subscribeAttendanceRecords((allAttendance) => {
      if (currentTeam) {
        setAttendanceRecords(allAttendance.filter((r) => r.teamId === currentTeam.id));
      }
    });

    return () => {
      unsubSessions();
      unsubRecords();
    };
  }, [router]);

  if (!team || !sessionUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F2EC]">
        <div className="neu-raised p-8 rounded-2xl text-center">
          <p className="text-sm font-bold text-neu-muted">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const isProblemSubmitted = !!problemStatement || team.problemStatementSubmitted;
  const isPptSubmitted = team.pptSubmitted;

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F2EC]">
      <Navbar
        role="participant"
        userName={sessionUser.userName}
        teamId={team.id}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Header Banner */}
        <div className="neu-raised p-6 sm:p-8 rounded-3xl bg-[#FAF8F4] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="neu-badge inline-flex text-neu-gold text-xs font-bold mb-2">
              PARTICIPANT WORKSPACE
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neu-text">
              Welcome, <span className="text-neu-gold">Team {team.teamName}</span>
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-neu-muted mt-1">
              Team: <strong className="text-neu-text font-extrabold">{team.id}</strong> — {team.teamName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/problem-statement"
              className="neu-btn neu-btn-gold px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>{isProblemSubmitted ? "Edit Problem Statement" : "Submit Problem Statement"}</span>
            </Link>
            <Link
              href="/ppt-upload"
              className="neu-btn neu-btn-green px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <Presentation className="w-4 h-4" />
              <span>{isPptSubmitted ? "View PPT Link" : "Upload PPT"}</span>
            </Link>
          </div>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Team Members & Event Progress */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Event Progress Tracker */}
            <div className="neu-raised p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-neu-gold" />
                  <h2 className="text-base font-extrabold text-neu-text">EVENT PROGRESS TRACKER</h2>
                </div>
                <span className="text-xs font-semibold text-neu-muted">Realtime Status</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Step 1: Registration */}
                <div className="neu-inset p-4 rounded-2xl bg-[#ECE9E1] flex items-center gap-3">
                  <div className="neu-raised p-2.5 rounded-xl text-neu-green bg-white">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-neu-muted uppercase">STEP 1</span>
                    <h4 className="text-xs font-extrabold text-neu-text">TEAM REGISTERED</h4>
                    <span className="text-[10px] text-neu-green font-bold">COMPLETED</span>
                  </div>
                </div>

                {/* Step 2: Problem Statement */}
                <div className="neu-inset p-4 rounded-2xl bg-[#ECE9E1] flex items-center gap-3">
                  <div className={`neu-raised p-2.5 rounded-xl bg-white ${isProblemSubmitted ? "text-neu-green" : "text-neu-gold"}`}>
                    {isProblemSubmitted ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-neu-muted uppercase">STEP 2</span>
                    <h4 className="text-xs font-extrabold text-neu-text">PROBLEM STATEMENT</h4>
                    <span className={`text-[10px] font-bold ${isProblemSubmitted ? "text-neu-green" : "text-amber-600"}`}>
                      {isProblemSubmitted ? "SUBMITTED" : "PENDING"}
                    </span>
                  </div>
                </div>

                {/* Step 3: PPT Upload */}
                <div className="neu-inset p-4 rounded-2xl bg-[#ECE9E1] flex items-center gap-3">
                  <div className={`neu-raised p-2.5 rounded-xl bg-white ${isPptSubmitted ? "text-neu-green" : "text-neu-gold"}`}>
                    {isPptSubmitted ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-neu-muted uppercase">STEP 3</span>
                    <h4 className="text-xs font-extrabold text-neu-text">PPT SUBMISSION</h4>
                    <span className={`text-[10px] font-bold ${isPptSubmitted ? "text-neu-green" : "text-amber-600"}`}>
                      {isPptSubmitted ? "SUBMITTED" : "PENDING"}
                    </span>
                  </div>
                </div>

                {/* Step 4: Review Round Evaluation Status (Strictly NO marks shown) */}
                {rounds.map((r) => {
                  const teamEval = evaluations.find((e) => e.teamId === team.id && e.roundId === r.id);
                  const isCompleted = !!teamEval;

                  return (
                    <div key={r.id} className="neu-inset p-4 rounded-2xl bg-[#ECE9E1] flex items-center gap-3">
                      <div className={`neu-raised p-2.5 rounded-xl bg-white ${isCompleted ? "text-neu-green" : "text-neu-gold"}`}>
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-neu-muted uppercase">{r.name.toUpperCase()}</span>
                        <h4 className="text-xs font-extrabold text-neu-text">EVALUATION</h4>
                        <span className={`text-[10px] font-bold ${isCompleted ? "text-neu-green" : "text-amber-600"}`}>
                          {isCompleted ? `${r.name} Completed ✓` : `${r.name} Pending`}
                        </span>
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>

            {/* Realtime Attendance Status Card */}
            <div className="neu-raised p-6 rounded-3xl bg-[#FAF8F4] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 neu-inset rounded-xl text-neu-green bg-[#ECE9E1]">
                    <QrCode className="w-5 h-5 text-neu-green" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-neu-text">LIVE ATTENDANCE STATUS</h2>
                    <p className="text-xs text-neu-muted">Realtime member attendance records scanned by volunteers</p>
                  </div>
                </div>
                <Link href="/attendance" className="neu-btn px-3 py-1.5 text-xs font-extrabold text-neu-green hover:text-neu-text">
                  View Full Logs →
                </Link>
              </div>

              {sessions.length === 0 ? (
                <div className="neu-inset p-4 rounded-2xl bg-[#ECE9E1] text-center text-xs text-neu-muted font-bold">
                  No attendance sessions created yet by admin.
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((sess) => {
                    const memberRecords = attendanceRecords.filter((r) => r.sessionId === sess.id);
                    const presentCount = memberRecords.filter((r) => r.status === "PRESENT").length;

                    return (
                      <div key={sess.id} className="neu-inset p-4 rounded-2xl bg-[#ECE9E1] space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-neu-text/10">
                          <div>
                            <span className="text-[10px] font-extrabold text-neu-gold uppercase tracking-wider block">
                              {sess.isActive ? "● ACTIVE SESSION" : "CLOSED SESSION"}
                            </span>
                            <h4 className="text-sm font-extrabold text-neu-text">{sess.name}</h4>
                          </div>

                          <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                            presentCount > 0 ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-amber-100 text-amber-800 border-amber-300"
                          }`}>
                            {presentCount} / {team.members.length} Present
                          </span>
                        </div>

                        {/* Member Badges */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {team.members.map((mem) => {
                            const rec = memberRecords.find((r) => r.memberRegNo === mem.regNo);
                            const isPresent = rec?.status === "PRESENT";
                            const isAbsent = rec?.status === "ABSENT";

                            return (
                              <div key={mem.regNo} className="neu-raised-sm p-2.5 rounded-xl bg-white/90 flex items-center justify-between">
                                <span className="text-xs font-bold text-neu-text">{mem.name} ({mem.regNo})</span>
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                  isPresent ? "bg-emerald-100 text-emerald-700" : isAbsent ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                                }`}>
                                  {isPresent ? "PRESENT ✓" : isAbsent ? "ABSENT ✗" : "NOT MARKED"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Team Members List */}
            <div className="neu-raised p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-neu-gold" />
                  <h2 className="text-base font-extrabold text-neu-text">TEAM MEMBERS ({team.members.length})</h2>
                </div>
                <span className="neu-badge text-neu-gold font-bold">{team.id}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {team.members.map((member: TeamMember, idx: number) => {
                  const isCurrent = member.email.toLowerCase() === sessionUser.userEmail.toLowerCase();

                  return (
                    <div
                      key={idx}
                      className={`neu-raised-sm p-4 rounded-2xl flex flex-col justify-between transition-all ${
                        isCurrent ? "border-2 border-neu-gold bg-amber-50/20" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-extrabold text-neu-text flex items-center gap-1.5">
                            {member.name}
                            {isCurrent && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neu-gold text-white">
                                YOU
                              </span>
                            )}
                          </h4>
                          <p className="text-xs font-semibold text-neu-gold mt-0.5">{member.regNo}</p>
                        </div>
                        <span className="text-[10px] font-bold text-neu-muted uppercase neu-badge">
                          {member.year}
                        </span>
                      </div>

                      <div className="mt-4 pt-3 border-t border-neu-text/10 space-y-1">
                        <p className="text-xs text-neu-muted font-medium">
                          Dept: <span className="text-neu-text font-semibold">{member.department}</span>
                        </p>
                        <p className="text-xs text-neu-muted font-medium truncate">
                          Email: <span className="text-neu-text font-semibold">{member.email}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Team QR Card */}
          <div className="space-y-8">
            <TeamQRModal team={team} />

            {/* Quick Links */}
            <div className="neu-raised p-6 rounded-3xl space-y-3">
              <h3 className="text-xs font-bold text-neu-muted uppercase tracking-wider mb-2">
                Quick Navigation
              </h3>
              <Link
                href="/attendance"
                className="w-full neu-btn p-3 rounded-xl text-xs font-bold text-neu-text flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-neu-green" />
                  <span>View Attendance Records</span>
                </div>
                <ArrowRight className="w-4 h-4 text-neu-muted" />
              </Link>

              <Link
                href="/problem-statement"
                className="w-full neu-btn p-3 rounded-xl text-xs font-bold text-neu-text flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-neu-gold" />
                  <span>Problem Statement Portal</span>
                </div>
                <ArrowRight className="w-4 h-4 text-neu-muted" />
              </Link>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
