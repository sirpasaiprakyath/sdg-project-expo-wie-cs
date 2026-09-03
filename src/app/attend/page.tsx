"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Html5Qrcode } from "html5-qrcode";
import { 
  Camera, 
  Search, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  RotateCcw, 
  Users, 
  Send,
  UserCheck,
  AlertTriangle,
  QrCode,
  Video,
  VideoOff
} from "lucide-react";
import Link from "next/link";
import { getInitialTeams, getSessions, getAttendanceRecords, saveAttendanceRecords, subscribeSessions, subscribeAttendanceRecords, subscribeGlobalLaunchState } from "@/lib/store";
import { Team, TeamMember, AttendanceSession, AttendanceRecord, SiteLaunchState } from "@/lib/types";

export default function VolunteerAttendancePortal() {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  
  // Scanner / Search states
  const [scannedToken, setScannedToken] = useState<string | null>(null);
  const [scannedTeam, setScannedTeam] = useState<Team | null>(null);
  const [memberStatusMap, setMemberStatusMap] = useState<Record<string, "PRESENT" | "ABSENT">>({});

  // Search input
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);

  // Status feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<boolean>(false);
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);

  const [volunteerAuth, setVolunteerAuth] = useState<boolean>(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeErr, setPasscodeErr] = useState<string | null>(null);
  const [launchState, setLaunchState] = useState<SiteLaunchState>({ isReadyForLaunch: false, isLaunched: false });

  useEffect(() => {
    const unsubscribe = subscribeGlobalLaunchState((state) => {
      setLaunchState(state);
    });
    return () => unsubscribe();
  }, []);

  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const rawSession = sessionStorage.getItem("sdg_volunteer_auth");
    if (rawSession === "true") {
      setVolunteerAuth(true);
      setSessionUser({ role: "volunteer", userName: "Volunteer Scanner" });
    } else {
      setVolunteerAuth(false);
    }

    const unsubSessions = subscribeSessions((sessions) => {
      const active = sessions.find((s) => s.isActive) || null;
      setActiveSession(active);
    });

    const unsubRecords = subscribeAttendanceRecords((records) => {
      setAttendanceRecords(records);
    });

    return () => {
      unsubSessions();
      unsubRecords();
    };
  }, []);

  // Direct Live Camera Scan Initialization (No file uploads)
  useEffect(() => {
    if (!searchMode && !scannedTeam && activeSession && volunteerAuth && isCameraOn) {
      let isMounted = true;
      let html5QrCode: Html5Qrcode | null = null;

      const timeoutId = setTimeout(() => {
        if (!isMounted) return;

        try {
          const element = document.getElementById("qr-reader");
          if (!element) return;

          html5QrCode = new Html5Qrcode("qr-reader");
          scannerRef.current = html5QrCode;

          html5QrCode
            .start(
              { facingMode: "environment" },
              {
                fps: 15,
                qrbox: { width: 250, height: 250 },
              },
              (decodedText) => {
                handleQRScanned(decodedText);
              },
              () => {}
            )
            .catch(() => {
              // Fallback for devices without rear camera specified
              html5QrCode
                ?.start(
                  { facingMode: "user" },
                  { fps: 15, qrbox: { width: 250, height: 250 } },
                  (decodedText) => handleQRScanned(decodedText),
                  () => {}
                )
                .catch((e) => console.error("Camera start error:", e));
            });
        } catch (e) {
          console.error("Error initializing Html5Qrcode direct camera:", e);
        }
      }, 300);

      return () => {
        isMounted = false;
        clearTimeout(timeoutId);
        if (scannerRef.current) {
          try {
            if (scannerRef.current.isScanning) {
              scannerRef.current.stop().then(() => {
                scannerRef.current?.clear();
                scannerRef.current = null;
              }).catch(() => {
                scannerRef.current = null;
              });
            } else {
              scannerRef.current.clear();
              scannerRef.current = null;
            }
          } catch (e) {
            scannerRef.current = null;
          }
        }
      };
    }
  }, [searchMode, scannedTeam, activeSession, volunteerAuth, isCameraOn]);

  const turnOffCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (e) {
        console.error("Error stopping camera stream:", e);
      }
      scannerRef.current = null;
    }
    setIsCameraOn(false);
  };

  const turnOnCamera = () => {
    setIsCameraOn(true);
  };

  const handleVolunteerAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "210221") {
      const sessionData = {
        role: "volunteer",
        userEmail: "volunteer@klu.ac.in",
        userName: "Event Volunteer",
      };
      sessionStorage.setItem("sdg_volunteer_auth", "true");
      setSessionUser(sessionData);
      setVolunteerAuth(true);
      setPasscodeErr(null);
    } else {
      setPasscodeErr("Invalid Volunteer Passcode.");
    }
  };

  // Handle QR Scan Result
  const handleQRScanned = (decodedText: string) => {
    setErrorMsg(null);
    setIsDuplicate(false);
    setScannedToken(decodedText);

    const teams = getInitialTeams();
    // Resolve token or exact Team ID (e.g., SDG-001 or SDG_QR_SDG-001_...)
    const foundTeam = teams.find(
      (t) => t.qrToken === decodedText || t.id.toLowerCase() === decodedText.toLowerCase()
    );

    if (!foundTeam) {
      setErrorMsg(`Unrecognized QR Token: "${decodedText}". Team not found in database.`);
      return;
    }

    // Check duplicate submission for this session + team
    if (activeSession) {
      const records = getAttendanceRecords();
      const existing = records.some(
        (r) => r.sessionId === activeSession.id && r.teamId === foundTeam.id
      );
      if (existing) {
        setIsDuplicate(true);
        setErrorMsg("Attendance for this team has already been submitted in this session.");
      }
    }

    setScannedTeam(foundTeam);

    // Initialize all members to PRESENT by default
    const initialMap: Record<string, "PRESENT" | "ABSENT"> = {};
    foundTeam.members.forEach((m) => {
      initialMap[m.regNo] = "PRESENT";
    });
    setMemberStatusMap(initialMap);
  };

  // Handle Manual Team Search
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsDuplicate(false);
    if (!searchQuery.trim()) return;

    const q = searchQuery.trim().toLowerCase();
    const teams = getInitialTeams();

    const foundTeam = teams.find((t) => {
      if (t.id.toLowerCase() === q || t.teamName.toLowerCase().includes(q)) return true;
      return t.members.some(
        (m) => m.regNo.toLowerCase() === q || m.name.toLowerCase().includes(q)
      );
    });

    if (!foundTeam) {
      setErrorMsg(`No team found matching query: "${searchQuery}"`);
      return;
    }

    handleQRScanned(foundTeam.qrToken);
  };

  // Toggle member attendance
  const toggleMemberStatus = (regNo: string) => {
    setMemberStatusMap((prev) => ({
      ...prev,
      [regNo]: prev[regNo] === "PRESENT" ? "ABSENT" : "PRESENT",
    }));
  };

  // Submit Attendance
  const handleSubmitAttendance = () => {
    if (!scannedTeam || !activeSession) return;
    setErrorMsg(null);

    // Re-verify duplicate protection
    const records = getAttendanceRecords();
    const existing = records.some(
      (r) => r.sessionId === activeSession.id && r.teamId === scannedTeam.id
    );

    if (existing) {
      setIsDuplicate(true);
      setErrorMsg("Attendance for this team has already been submitted.");
      return;
    }

    const newRecords: AttendanceRecord[] = scannedTeam.members.map((m) => ({
      id: `att_${activeSession.id}_${scannedTeam.id}_${m.regNo}_${Date.now()}`,
      sessionId: activeSession.id,
      sessionName: activeSession.name,
      teamId: scannedTeam.id,
      teamName: scannedTeam.teamName,
      memberRegNo: m.regNo,
      memberName: m.name,
      status: memberStatusMap[m.regNo] || "PRESENT",
      markedAt: new Date().toISOString(),
      volunteerId: sessionUser.userEmail,
    }));

    saveAttendanceRecords([...records, ...newRecords]);
    setSuccessMsg(true);
  };

  // Reset scanner state for next team
  const resetScanner = () => {
    setScannedTeam(null);
    setScannedToken(null);
    setSuccessMsg(false);
    setErrorMsg(null);
    setIsDuplicate(false);
    setSearchQuery("");
  };

  if (!launchState.isLaunched) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F2EC] p-4 text-center select-none">
        <div className="max-w-md neu-raised-lg p-8 rounded-3xl bg-[#FAF8F4] space-y-6 border-2 border-neu-gold/30 shadow-xl">
          <div className="flex justify-center">
            <ShieldAlert className="w-12 h-12 text-neu-gold animate-bounce" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-neu-text">Volunteer Scanner Locked</h2>
            <p className="text-xs text-neu-muted mt-2 font-medium">
              The event site is currently in <strong>Pre-Launch Standby Mode</strong>. Volunteer scanner portal will unlock automatically as soon as event coordinators launch the platform!
            </p>
          </div>
          <div className="pt-2">
            <Link href="/" className="neu-btn px-4 py-2 text-xs font-bold text-neu-text">
              ← Back to Standby Gate
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!volunteerAuth) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F4F2EC]">
        <header className="w-full bg-[#FAF8F4] border-b border-white/60 py-4 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="text-xs font-extrabold text-neu-text tracking-wide">
              VOLUNTEER SCANNER PORTAL — DIRECT ACCESS
            </span>
            <button onClick={() => router.push("/")} className="neu-btn px-4 py-2 text-xs font-semibold text-neu-muted hover:text-neu-text">
              ← Home
            </button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 py-12">
          <div className="w-full max-w-md neu-raised-lg p-6 sm:p-8 rounded-3xl bg-[#FAF8F4]">
            <div className="text-center mb-6">
              <div className="neu-badge inline-block text-neu-green text-xs font-bold mb-2">
                VOLUNTEER AUTHENTICATION
              </div>
              <h2 className="text-2xl font-extrabold text-neu-text">Volunteer Access</h2>
              <p className="text-xs text-neu-muted mt-1">
                Enter volunteer passcode to open camera scanner & team search
              </p>
            </div>

            {passcodeErr && (
              <div className="neu-raised p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-bold mb-4">
                {passcodeErr}
              </div>
            )}

            <form onSubmit={handleVolunteerAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neu-muted uppercase mb-2">
                  Volunteer Passcode
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter Volunteer Security Passcode"
                  className="w-full neu-inset p-3.5 text-sm text-neu-text focus:outline-none focus:ring-2 focus:ring-neu-green/50"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full neu-btn neu-btn-green py-3.5 text-sm font-extrabold flex items-center justify-center gap-2 shadow-md"
              >
                <span>Open Attendance Scanner</span>
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F2EC]">
      
      {/* Volunteer Secret Header */}
      <header className="w-full bg-[#FAF8F4] border-b border-white/60 py-4 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 neu-inset rounded-xl bg-[#ECE9E1] text-neu-green">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-neu-green uppercase tracking-wider block">
                VOLUNTEER ATTENDANCE PORTAL
              </span>
              <h2 className="text-sm font-extrabold text-neu-text">
                SDG FOCUSED PROJECT EXPO 2026
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("sdg_user_session");
              router.push("/login");
            }}
            className="neu-btn px-3 py-1.5 text-xs font-bold text-neu-red"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-6">
        
        {/* Active Session Status */}
        {activeSession ? (
          <div className="neu-raised p-5 rounded-2xl bg-emerald-50/70 border border-emerald-300 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest block">
                ● ACTIVE ATTENDANCE SESSION
              </span>
              <h3 className="text-base font-extrabold text-emerald-900">{activeSession.name}</h3>
            </div>
            <span className="neu-badge text-emerald-700 font-bold text-xs bg-white">READY TO SCAN</span>
          </div>
        ) : (
          <div className="neu-raised p-8 rounded-3xl bg-amber-50/80 border border-amber-300 text-center space-y-3">
            <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto" />
            <h2 className="text-xl font-extrabold text-amber-900">NO ACTIVE ATTENDANCE SESSION</h2>
            <p className="text-xs font-medium text-amber-700 max-w-sm mx-auto">
              Please wait for the event administrator to start an attendance session before scanning teams.
            </p>
          </div>
        )}

        {/* ACTIVE SESSION WORKFLOW */}
        {activeSession && (
          <>
            {/* SUCCESS BANNER */}
            {successMsg ? (
              <div className="neu-raised p-8 rounded-3xl bg-emerald-50 text-center space-y-6 border border-emerald-300">
                <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto animate-bounce" />
                <div>
                  <h2 className="text-2xl font-extrabold text-emerald-900">✓ ATTENDANCE SUBMITTED</h2>
                  <p className="text-sm font-semibold text-emerald-700 mt-1">
                    Team <strong>{scannedTeam?.id}</strong> ({scannedTeam?.teamName}) marked successfully.
                  </p>
                </div>

                <button
                  onClick={resetScanner}
                  className="w-full neu-btn neu-btn-green py-4 rounded-2xl text-base font-extrabold shadow-lg"
                >
                  [ SCAN NEXT TEAM ]
                </button>
              </div>
            ) : !scannedTeam ? (
              /* SCANNING & SEARCH SELECTION */
              <div className="neu-raised p-6 rounded-3xl space-y-6">
                
                {/* Search Toggle Header */}
                <div className="flex neu-inset p-1.5 rounded-2xl bg-[#ECE9E1]">
                  <button
                    onClick={() => setSearchMode(false)}
                    className={`flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                      !searchMode ? "neu-btn text-neu-gold" : "text-neu-muted"
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    Scan Team QR
                  </button>
                  <button
                    onClick={() => setSearchMode(true)}
                    className={`flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                      searchMode ? "neu-btn text-neu-gold" : "text-neu-muted"
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    Search Team Manually
                  </button>
                </div>

                {/* ERROR NOTIFICATION */}
                {errorMsg && (
                  <div className="neu-raised p-4 rounded-2xl bg-red-50 border border-red-300 text-red-800 text-xs font-bold flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* QR CAMERA SCANNER */}
                {!searchMode && (
                  <div className="space-y-4 text-center">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                      <div>
                        <h4 className="text-xs font-extrabold text-neu-text uppercase tracking-wider">Continuous Camera Scanner</h4>
                        <p className="text-[11px] text-neu-muted">Scans participant QR codes automatically</p>
                      </div>

                      {isCameraOn ? (
                        <button
                          onClick={turnOffCamera}
                          className="neu-btn px-3.5 py-2 text-xs font-extrabold text-red-600 hover:text-red-800 flex items-center justify-center gap-1.5 shadow-sm rounded-xl"
                        >
                          <VideoOff className="w-4 h-4 text-red-600" />
                          <span>Turn Off Camera</span>
                        </button>
                      ) : (
                        <button
                          onClick={turnOnCamera}
                          className="neu-btn neu-btn-gold px-4 py-2 text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md rounded-xl"
                        >
                          <Video className="w-4 h-4 text-neu-text" />
                          <span>Turn On Camera</span>
                        </button>
                      )}
                    </div>

                    {isCameraOn ? (
                      <div className="w-full overflow-hidden rounded-2xl neu-inset p-3 bg-[#ECE9E1] border border-neu-gold/30">
                        <div id="qr-reader" className="w-full rounded-xl overflow-hidden min-h-[260px]" />
                      </div>
                    ) : (
                      <div className="neu-inset p-8 rounded-2xl bg-[#ECE9E1] text-center space-y-4 border border-neu-text/10">
                        <VideoOff className="w-12 h-12 text-neu-muted mx-auto opacity-50" />
                        <div>
                          <h4 className="text-sm font-extrabold text-neu-text">Camera Scanner Paused</h4>
                          <p className="text-xs text-neu-muted mt-1">Tap below to activate live continuous camera feed.</p>
                        </div>
                        <button
                          onClick={turnOnCamera}
                          className="neu-btn neu-btn-gold px-6 py-3 rounded-xl text-xs font-extrabold inline-flex items-center gap-2 shadow-md"
                        >
                          <Video className="w-4 h-4" />
                          <span>TURN ON CAMERA</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* MANUAL TEAM SEARCH */}
                {searchMode && (
                  <form onSubmit={handleManualSearch} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-neu-muted uppercase mb-2">
                        Enter Team ID, Team Name, Reg Number, or Name
                      </label>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="e.g. SDG-001 or 23CSE1001 or Krishna"
                        className="w-full neu-inset p-4 text-sm font-semibold text-neu-text placeholder:text-neu-muted/50 focus:outline-none focus:ring-2 focus:ring-neu-gold/50"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full neu-btn neu-btn-gold py-3.5 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      SEARCH TEAM
                    </button>
                  </form>
                )}

              </div>
            ) : (
              /* MARK ATTENDANCE FOR SCANNED TEAM */
              <div className="neu-raised p-6 rounded-3xl space-y-6">
                
                {/* Team Info Header */}
                <div className="flex items-center justify-between pb-4 border-b border-neu-text/10">
                  <div>
                    <span className="neu-badge text-neu-gold font-extrabold text-xs">{scannedTeam.id}</span>
                    <h2 className="text-xl font-extrabold text-neu-text mt-1">{scannedTeam.teamName}</h2>
                  </div>

                  <button
                    onClick={resetScanner}
                    className="neu-btn p-2 text-neu-muted text-xs font-bold flex items-center gap-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Rescan
                  </button>
                </div>

                {/* Duplicate Notice */}
                {isDuplicate && (
                  <div className="neu-raised p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <p className="font-extrabold">Attendance Already Submitted</p>
                      <p className="font-normal mt-0.5">Attendance for this team has already been recorded in this active session.</p>
                    </div>
                  </div>
                )}

                {/* Team Members Attendance Marking Toggles */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold text-neu-gold uppercase tracking-wider">
                    MARK MEMBER ATTENDANCE
                  </h3>

                  <div className="space-y-3">
                    {scannedTeam.members.map((member: TeamMember) => {
                      const isPresent = memberStatusMap[member.regNo] === "PRESENT";

                      return (
                        <div
                          key={member.regNo}
                          className="neu-inset p-4 rounded-2xl bg-[#ECE9E1] flex items-center justify-between gap-4"
                        >
                          <div>
                            <h4 className="text-sm font-extrabold text-neu-text">{member.name}</h4>
                            <p className="text-xs text-neu-muted font-semibold">
                              {member.regNo} • {member.department} ({member.year})
                            </p>
                          </div>

                          {/* Large Mobile Touch Toggle Button */}
                          <button
                            type="button"
                            onClick={() => toggleMemberStatus(member.regNo)}
                            disabled={isDuplicate}
                            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all shadow-md ${
                              isPresent
                                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                : "bg-red-600 text-white hover:bg-red-700"
                            } disabled:opacity-50`}
                          >
                            {isPresent ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>PRESENT</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4" />
                                <span>ABSENT</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Attendance Button */}
                <button
                  onClick={handleSubmitAttendance}
                  disabled={isDuplicate}
                  className="w-full neu-btn neu-btn-green py-4 rounded-2xl text-base font-extrabold flex items-center justify-center gap-2 shadow-lg disabled:opacity-40"
                >
                  <Send className="w-5 h-5" />
                  <span>SUBMIT ATTENDANCE</span>
                </button>
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}
