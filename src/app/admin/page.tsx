"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { 
  getInitialTeams, 
  getSessions, 
  saveSessions, 
  deleteSession,
  getAttendanceRecords, 
  saveAttendanceRecords,
  subscribeSessions,
  subscribeAttendanceRecords,
  subscribeTeams,
  subscribeProblemStatements,
  clearAllAttendanceSessions,
  getProblemStatements,
  getReviewRounds,
  saveReviewRounds,
  getEvaluations,
  clearAllDemoData
} from "@/lib/store";
import { Team, TeamMember, AttendanceSession, AttendanceRecord, ProblemStatement, ReviewRound, ReviewerEvaluation, ALLOWED_SDGS } from "@/lib/types";
import { 
  Users, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Presentation, 
  Trash2,
  AlertCircle,
  ExternalLink,
  Search,
  Filter,
  RefreshCcw,
  RotateCcw,
  Sparkles,
  Layers,
  CalendarCheck,
  Building2,
  X,
  Code,
  Download,
  ChevronDown,
  ChevronUp,
  UserCheck
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeErr, setPasscodeErr] = useState<string | null>(null);

  // Tab State
  const [adminTab, setAdminTab] = useState<"sessions" | "rounds" | "attendance" | "teams" | "leaderboard">("sessions");

  // Data States
  const [teams, setTeams] = useState<Team[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [problemStatements, setProblemStatements] = useState<Record<string, ProblemStatement>>({});
  const [rounds, setRounds] = useState<ReviewRound[]>([]);
  const [evaluations, setEvaluations] = useState<ReviewerEvaluation[]>([]);

  // Session Input
  const [newSessionName, setNewSessionName] = useState("");
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Round Input
  const [newRoundName, setNewRoundName] = useState("");
  const [roundError, setRoundError] = useState<string | null>(null);

  // Filters & Selected Team Modal
  const [teamSearch, setTeamSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PS_SUBMITTED" | "PPT_SUBMITTED">("ALL");
  const [attendanceSessionFilter, setAttendanceSessionFilter] = useState<string>("ALL");
  const [selectedTeamModal, setSelectedTeamModal] = useState<Team | null>(null);

  // Clear demo confirmation state
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    const rawSession = sessionStorage.getItem("sdg_admin_auth");
    if (rawSession === "true") {
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
    }

    setTeams(getInitialTeams());
    setProblemStatements(getProblemStatements());
    setRounds(getReviewRounds());
    setEvaluations(getEvaluations());

    const unsubSessions = subscribeSessions((updatedSessions) => {
      setSessions(updatedSessions);
    });

    const unsubRecords = subscribeAttendanceRecords((updatedRecords) => {
      setAttendanceRecords(updatedRecords);
    });

    const unsubTeams = subscribeTeams((updatedTeams) => {
      setTeams(updatedTeams);
    });

    const unsubPS = subscribeProblemStatements((updatedPS) => {
      setProblemStatements(updatedPS);
    });

    return () => {
      unsubSessions();
      unsubRecords();
      unsubTeams();
      unsubPS();
    };
  }, []);

  // Create Review Round Handler (Enforces ONLY ONE active round at a time)
  const handleCreateRound = (e: React.FormEvent) => {
    e.preventDefault();
    setRoundError(null);
    if (!newRoundName.trim()) return;

    const currentRounds = getReviewRounds();
    const activeExists = currentRounds.some((r) => r.isActive);

    if (activeExists) {
      setRoundError("Another review round is currently active. Please close the active round before starting a new one.");
      return;
    }

    const nextRoundNumber = currentRounds.length + 1;
    const newRound: ReviewRound = {
      id: `round_${Date.now()}`,
      roundNumber: nextRoundNumber,
      name: newRoundName.trim(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const updated = [newRound, ...currentRounds];
    saveReviewRounds(updated);
    setRounds(updated);
    setNewRoundName("");
  };

  // Close Active Round Handler
  const handleCloseRound = (roundId: string) => {
    const currentRounds = getReviewRounds();
    const updated = currentRounds.map((r) => {
      if (r.id === roundId) {
        return { ...r, isActive: false, closedAt: new Date().toISOString() };
      }
      return r;
    });
    saveReviewRounds(updated);
    setRounds(updated);
  };

  // Reopen Closed Round Handler
  const handleReopenRound = (roundId: string) => {
    setRoundError(null);
    const currentRounds = getReviewRounds();
    const activeExists = currentRounds.some((r) => r.isActive);

    if (activeExists) {
      setRoundError("Another review round is currently active. Please close the active round before reopening a closed one.");
      return;
    }

    const updated = currentRounds.map((r) => {
      if (r.id === roundId) {
        return { ...r, isActive: true, closedAt: undefined };
      }
      return r;
    });

    saveReviewRounds(updated);
    setRounds(updated);
  };

  // Leaderboard Calculation
  const leaderboardData = React.useMemo(() => {
    const map: Record<string, {
      team: Team;
      roundScores: Record<number, number>;
      totalMarks: number;
      completedRoundsCount: number;
    }> = {};

    teams.forEach((t) => {
      map[t.id] = {
        team: t,
        roundScores: {},
        totalMarks: 0,
        completedRoundsCount: 0,
      };
    });

    evaluations.forEach((e) => {
      if (map[e.teamId]) {
        map[e.teamId].roundScores[e.roundNumber] = e.marks;
        map[e.teamId].totalMarks += e.marks;
        map[e.teamId].completedRoundsCount += 1;
      }
    });

    return Object.values(map).sort((a, b) => {
      if (b.totalMarks !== a.totalMarks) {
        return b.totalMarks - a.totalMarks;
      }
      return a.team.id.localeCompare(b.team.id);
    });
  }, [teams, evaluations]);

  // Export Leaderboard CSV Handler
  const handleExportLeaderboardCSV = () => {
    if (leaderboardData.length === 0) return;

    const allRoundNumbers = Array.from(new Set(rounds.map(r => r.roundNumber))).sort((a, b) => a - b);
    const roundHeaders = allRoundNumbers.map(rn => `Round ${rn} Marks (out of 100)`);

    const headers = ["Rank", "Team ID", "Team Name", ...roundHeaders, "Total Combined Marks"];
    
    const rows = leaderboardData.map((item, idx) => {
      const roundVals = allRoundNumbers.map(rn => item.roundScores[rn] !== undefined ? item.roundScores[rn] : "Pending");
      return [
        idx + 1,
        `"${item.team.id}"`,
        `"${item.team.teamName}"`,
        ...roundVals,
        item.totalMarks,
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SDG_Expo_Leaderboard_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "wie143cs") {
      sessionStorage.setItem("sdg_admin_auth", "true");
      setAuthenticated(true);
      setPasscodeErr(null);
    } else {
      setPasscodeErr("Invalid Admin Passcode.");
    }
  };

  // Create Session Handler (Enforces ONLY ONE active session at a time)
  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    setSessionError(null);

    if (!newSessionName.trim()) return;

    const currentSessions = getSessions();
    const activeExists = currentSessions.some((s) => s.isActive);

    if (activeExists) {
      setSessionError("Another attendance session is currently active. Please close the active session before starting a new one.");
      return;
    }

    const newSession: AttendanceSession = {
      id: `session_${Date.now()}`,
      name: newSessionName.trim(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const finalSessions = [newSession, ...currentSessions];
    saveSessions(finalSessions);
    setSessions(finalSessions);
    setNewSessionName("");
  };

  // Close Active Session Handler & Auto-mark Un-scanned Students as ABSENT
  const handleCloseSession = (sessionId: string) => {
    const currentSessions = getSessions();
    const targetSession = currentSessions.find((s) => s.id === sessionId);

    const updatedSessions = currentSessions.map((s) => {
      if (s.id === sessionId) {
        return { ...s, isActive: false, closedAt: new Date().toISOString() };
      }
      return s;
    });
    saveSessions(updatedSessions);
    setSessions(updatedSessions);

    // Auto-mark all un-scanned team members as ABSENT for this closed session
    const existingRecords = getAttendanceRecords();
    const allTeams = getInitialTeams();
    const markedKeys = new Set(
      existingRecords
        .filter((r) => r.sessionId === sessionId)
        .map((r) => `${r.teamId}_${r.memberRegNo}`)
    );

    const now = new Date().toISOString();
    const autoAbsentRecords: AttendanceRecord[] = [];

    allTeams.forEach((t) => {
      t.members.forEach((m) => {
        const key = `${t.id}_${m.regNo}`;
        if (!markedKeys.has(key)) {
          autoAbsentRecords.push({
            id: `att_auto_absent_${sessionId}_${t.id}_${m.regNo}`,
            sessionId,
            sessionName: targetSession?.name || "Attendance Session",
            teamId: t.id,
            teamName: t.teamName,
            memberRegNo: m.regNo,
            memberName: m.name,
            status: "ABSENT",
            markedAt: now,
            volunteerId: "System (Auto-Marked Absent on Close)",
          });
        }
      });
    });

    if (autoAbsentRecords.length > 0) {
      const finalRecords = [...existingRecords, ...autoAbsentRecords];
      saveAttendanceRecords(finalRecords);
      setAttendanceRecords(finalRecords);
    }
  };

  // Reopen Closed Session Handler (Enforces ONLY ONE active session at a time)
  const handleReopenSession = (sessionId: string) => {
    setSessionError(null);
    const currentSessions = getSessions();
    const activeExists = currentSessions.some((s) => s.isActive);

    if (activeExists) {
      setSessionError("Another attendance session is currently active. Please close the active session before reopening a closed session.");
      return;
    }

    const updated = currentSessions.map((s) => {
      if (s.id === sessionId) {
        return { ...s, isActive: true, closedAt: undefined };
      }
      return s;
    });

    saveSessions(updated);
    setSessions(updated);
  };

  // Delete Session Handler
  const handleDeleteSession = (sessionId: string) => {
    if (window.confirm("Are you sure you want to delete this session and all its associated attendance records?")) {
      const updatedSessions = deleteSession(sessionId);
      setSessions(updatedSessions);
      setAttendanceRecords(getAttendanceRecords());
    }
  };

  const handleWipeAllSessions = () => {
    if (window.confirm("Are you sure you want to remove ALL attendance sessions and records across all devices?")) {
      clearAllAttendanceSessions();
    }
  };

  // Clear All Demo Data Handler
  const handleClearDemoData = () => {
    clearAllDemoData();
    setTeams(getInitialTeams());
    setProblemStatements(getProblemStatements());
    setRounds(getReviewRounds());
    setEvaluations(getEvaluations());
  };

  // Filtered teams list
  const filteredTeams = teams.filter((t) => {
    const matchesQuery = 
      t.id.toLowerCase().includes(teamSearch.toLowerCase()) ||
      t.teamName.toLowerCase().includes(teamSearch.toLowerCase()) ||
      t.members.some(m => m.name.toLowerCase().includes(teamSearch.toLowerCase()) || m.regNo.toLowerCase().includes(teamSearch.toLowerCase()));

    if (!matchesQuery) return false;

    if (statusFilter === "PS_SUBMITTED") return !!problemStatements[t.id] || t.problemStatementSubmitted;
    if (statusFilter === "PPT_SUBMITTED") return t.pptSubmitted;

    return true;
  });

  // Active Session
  const activeSession = sessions.find((s) => s.isActive);

  // Filtered Attendance Records
  const filteredAttendance = attendanceRecords.filter((r) => {
    if (attendanceSessionFilter === "ALL") return true;
    return r.sessionId === attendanceSessionFilter;
  });

  // Team Expansion State for Attendance Records
  const [expandedTeamKeys, setExpandedTeamKeys] = useState<Record<string, boolean>>({});

  const toggleExpandTeam = (key: string) => {
    setExpandedTeamKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Admin Manual Attendance Toggle Handler (Allows changing ABSENT <-> PRESENT)
  const handleAdminToggleAttendance = (
    sessionId: string,
    sessionName: string,
    teamId: string,
    teamName: string,
    memberRegNo: string,
    memberName: string,
    currentStatus?: "PRESENT" | "ABSENT"
  ) => {
    const allRecords = getAttendanceRecords();
    const newStatus = currentStatus === "PRESENT" ? "ABSENT" : "PRESENT";
    const now = new Date().toISOString();

    const existingIdx = allRecords.findIndex(
      (r) => r.sessionId === sessionId && r.teamId === teamId && r.memberRegNo === memberRegNo
    );

    let updatedRecords: AttendanceRecord[];

    if (existingIdx !== -1) {
      updatedRecords = [...allRecords];
      updatedRecords[existingIdx] = {
        ...updatedRecords[existingIdx],
        status: newStatus,
        markedAt: now,
        volunteerId: "Admin (Manual Override)",
      };
    } else {
      const newRecord: AttendanceRecord = {
        id: `att_admin_${sessionId}_${teamId}_${memberRegNo}_${Date.now()}`,
        sessionId,
        sessionName,
        teamId,
        teamName,
        memberRegNo,
        memberName,
        status: newStatus,
        markedAt: now,
        volunteerId: "Admin (Manual Override)",
      };
      updatedRecords = [...allRecords, newRecord];
    }

    saveAttendanceRecords(updatedRecords);
    setAttendanceRecords(updatedRecords);
  };

  // Admin Mark Entire Team Present Handler
  const handleAdminMarkTeamPresent = (
    sessionId: string,
    sessionName: string,
    teamId: string,
    teamName: string,
    members: TeamMember[]
  ) => {
    const allRecords = getAttendanceRecords();
    const now = new Date().toISOString();
    const updatedRecords = [...allRecords];

    members.forEach((m) => {
      const idx = updatedRecords.findIndex(
        (r) => r.sessionId === sessionId && r.teamId === teamId && r.memberRegNo === m.regNo
      );
      if (idx !== -1) {
        updatedRecords[idx] = {
          ...updatedRecords[idx],
          status: "PRESENT",
          markedAt: now,
          volunteerId: "Admin (Team Override)",
        };
      } else {
        updatedRecords.push({
          id: `att_admin_${sessionId}_${teamId}_${m.regNo}_${Date.now()}`,
          sessionId,
          sessionName,
          teamId,
          teamName,
          memberRegNo: m.regNo,
          memberName: m.name,
          status: "PRESENT",
          markedAt: now,
          volunteerId: "Admin (Team Override)",
        });
      }
    });

    saveAttendanceRecords(updatedRecords);
    setAttendanceRecords(updatedRecords);
  };

  // Group Attendance Records Team-Wise
  const teamWiseAttendance = React.useMemo(() => {
    const map: Record<string, {
      key: string;
      sessionId: string;
      sessionName: string;
      teamId: string;
      teamName: string;
      presentCount: number;
      totalCount: number;
      markedAt: string;
      volunteerId?: string;
      records: AttendanceRecord[];
    }> = {};
    
    if (attendanceSessionFilter !== "ALL") {
      const selectedSess = sessions.find((s) => s.id === attendanceSessionFilter);
      const targetSessionName = selectedSess ? selectedSess.name : "Attendance Session";
      
      teams.forEach((t) => {
        const key = `${attendanceSessionFilter}_${t.id}`;
        const teamRecs = attendanceRecords.filter(
          (r) => r.sessionId === attendanceSessionFilter && r.teamId === t.id
        );
        const presentCount = teamRecs.filter((r) => r.status === "PRESENT").length;
        const latestMarked = teamRecs.length > 0 ? teamRecs[0].markedAt : new Date().toISOString();
        const latestVol = teamRecs.length > 0 ? teamRecs[0].volunteerId : "Admin / Unmarked";

        map[key] = {
          key,
          sessionId: attendanceSessionFilter,
          sessionName: targetSessionName,
          teamId: t.id,
          teamName: t.teamName,
          presentCount,
          totalCount: t.members.length,
          markedAt: latestMarked,
          volunteerId: latestVol,
          records: teamRecs,
        };
      });
    } else {
      filteredAttendance.forEach((rec) => {
        const key = `${rec.sessionId}_${rec.teamId}`;
        if (!map[key]) {
          map[key] = {
            key,
            sessionId: rec.sessionId,
            sessionName: rec.sessionName,
            teamId: rec.teamId,
            teamName: rec.teamName,
            presentCount: 0,
            totalCount: 0,
            markedAt: rec.markedAt,
            volunteerId: rec.volunteerId,
            records: [],
          };
        }
        map[key].records.push(rec);
        map[key].totalCount += 1;
        if (rec.status === "PRESENT") {
          map[key].presentCount += 1;
        }
      });
    }

    return Object.values(map);
  }, [filteredAttendance, attendanceSessionFilter, sessions, teams, attendanceRecords]);

  // Export Attendance CSV Handler
  const handleExportAttendanceCSV = () => {
    if (filteredAttendance.length === 0) {
      alert("No attendance records available to export.");
      return;
    }

    const headers = ["Session Name", "Team ID", "Team Name", "Student Name", "Register Number", "Status", "Marked Time", "Volunteer Email"];
    const rows = filteredAttendance.map((r) => [
      `"${r.sessionName}"`,
      `"${r.teamId}"`,
      `"${r.teamName}"`,
      `"${r.memberName}"`,
      `"${r.memberRegNo}"`,
      `"${r.status}"`,
      `"${new Date(r.markedAt).toLocaleString()}"`,
      `"${r.volunteerId || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SDG_Expo_Attendance_Records_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate Attendance Stats
  const totalPresentCount = filteredAttendance.filter((r) => r.status === "PRESENT").length;
  const totalAbsentCount = filteredAttendance.filter((r) => r.status === "ABSENT").length;

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F4F2EC]">
        <header className="w-full bg-[#FAF8F4] border-b border-white/60 py-4 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="text-xs font-extrabold text-neu-text tracking-wide">
              ADMIN CONTROL CENTER — DIRECT ACCESS
            </span>
            <Link href="/" className="neu-btn px-4 py-2 text-xs font-semibold text-neu-muted hover:text-neu-text">
              ← Home
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 py-12">
          <div className="w-full max-w-md neu-raised-lg p-6 sm:p-8 rounded-3xl bg-[#FAF8F4]">
            <div className="text-center mb-6">
              <div className="neu-badge inline-block text-neu-gold text-xs font-bold mb-2">
                ADMIN SECURITY ACCESS
              </div>
              <h2 className="text-2xl font-extrabold text-neu-text">Admin Authentication</h2>
              <p className="text-xs text-neu-muted mt-1">
                Enter admin security passcode to open event control center
              </p>
            </div>

            {passcodeErr && (
              <div className="neu-raised p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-bold mb-4">
                {passcodeErr}
              </div>
            )}

            <form onSubmit={handleAdminAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neu-muted uppercase mb-2">
                  Admin Security Passcode
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter Admin Security Passcode"
                  className="w-full neu-inset p-3.5 text-sm text-neu-text focus:outline-none focus:ring-2 focus:ring-neu-gold/50"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full neu-btn neu-btn-gold py-3.5 text-sm font-extrabold flex items-center justify-center gap-2 shadow-md"
              >
                <span>Unlock Admin Console</span>
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
      <Navbar role="admin" userName="Admin Coordinator" />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner */}
        <div className="neu-raised p-6 sm:p-8 rounded-3xl bg-[#FAF8F4] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="neu-badge inline-flex text-neu-gold text-xs font-bold mb-2">
              EVENT MANAGEMENT CONSOLE
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neu-text">
              Admin Control Center
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-neu-muted mt-1">
              SDG Focused Project Expo 2026 — IEEE WIE KARE × IEEE CS KARE
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowClearConfirm(true)}
              className="neu-btn px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              <span>Clear Demo Data</span>
            </button>
          </div>
        </div>

        {/* Clear Demo Confirm Modal */}
        {showClearConfirm && (
          <div className="neu-raised p-6 rounded-3xl bg-red-50/90 border border-red-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
              <div>
                <h4 className="text-sm font-extrabold text-red-900">Confirm System Reset</h4>
                <p className="text-xs text-red-700">Clear all demo problem statements, PPT links, and attendance records? Seeded 30 teams will remain.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClearDemoData}
                className="neu-btn bg-red-600 text-white hover:bg-red-700 px-4 py-2 text-xs font-extrabold rounded-xl"
              >
                Yes, Reset System
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="neu-btn px-4 py-2 text-xs font-bold text-neu-muted"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ADMIN SEPARATE NAVIGATION TABS */}
        <div className="flex flex-wrap neu-inset p-2 rounded-2xl bg-[#ECE9E1] gap-1">
          <button
            onClick={() => setAdminTab("sessions")}
            className={`flex-1 min-w-[120px] py-3 text-xs sm:text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
              adminTab === "sessions" ? "neu-btn text-neu-gold shadow-md" : "text-neu-muted hover:text-neu-text"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>1. Sessions</span>
          </button>

          <button
            onClick={() => setAdminTab("rounds")}
            className={`flex-1 min-w-[130px] py-3 text-xs sm:text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
              adminTab === "rounds" ? "neu-btn text-neu-gold shadow-md" : "text-neu-muted hover:text-neu-text"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>2. Review Rounds</span>
          </button>

          <button
            onClick={() => setAdminTab("attendance")}
            className={`flex-1 min-w-[130px] py-3 text-xs sm:text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
              adminTab === "attendance" ? "neu-btn text-neu-green shadow-md" : "text-neu-muted hover:text-neu-text"
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>3. Attendance</span>
          </button>

          <button
            onClick={() => setAdminTab("teams")}
            className={`flex-1 min-w-[110px] py-3 text-xs sm:text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
              adminTab === "teams" ? "neu-btn text-neu-gold shadow-md" : "text-neu-muted hover:text-neu-text"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>4. Teams</span>
          </button>

          <button
            onClick={() => setAdminTab("leaderboard")}
            className={`flex-1 min-w-[130px] py-3 text-xs sm:text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
              adminTab === "leaderboard" ? "neu-btn text-neu-gold shadow-md" : "text-neu-muted hover:text-neu-text"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>5. Leaderboard</span>
          </button>
        </div>

        {/* TAB 1: SESSIONS & LIVE CONTROLS */}
        {adminTab === "sessions" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Create & Active Session Section */}
            <div className="neu-raised p-6 sm:p-8 rounded-3xl space-y-6 bg-[#FAF8F4]">
              <div className="flex items-center gap-3">
                <div className="p-3 neu-inset rounded-2xl text-neu-gold bg-[#ECE9E1]">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-neu-text">Attendance Session Manager</h2>
                  <p className="text-xs text-neu-muted">Create or close event attendance sessions (strictly one active session)</p>
                </div>
              </div>

              {sessionError && (
                <div className="neu-raised p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold">Active Session Warning</p>
                    <p className="mt-0.5">{sessionError}</p>
                  </div>
                </div>
              )}

              {/* Active Session Card */}
              {activeSession ? (
                <div className="neu-raised p-6 rounded-2xl bg-emerald-50/80 border border-emerald-300 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="neu-badge text-emerald-800 bg-white font-extrabold text-xs">
                      ● ACTIVE SESSION RUNNING
                    </span>
                    <span className="text-xs text-emerald-700 font-semibold">
                      Created: {new Date(activeSession.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-emerald-950">{activeSession.name}</h3>
                    <p className="text-xs text-emerald-700 font-medium mt-1">
                      Volunteers can now scan team QR codes for this session.
                    </p>
                  </div>

                  <button
                    onClick={() => handleCloseSession(activeSession.id)}
                    className="w-full neu-btn bg-red-600 text-white hover:bg-red-700 py-3 rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>CLOSE ACTIVE SESSION</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreateSession} className="space-y-4">
                  <div>
                    <label className="block text-xs font-extrabold text-neu-gold uppercase tracking-wider mb-2">
                      NEW ATTENDANCE SESSION NAME *
                    </label>
                    <input
                      type="text"
                      value={newSessionName}
                      onChange={(e) => setNewSessionName(e.target.value)}
                      placeholder="e.g. Day 1 Morning Check-in, Session 2 Evaluation"
                      className="w-full neu-inset p-4 text-sm font-semibold text-neu-text placeholder:text-neu-muted/50 focus:outline-none focus:ring-2 focus:ring-neu-gold/50"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full neu-btn neu-btn-gold py-4 text-xs font-extrabold flex items-center justify-center gap-2 shadow-md"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>START NEW ATTENDANCE SESSION</span>
                  </button>
                </form>
              )}
            </div>

            {/* Session Logs List with Delete Action */}
            <div className="neu-raised p-6 sm:p-8 rounded-3xl space-y-6 bg-[#FAF8F4]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-neu-text">All Sessions History</h3>
                  <p className="text-xs text-neu-muted">Manage active and past event sessions</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="neu-badge text-neu-gold font-bold text-xs">{sessions.length} Sessions</span>
                  {sessions.length > 0 && (
                    <button
                      onClick={handleWipeAllSessions}
                      className="neu-btn px-2.5 py-1 text-[11px] font-bold text-red-600 hover:text-red-800 flex items-center gap-1"
                      title="Wipe All Sessions"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Wipe All Sessions</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {sessions.length === 0 ? (
                  <div className="neu-inset p-8 text-center rounded-2xl text-xs font-bold text-neu-muted">
                    No attendance sessions created yet. Use the form on the left to start a session.
                  </div>
                ) : (
                  sessions.map((s) => (
                    <div
                      key={s.id}
                      className="neu-inset p-4 rounded-2xl bg-[#ECE9E1] flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${s.isActive ? "bg-emerald-500 animate-ping" : "bg-neu-muted"}`} />
                          <h4 className="text-sm font-black text-neu-text">{s.name}</h4>
                        </div>
                        <p className="text-[11px] text-neu-muted mt-0.5 font-medium">
                          Status: {s.isActive ? <strong className="text-emerald-700 uppercase">ACTIVE</strong> : "Closed"} • Created: {new Date(s.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {s.isActive ? (
                          <button
                            onClick={() => handleCloseSession(s.id)}
                            className="neu-btn px-2.5 py-1.5 text-[11px] font-bold text-red-600 hover:text-red-800"
                          >
                            Close
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReopenSession(s.id)}
                            className="neu-btn px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reopen</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteSession(s.id)}
                          className="neu-btn p-2 text-red-600 hover:text-red-800 rounded-xl"
                          title="Delete Session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
        )}

        {/* TAB 2: REVIEW ROUNDS MANAGER */}
        {adminTab === "rounds" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create & Active Round Section */}
            <div className="neu-raised p-6 sm:p-8 rounded-3xl space-y-6 bg-[#FAF8F4]">
              <div className="flex items-center gap-3">
                <div className="p-3 neu-inset rounded-2xl text-neu-gold bg-[#ECE9E1]">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-neu-text">Review Rounds Manager</h2>
                  <p className="text-xs text-neu-muted">Create and manage evaluation rounds (strictly one active round)</p>
                </div>
              </div>

              {roundError && (
                <div className="neu-raised p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <span>{roundError}</span>
                </div>
              )}

              {/* Active Round Card */}
              {rounds.find((r) => r.isActive) ? (
                <div className="neu-inset p-6 rounded-2xl bg-emerald-50/70 border border-emerald-300 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest">
                      ● CURRENTLY ACTIVE REVIEW ROUND
                    </span>
                    <span className="neu-badge text-emerald-800 bg-white font-extrabold text-xs">
                      OPEN FOR REVIEWERS
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold text-emerald-950">
                      {rounds.find((r) => r.isActive)?.name}
                    </h3>
                    <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                      Started: {new Date(rounds.find((r) => r.isActive)!.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCloseRound(rounds.find((r) => r.isActive)!.id)}
                    className="w-full neu-btn bg-red-600 text-white hover:bg-red-700 py-3 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>CLOSE ACTIVE REVIEW ROUND</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreateRound} className="space-y-4">
                  <div>
                    <label className="block text-xs font-extrabold text-neu-gold uppercase tracking-wider mb-2">
                      NEW REVIEW ROUND NAME *
                    </label>
                    <input
                      type="text"
                      value={newRoundName}
                      onChange={(e) => setNewRoundName(e.target.value)}
                      placeholder="e.g. Round 1 Preliminary Review, Round 2 Final Evaluation"
                      className="w-full neu-inset p-4 text-sm font-semibold text-neu-text placeholder:text-neu-muted/50 focus:outline-none focus:ring-2 focus:ring-neu-gold/50 rounded-2xl"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full neu-btn neu-btn-gold py-4 text-xs font-extrabold flex items-center justify-center gap-2 shadow-md rounded-2xl"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>START NEW REVIEW ROUND</span>
                  </button>
                </form>
              )}
            </div>

            {/* Rounds List */}
            <div className="neu-raised p-6 sm:p-8 rounded-3xl space-y-6 bg-[#FAF8F4]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-neu-text">All Review Rounds</h3>
                  <p className="text-xs text-neu-muted">History of active & completed evaluation rounds</p>
                </div>
                <span className="neu-badge text-neu-gold font-bold text-xs">{rounds.length} Rounds</span>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {rounds.length === 0 ? (
                  <div className="neu-inset p-8 text-center rounded-2xl text-xs font-bold text-neu-muted">
                    No review rounds created yet. Create a round to allow reviewers to enter marks out of 100.
                  </div>
                ) : (
                  rounds.map((r) => (
                    <div
                      key={r.id}
                      className="neu-inset p-4 rounded-2xl bg-[#ECE9E1] flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${r.isActive ? "bg-emerald-500 animate-ping" : "bg-neu-muted"}`} />
                          <h4 className="text-sm font-black text-neu-text">{r.name}</h4>
                        </div>
                        <p className="text-[11px] text-neu-muted mt-0.5 font-medium">
                          Status: {r.isActive ? <strong className="text-emerald-700 uppercase">ACTIVE</strong> : "Closed"} • Created: {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {r.isActive ? (
                          <button
                            onClick={() => handleCloseRound(r.id)}
                            className="neu-btn px-2.5 py-1.5 text-[11px] font-bold text-red-600 hover:text-red-800"
                          >
                            Close
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReopenRound(r.id)}
                            className="neu-btn px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reopen</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SEPARATE DEDICATED ATTENDANCE RECORDS VIEW */}
        {adminTab === "attendance" && (
          <div className="space-y-6">
            
            {/* Attendance Overview Stats Header */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="neu-raised p-6 rounded-3xl bg-[#FAF8F4]">
                <span className="text-xs font-bold text-neu-muted uppercase tracking-wider">Total Recorded Logs</span>
                <p className="text-3xl font-black text-neu-text mt-1">{filteredAttendance.length}</p>
                <p className="text-xs text-neu-muted mt-1 font-semibold">Attendance submission entries</p>
              </div>

              <div className="neu-raised p-6 rounded-3xl bg-[#FAF8F4]">
                <span className="text-xs font-bold text-neu-muted uppercase tracking-wider">Total Present Student Tally</span>
                <p className="text-3xl font-black text-emerald-600 mt-1">{totalPresentCount}</p>
                <p className="text-xs text-emerald-700 mt-1 font-semibold">Individual students marked PRESENT</p>
              </div>

              <div className="neu-raised p-6 rounded-3xl bg-[#FAF8F4]">
                <span className="text-xs font-bold text-neu-muted uppercase tracking-wider">Total Absent Tally</span>
                <p className="text-3xl font-black text-rose-600 mt-1">{totalAbsentCount}</p>
                <p className="text-xs text-rose-700 mt-1 font-semibold">Individual students marked ABSENT</p>
              </div>
            </div>

            {/* Attendance Records Filter & Table */}
            <div className="neu-raised p-6 sm:p-8 rounded-3xl space-y-6 bg-[#FAF8F4]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-neu-text">Team-Wise Attendance Summary</h3>
                  <p className="text-xs text-neu-muted">Aggregated present/absent member counts per team for each session</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Session Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neu-muted uppercase">Filter Session:</span>
                    <select
                      value={attendanceSessionFilter}
                      onChange={(e) => setAttendanceSessionFilter(e.target.value)}
                      className="neu-inset p-2.5 text-xs font-bold text-neu-text bg-[#ECE9E1] rounded-xl focus:outline-none"
                    >
                      <option value="ALL">All Sessions</option>
                      {sessions.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Export CSV Button */}
                  <button
                    onClick={handleExportAttendanceCSV}
                    className="neu-btn neu-btn-gold px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-sm"
                  >
                    <Download className="w-4 h-4 text-neu-text" />
                    <span>EXPORT ATTENDANCE CSV</span>
                  </button>
                </div>
              </div>

              {teamWiseAttendance.length === 0 ? (
                <div className="neu-inset p-10 text-center rounded-2xl text-xs font-extrabold text-neu-muted space-y-2">
                  <CalendarCheck className="w-8 h-8 text-neu-muted mx-auto opacity-50" />
                  <p>No attendance records found for this selection.</p>
                  <p className="font-normal text-neu-muted/80">Volunteers use the camera scanner portal (/attend) to submit team attendance.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neu-text/10 text-neu-muted uppercase tracking-wider font-extrabold">
                        <th className="py-3 px-4">Session Name</th>
                        <th className="py-3 px-4">Team ID</th>
                        <th className="py-3 px-4">Team Name</th>
                        <th className="py-3 px-4">Attendance Ratio</th>
                        <th className="py-3 px-4">Time Marked</th>
                        <th className="py-3 px-4 text-right">Member Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neu-text/10 font-semibold">
                      {teamWiseAttendance.map((item) => {
                        const isExpanded = !!expandedTeamKeys[item.key];
                        const ratioPercent = Math.round((item.presentCount / item.totalCount) * 100);

                        return (
                          <React.Fragment key={item.key}>
                            <tr className="hover:bg-[#ECE9E1]/50 transition-colors">
                              <td className="py-4 px-4 font-bold text-neu-text">{item.sessionName}</td>
                              <td className="py-4 px-4">
                                <span className="neu-badge text-neu-gold font-extrabold text-[11px]">{item.teamId}</span>
                              </td>
                              <td className="py-4 px-4 font-bold text-neu-text">{item.teamName}</td>
                              <td className="py-4 px-4">
                                <span
                                  className={`px-3 py-1.5 rounded-full text-xs font-black inline-flex items-center gap-1.5 border ${
                                    ratioPercent === 100
                                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                      : ratioPercent > 0
                                      ? "bg-amber-100 text-amber-800 border-amber-300"
                                      : "bg-rose-100 text-rose-800 border-rose-300"
                                  }`}
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>{item.presentCount} / {item.totalCount} Present</span>
                                </span>
                              </td>
                              <td className="py-4 px-4 text-neu-muted font-medium">
                                {new Date(item.markedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                              </td>
                              <td className="py-4 px-4 text-right">
                                <button
                                  onClick={() => toggleExpandTeam(item.key)}
                                  className="neu-btn px-3 py-1.5 text-[11px] font-extrabold text-neu-text inline-flex items-center gap-1.5 shadow-sm"
                                >
                                  <span>{isExpanded ? "Hide Members" : "View Members"}</span>
                                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                              </td>
                            </tr>

                            {/* EXPANDABLE MEMBER BREAKDOWN WITH ADMIN ATTENDANCE OVERRIDE */}
                            {isExpanded && (
                              <tr className="bg-[#ECE9E1]/40">
                                <td colSpan={6} className="p-4">
                                  {(() => {
                                    const targetTeam = teams.find((t) => t.id === item.teamId);
                                    const membersList = targetTeam ? targetTeam.members : [];

                                    return (
                                      <div className="neu-inset p-5 rounded-2xl bg-[#ECE9E1] space-y-4">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-extrabold text-neu-muted uppercase tracking-wider border-b border-neu-text/10 pb-3 gap-2">
                                          <div>
                                            <span className="text-neu-text text-sm font-black">
                                              Team Member Attendance Breakdown ({item.teamId} — {item.teamName})
                                            </span>
                                            <span className="block text-[10px] font-normal text-neu-muted mt-0.5">
                                              Click any status button below to toggle student PRESENT / ABSENT
                                            </span>
                                          </div>
                                          
                                          {targetTeam && (
                                            <button
                                              onClick={() => handleAdminMarkTeamPresent(item.sessionId, item.sessionName, item.teamId, item.teamName, targetTeam.members)}
                                              className="neu-btn px-3.5 py-1.5 text-xs font-black text-emerald-800 hover:text-emerald-950 bg-emerald-100/90 rounded-xl shadow-sm border border-emerald-300 flex items-center gap-1.5"
                                            >
                                              <UserCheck className="w-4 h-4 text-emerald-700" />
                                              <span>✓ Mark Entire Team Present</span>
                                            </button>
                                          )}
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                          {membersList.map((mem) => {
                                            const rec = item.records.find((r) => r.memberRegNo === mem.regNo);
                                            const status = rec ? rec.status : "ABSENT";

                                            return (
                                              <div
                                                key={mem.regNo}
                                                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                                                  status === "PRESENT"
                                                    ? "bg-emerald-50/90 border-emerald-300 text-emerald-950"
                                                    : "bg-rose-50/90 border-rose-300 text-rose-950"
                                                }`}
                                              >
                                                <div>
                                                  <p className="text-xs font-extrabold">{mem.name}</p>
                                                  <p className="text-[10px] opacity-80 font-semibold">{mem.regNo}</p>
                                                </div>

                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    handleAdminToggleAttendance(
                                                      item.sessionId,
                                                      item.sessionName,
                                                      item.teamId,
                                                      item.teamName,
                                                      mem.regNo,
                                                      mem.name,
                                                      status
                                                    )
                                                  }
                                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all shadow-sm flex items-center gap-1 ${
                                                    status === "PRESENT"
                                                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                                      : "bg-rose-600 text-white hover:bg-rose-700"
                                                  }`}
                                                  title="Click to toggle Present / Absent for this student"
                                                >
                                                  {status === "PRESENT" ? "✓ PRESENT" : "✕ ABSENT"}
                                                </button>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: TEAMS & SUBMISSIONS DIRECTORY */}
        {adminTab === "teams" && (
          <div className="space-y-6">
            
            {/* Search & Filter Controls */}
            <div className="neu-raised p-6 rounded-3xl bg-[#FAF8F4] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  placeholder="Search by Team ID, Name, Member..."
                  className="w-full neu-inset p-3 pl-10 text-xs font-semibold text-neu-text placeholder:text-neu-muted focus:outline-none"
                />
                <Search className="w-4 h-4 text-neu-muted absolute left-3 top-3" />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-xs font-bold text-neu-muted uppercase">Filter:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="neu-inset p-2.5 text-xs font-bold text-neu-text bg-[#ECE9E1] rounded-xl focus:outline-none"
                >
                  <option value="ALL">All Registered Teams ({teams.length})</option>
                  <option value="PS_SUBMITTED">Problem Statement Submitted</option>
                  <option value="PPT_SUBMITTED">PPT Submitted</option>
                </select>
              </div>
            </div>

            {/* Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((t) => {
                const ps = problemStatements[t.id];
                const isPsSubmitted = !!ps || t.problemStatementSubmitted;

                return (
                  <div key={t.id} className="neu-raised p-6 rounded-3xl bg-[#FAF8F4] flex flex-col justify-between space-y-4 hover:scale-[1.01] transition-transform">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="neu-badge text-neu-gold font-extrabold text-xs px-3 py-1">
                          {t.id}
                        </span>
                        <span className="text-[11px] font-bold text-neu-muted">
                          {t.members.length} Members
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-neu-text mb-2">
                        {t.teamName}
                      </h3>

                      {/* Member list preview */}
                      <div className="neu-inset p-3 rounded-2xl bg-[#ECE9E1] space-y-1 mb-4">
                        <span className="text-[10px] font-bold text-neu-muted uppercase block">STUDENT MEMBERS</span>
                        {t.members.map((m, idx) => (
                          <p key={idx} className="text-xs text-neu-text font-semibold truncate">
                            {idx + 1}. {m.name} <span className="text-neu-muted">({m.regNo})</span>
                          </p>
                        ))}
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          isPsSubmitted ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {isPsSubmitted ? "✓ PS Submitted" : "⌛ PS Pending"}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          t.pptSubmitted ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {t.pptSubmitted ? "✓ PPT Uploaded" : "⌛ PPT Pending"}
                        </span>
                      </div>
                    </div>

                    {/* Action Button to Open Detailed Modal */}
                    <button
                      onClick={() => setSelectedTeamModal(t)}
                      className="w-full neu-btn neu-btn-gold py-2.5 text-xs font-extrabold flex items-center justify-center gap-2 rounded-xl"
                    >
                      <FileText className="w-4 h-4" />
                      <span>VIEW DETAILS & SUBMISSIONS</span>
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 5: LEADERBOARD & EVALUATION STATISTICS */}
        {adminTab === "leaderboard" && (
          <div className="space-y-8">
            
            {/* Header & Export Banner */}
            <div className="neu-raised p-6 sm:p-8 rounded-3xl bg-[#FAF8F4] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="neu-badge inline-flex text-neu-gold text-xs font-bold mb-2">
                  REALTIME SCORE & RANKINGS
                </div>
                <h2 className="text-2xl font-extrabold text-neu-text">
                  Event Leaderboard & Evaluation Report
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-neu-muted mt-1">
                  Runtime summation of scores across all active & completed review rounds
                </p>
              </div>

              <button
                onClick={handleExportLeaderboardCSV}
                className="neu-btn neu-btn-gold px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-md shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>EXPORT LEADERBOARD CSV</span>
              </button>
            </div>

            {/* Leaderboard Table */}
            <div className="neu-raised p-6 sm:p-8 rounded-3xl space-y-6 bg-[#FAF8F4]">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-neu-text">
                  Overall Team Rankings ({leaderboardData.length} Teams)
                </h3>
                <span className="neu-badge text-neu-gold font-bold text-xs">ADMIN SECURE VIEW</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neu-text/10 text-neu-muted text-[11px] font-extrabold uppercase tracking-wider">
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Team ID</th>
                      <th className="py-3 px-4">Team Name</th>
                      {rounds.map((r) => (
                        <th key={r.id} className="py-3 px-4 text-center">
                          {r.name} Marks (100)
                        </th>
                      ))}
                      <th className="py-3 px-4 text-right">Total Combined Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neu-text/5 text-xs font-semibold text-neu-text">
                    {leaderboardData.map((item, index) => {
                      const rank = index + 1;
                      const isTop3 = rank <= 3;

                      return (
                        <tr key={item.team.id} className="hover:bg-amber-50/40 transition-colors">
                          <td className="py-4 px-4 font-black">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${
                              rank === 1 ? "bg-amber-400 text-amber-950 shadow-sm" :
                              rank === 2 ? "bg-slate-300 text-slate-900" :
                              rank === 3 ? "bg-amber-700 text-white" :
                              "bg-[#ECE9E1] text-neu-muted"
                            }`}>
                              {rank}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-black text-neu-gold">{item.team.id}</td>
                          <td className="py-4 px-4 font-bold">{item.team.teamName}</td>

                          {rounds.map((r) => {
                            const score = item.roundScores[r.roundNumber];
                            return (
                              <td key={r.id} className="py-4 px-4 text-center">
                                {score !== undefined ? (
                                  <span className="neu-badge text-emerald-800 bg-emerald-100 font-extrabold text-xs px-2.5 py-1">
                                    {score} / 100
                                  </span>
                                ) : (
                                  <span className="text-neu-muted text-[11px] font-semibold italic">
                                    Pending
                                  </span>
                                )}
                              </td>
                            );
                          })}

                          <td className="py-4 px-4 text-right font-black text-sm text-neu-gold">
                            {item.totalMarks} pts
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* DETAILED PROBLEM STATEMENT & PPT MODAL (ADMIN VIEW IN A GOOD WAY) */}
        {selectedTeamModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="neu-raised-lg p-6 sm:p-8 rounded-3xl bg-[#FAF8F4] max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-6 relative my-8">
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedTeamModal(null)}
                className="absolute top-6 right-6 neu-btn p-2 text-neu-muted hover:text-neu-text rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="border-b border-neu-text/10 pb-4">
                <div className="flex items-center gap-3 mb-1">
                  <span className="neu-badge text-neu-gold font-black text-xs px-3 py-1">
                    {selectedTeamModal.id}
                  </span>
                  <span className="text-xs font-bold text-neu-muted">SDG Focused Project Expo 2026</span>
                </div>
                <h2 className="text-2xl font-black text-neu-text">{selectedTeamModal.teamName}</h2>
              </div>

              {/* Team Members List */}
              <div className="neu-inset p-4 rounded-2xl bg-[#ECE9E1] space-y-2">
                <h4 className="text-xs font-extrabold text-neu-gold uppercase">REGISTERED TEAM MEMBERS (4)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedTeamModal.members.map((m, i) => (
                    <div key={i} className="text-xs text-neu-text font-semibold">
                      • {m.name} <span className="text-neu-muted">({m.regNo})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Problem Statement Details View */}
              {problemStatements[selectedTeamModal.id] ? (
                (() => {
                  const ps = problemStatements[selectedTeamModal.id];
                  return (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-black text-neu-text flex items-center gap-2">
                          <FileText className="w-5 h-5 text-neu-gold" />
                          <span>Submitted Problem Statement</span>
                        </h3>
                        <span className="text-[10px] text-neu-muted font-semibold">
                          Updated: {new Date(ps.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* SDG Category Badges */}
                      <div>
                        <span className="text-[11px] font-extrabold text-neu-muted uppercase block mb-2">TARGET SDG CATEGORIES</span>
                        <div className="flex flex-wrap gap-2">
                          {ps.sdgs.map((sdgKey) => {
                            const foundSdg = ALLOWED_SDGS.find(s => s.key === sdgKey);
                            return (
                              <span
                                key={sdgKey}
                                className="px-3 py-1 rounded-full text-xs font-black text-white shadow-sm"
                                style={{ backgroundColor: foundSdg?.color || "#C5A059" }}
                              >
                                {foundSdg?.id}: {foundSdg?.title}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Title */}
                      <div className="neu-inset p-4 rounded-2xl bg-[#ECE9E1]">
                        <span className="text-[11px] font-extrabold text-neu-gold uppercase block mb-1">PROJECT TITLE</span>
                        <h4 className="text-base font-extrabold text-neu-text">{ps.title}</h4>
                      </div>

                      {/* Description & Solution Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="neu-inset p-4 rounded-2xl bg-[#ECE9E1]">
                          <span className="text-[11px] font-extrabold text-neu-gold uppercase block mb-1">PROBLEM DESCRIPTION</span>
                          <p className="text-xs text-neu-text leading-relaxed font-medium">{ps.problemDescription}</p>
                        </div>

                        <div className="neu-inset p-4 rounded-2xl bg-[#ECE9E1]">
                          <span className="text-[11px] font-extrabold text-neu-green uppercase block mb-1">PROPOSED SOLUTION</span>
                          <p className="text-xs text-neu-text leading-relaxed font-medium">{ps.proposedSolution}</p>
                        </div>
                      </div>

                      {/* Key Innovation & Expected Impact Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="neu-inset p-4 rounded-2xl bg-[#ECE9E1]">
                          <span className="text-[11px] font-extrabold text-amber-700 uppercase block mb-1">KEY INNOVATION</span>
                          <p className="text-xs text-neu-text leading-relaxed font-medium">{ps.keyInnovation}</p>
                        </div>

                        <div className="neu-inset p-4 rounded-2xl bg-[#ECE9E1]">
                          <span className="text-[11px] font-extrabold text-emerald-800 uppercase block mb-1">EXPECTED IMPACT</span>
                          <p className="text-xs text-neu-text leading-relaxed font-medium">{ps.expectedImpact}</p>
                        </div>
                      </div>

                      {/* Tech Stack */}
                      <div className="neu-inset p-4 rounded-2xl bg-[#ECE9E1]">
                        <span className="text-[11px] font-extrabold text-neu-gold uppercase block mb-2">TECHNOLOGY STACK</span>
                        <div className="flex flex-wrap gap-2">
                          {ps.techStack.map((tech, i) => (
                            <span key={i} className="neu-badge text-neu-text bg-white text-[11px] font-bold">
                              {tech}
                            </span>
                          ))}
                          {ps.otherTech && (
                            <span className="neu-badge text-neu-gold bg-amber-50 text-[11px] font-bold border border-amber-300">
                              Other: {ps.otherTech}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="neu-inset p-6 text-center rounded-2xl text-xs font-bold text-neu-muted">
                  No problem statement submitted yet by this team.
                </div>
              )}

              {/* PPT Presentation Deck View */}
              <div className="border-t border-neu-text/10 pt-4">
                <h4 className="text-sm font-extrabold text-neu-text mb-3 flex items-center gap-2">
                  <Presentation className="w-5 h-5 text-neu-green" />
                  <span>Uploaded Presentation Deck</span>
                </h4>

                {selectedTeamModal.pptSubmitted && selectedTeamModal.pptUrl ? (
                  <div className="neu-inset p-4 rounded-2xl bg-emerald-50/70 border border-emerald-300 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-emerald-800 uppercase">STATUS: UPLOADED</span>
                      <p className="text-xs font-bold text-emerald-950 truncate max-w-md mt-0.5">{selectedTeamModal.pptUrl}</p>
                    </div>
                    <a
                      href={selectedTeamModal.pptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="neu-btn neu-btn-gold px-4 py-2 text-xs font-extrabold flex items-center gap-2"
                    >
                      <span>Open Deck</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ) : (
                  <div className="neu-inset p-4 text-center rounded-2xl text-xs font-bold text-neu-muted">
                    No presentation deck uploaded yet by this team.
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedTeamModal(null)}
                  className="neu-btn px-6 py-2.5 text-xs font-bold text-neu-muted"
                >
                  Close Window
                </button>
              </div>

            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
