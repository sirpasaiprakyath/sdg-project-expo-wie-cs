import { Team, AttendanceSession, AttendanceRecord, ProblemStatement, ReviewerEvaluation, ReviewRound } from './types';
import { SEEDED_TEAMS } from './seeded-teams';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

// Local storage keys
const TEAMS_KEY = 'sdg_expo_teams';
const SESSIONS_KEY = 'sdg_expo_sessions';
const ATTENDANCE_KEY = 'sdg_expo_attendance';
const PROBLEMS_KEY = 'sdg_expo_problems';
const EVALS_KEY = 'sdg_expo_evals';

// Ensure 30 registered teams are cleanly loaded with 0 demo submissions
export function getInitialTeams(): Team[] {
  if (typeof window === 'undefined') return SEEDED_TEAMS;
  
  // Always start with clean 30 teams with zero demo submissions
  const stored = localStorage.getItem(TEAMS_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Enforce zero demo data for SDG-001 if it was previously seeded
        const cleaned = parsed.map((t) => {
          if (t.id === 'SDG-001') {
            return {
              ...t,
              problemStatementSubmitted: false,
              pptSubmitted: false,
              pptUrl: '',
              pptSubmittedAt: undefined,
            };
          }
          return t;
        });
        saveTeams(cleaned);
        return cleaned;
      }
    } catch (e) {
      console.error('Error parsing stored teams', e);
    }
  }

  // Clean initial seeded teams (zero demo problem statements or PPTs)
  const cleanTeams = SEEDED_TEAMS.map((t) => ({
    ...t,
    problemStatementSubmitted: false,
    pptSubmitted: false,
    pptUrl: '',
    pptSubmittedAt: undefined,
  }));
  saveTeams(cleanTeams);

  // Clear demo problem statements
  localStorage.removeItem(PROBLEMS_KEY);

  return cleanTeams;
}

export function saveTeams(teams: Team[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
}

export function getSessions(): AttendanceSession[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(SESSIONS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing sessions', e);
    }
  }
  return [];
}

const DELETED_SESSIONS_KEY = 'sdg_expo_deleted_sessions';

export function getDeletedSessionIds(): string[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(DELETED_SESSIONS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing deleted sessions', e);
    }
  }
  return [];
}

export function saveSessions(sessions: AttendanceSession[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  try {
    const sessionsDocRef = doc(db, 'config', 'attendance_sessions');
    setDoc(sessionsDocRef, { sessions }, { merge: true }).catch((err) => {
      console.warn('Firestore saveSessions error:', err);
    });
  } catch (e) {
    console.warn('Firestore saveSessions error:', e);
  }
}

export function subscribeSessions(onChange: (sessions: AttendanceSession[]) => void) {
  if (typeof window === 'undefined') return () => {};

  const local = getSessions();
  onChange(local);

  try {
    const sessionsDocRef = doc(db, 'config', 'attendance_sessions');
    const unsubscribe = onSnapshot(
      sessionsDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data?.sessions)) {
            const remoteSessions = data.sessions as AttendanceSession[];
            const localSessions = getSessions();
            const deletedIds = new Set(getDeletedSessionIds());

            const sessionMap = new Map<string, AttendanceSession>();
            // Remote sessions take priority (if not explicitly deleted locally)
            remoteSessions.forEach((s) => {
              if (!deletedIds.has(s.id)) {
                sessionMap.set(s.id, s);
              }
            });
            // Local sessions preserved if missing from remote snapshot
            localSessions.forEach((s) => {
              if (!deletedIds.has(s.id) && !sessionMap.has(s.id)) {
                sessionMap.set(s.id, s);
              }
            });

            const merged = Array.from(sessionMap.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            localStorage.setItem(SESSIONS_KEY, JSON.stringify(merged));
            onChange(merged);

            // If local sessions had new sessions remote was missing, sync to Firestore
            if (merged.length > remoteSessions.length) {
              setDoc(sessionsDocRef, { sessions: merged }, { merge: true }).catch(() => {});
            }
          }
        }
      },
      (err) => {
        console.warn('Firestore sessions listener warning:', err);
      }
    );
    return unsubscribe;
  } catch (e) {
    console.warn('Firestore sessions listener error:', e);
    return () => {};
  }
}

export function deleteSession(sessionId: string): AttendanceSession[] {
  // Mark as deleted so merger doesn't resurrect it
  if (typeof window !== 'undefined') {
    const deleted = getDeletedSessionIds();
    if (!deleted.includes(sessionId)) {
      localStorage.setItem(DELETED_SESSIONS_KEY, JSON.stringify([...deleted, sessionId]));
    }
  }

  const sessions = getSessions();
  const updatedSessions = sessions.filter((s) => s.id !== sessionId);
  saveSessions(updatedSessions);

  // Also clean up attendance records for this deleted session
  const records = getAttendanceRecords();
  const updatedRecords = records.filter((r) => r.sessionId !== sessionId);
  saveAttendanceRecords(updatedRecords);

  return updatedSessions;
}

export function getActiveSession(): AttendanceSession | null {
  const sessions = getSessions();
  return sessions.find(s => s.isActive) || null;
}

export function getAttendanceRecords(): AttendanceRecord[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(ATTENDANCE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing attendance records', e);
    }
  }
  return [];
}

export function saveAttendanceRecords(records: AttendanceRecord[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
  try {
    const attDocRef = doc(db, 'config', 'attendance_records');
    setDoc(attDocRef, { records }, { merge: true }).catch((err) => {
      console.warn('Firestore saveAttendanceRecords error:', err);
    });
  } catch (e) {
    console.warn('Firestore saveAttendanceRecords error:', e);
  }
}

export function subscribeAttendanceRecords(onChange: (records: AttendanceRecord[]) => void) {
  if (typeof window === 'undefined') return () => {};

  const local = getAttendanceRecords();
  onChange(local);

  try {
    const attDocRef = doc(db, 'config', 'attendance_records');
    const unsubscribe = onSnapshot(
      attDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data?.records)) {
            const remoteRecords = data.records as AttendanceRecord[];
            const localRecords = getAttendanceRecords();

            const recordMap = new Map<string, AttendanceRecord>();
            remoteRecords.forEach((r) => recordMap.set(r.id, r));
            localRecords.forEach((r) => {
              if (!recordMap.has(r.id)) {
                recordMap.set(r.id, r);
              }
            });

            const merged = Array.from(recordMap.values());
            localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(merged));
            onChange(merged);

            if (merged.length > remoteRecords.length) {
              setDoc(attDocRef, { records: merged }, { merge: true }).catch(() => {});
            }
          }
        }
      },
      (err) => {
        console.warn('Firestore attendance records listener warning:', err);
      }
    );
    return unsubscribe;
  } catch (e) {
    console.warn('Firestore attendance records listener error:', e);
    return () => {};
  }
}

export function clearAllAttendanceSessions(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSIONS_KEY);
  localStorage.removeItem(ATTENDANCE_KEY);
  localStorage.removeItem(DELETED_SESSIONS_KEY);
  try {
    const sessionsDocRef = doc(db, 'config', 'attendance_sessions');
    setDoc(sessionsDocRef, { sessions: [] }).catch((err) => console.warn('Firestore clear error:', err));
    const attDocRef = doc(db, 'config', 'attendance_records');
    setDoc(attDocRef, { records: [] }).catch((err) => console.warn('Firestore clear error:', err));
  } catch (e) {
    console.warn('Error clearing attendance Firestore docs:', e);
  }
}

export function getProblemStatements(): Record<string, ProblemStatement> {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(PROBLEMS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing problem statements', e);
    }
  }
  return {};
}

export function saveProblemStatement(ps: ProblemStatement): void {
  const existing = getProblemStatements();
  existing[ps.teamId] = ps;
  if (typeof window !== 'undefined') {
    localStorage.setItem(PROBLEMS_KEY, JSON.stringify(existing));
  }
}

const ROUNDS_KEY = 'sdg_expo_rounds';

export function getReviewRounds(): ReviewRound[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(ROUNDS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing review rounds', e);
    }
  }
  return [];
}

export function saveReviewRounds(rounds: ReviewRound[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ROUNDS_KEY, JSON.stringify(rounds));
}

export function getEvaluations(): ReviewerEvaluation[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(EVALS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing evaluations', e);
    }
  }
  return [];
}

export function saveEvaluation(evaluation: ReviewerEvaluation): void {
  const evals = getEvaluations();
  const idx = evals.findIndex(
    (e) => e.teamId === evaluation.teamId && e.roundId === evaluation.roundId && e.reviewerId === evaluation.reviewerId
  );
  if (idx !== -1) {
    evals[idx] = evaluation;
  } else {
    evals.push(evaluation);
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(EVALS_KEY, JSON.stringify(evals));
  }
}

// Clear all demo data completely from local storage
export function clearAllDemoData(): void {
  if (typeof window === 'undefined') return;
  clearAllAttendanceSessions();
  localStorage.removeItem(PROBLEMS_KEY);
  localStorage.removeItem(EVALS_KEY);
  
  const cleanTeams = SEEDED_TEAMS.map((t) => ({
    ...t,
    problemStatementSubmitted: false,
    pptSubmitted: false,
    pptUrl: '',
    pptSubmittedAt: undefined,
  }));
  saveTeams(cleanTeams);
}
