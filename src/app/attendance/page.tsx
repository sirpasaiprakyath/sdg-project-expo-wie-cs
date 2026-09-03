"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TeamQRModal from "@/components/qr/TeamQRModal";
import { getInitialTeams, getSessions, getAttendanceRecords } from "@/lib/store";
import { Team, AttendanceSession, AttendanceRecord } from "@/lib/types";
import { QrCode, CheckCircle2, XCircle, Clock, ShieldCheck } from "lucide-react";

export default function ParticipantAttendance() {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  const loadAttendanceData = () => {
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

    const activeSessions = getSessions();
    setSessions(activeSessions);

    const allRecords = getAttendanceRecords();
    if (currentTeam) {
      setAttendanceRecords(allRecords.filter((r) => r.teamId === currentTeam.id));
    }
  };

  useEffect(() => {
    loadAttendanceData();

    // Auto-refresh interval (every 2 seconds) for live attendance scans
    const interval = setInterval(() => {
      loadAttendanceData();
    }, 2000);

    return () => clearInterval(interval);
  }, [router]);

  if (!team || !sessionUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F2EC]">
        <div className="neu-raised p-8 rounded-2xl text-center">
          <p className="text-sm font-bold text-neu-muted">Loading Attendance Status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F2EC]">
      <Navbar
        role="participant"
        userName={sessionUser.userName}
        teamId={team.id}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner */}
        <div className="neu-raised p-6 rounded-3xl bg-[#FAF8F4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="neu-badge inline-flex text-neu-green text-xs font-bold mb-2">
              REALTIME ATTENDANCE LOGS
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neu-text">
              Team Attendance Portal
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-neu-muted mt-1">
              Team <strong className="text-neu-text">{team.id}</strong> — {team.teamName}
            </p>
          </div>
        </div>

        {/* Attendance Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Sessions Status List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="neu-raised p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-neu-gold" />
                  <h2 className="text-base font-extrabold text-neu-text">SESSION ATTENDANCE RECORDS</h2>
                </div>
                <span className="text-xs font-bold text-neu-muted">Live Sync</span>
              </div>

              <div className="space-y-4">
                {sessions.map((sess) => {
                  // Find member attendance for this session
                  const memberRecords = attendanceRecords.filter((r) => r.sessionId === sess.id);
                  const currentUserRecord = memberRecords.find((r) => r.memberRegNo === sessionUser.memberInfo?.regNo);

                  let statusText = "NOT YET MARKED";
                  let statusBg = "bg-amber-100 text-amber-800 border-amber-300";
                  let StatusIcon = Clock;

                  if (currentUserRecord) {
                    if (currentUserRecord.status === "PRESENT") {
                      statusText = "PRESENT";
                      statusBg = "bg-emerald-100 text-emerald-800 border-emerald-300";
                      StatusIcon = CheckCircle2;
                    } else {
                      statusText = "ABSENT";
                      statusBg = "bg-red-100 text-red-800 border-red-300";
                      StatusIcon = XCircle;
                    }
                  }

                  return (
                    <div key={sess.id} className="neu-inset p-5 rounded-2xl bg-[#ECE9E1] space-y-4">
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neu-text/10">
                        <div>
                          <span className="text-[10px] font-extrabold text-neu-gold uppercase tracking-wider">
                            {sess.isActive ? "● ACTIVE SESSION" : "CLOSED SESSION"}
                          </span>
                          <h3 className="text-sm font-extrabold text-neu-text">{sess.name}</h3>
                        </div>

                        <div className={`px-3 py-1 rounded-full text-xs font-extrabold border flex items-center gap-1.5 w-fit ${statusBg}`}>
                          <StatusIcon className="w-4 h-4" />
                          <span>{statusText}</span>
                        </div>
                      </div>

                      {/* Team Member Status Breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {team.members.map((mem) => {
                          const record = memberRecords.find((r) => r.memberRegNo === mem.regNo);
                          const isPresent = record?.status === "PRESENT";
                          const isAbsent = record?.status === "ABSENT";

                          return (
                            <div key={mem.regNo} className="neu-raised-sm p-3 rounded-xl bg-white/80 flex items-center justify-between">
                              <div>
                                <span className="text-xs font-bold text-neu-text block">{mem.name}</span>
                                <span className="text-[10px] text-neu-muted font-medium">{mem.regNo}</span>
                              </div>
                              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                isPresent ? "bg-emerald-100 text-emerald-700" : isAbsent ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                              }`}>
                                {isPresent ? "PRESENT" : isAbsent ? "ABSENT" : "PENDING"}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Permanent Secure QR Display */}
          <div>
            <TeamQRModal team={team} />
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
