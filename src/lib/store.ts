import { Team, AttendanceSession, AttendanceRecord, ProblemStatement, ReviewerEvaluation, ReviewRound, SiteLaunchState } from './types';
import { SEEDED_TEAMS } from './seeded-teams';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

// Local storage keys
const TEAMS_KEY = 'sdg_expo_teams';
const SESSIONS_KEY = 'sdg_expo_sessions';
const ATTENDANCE_KEY = 'sdg_expo_attendance';
const PROBLEMS_KEY = 'sdg_expo_problems';
const EVALS_KEY = 'sdg_expo_evals';
const LAUNCH_KEY = 'sdg_expo_site_launch';

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

export function saveSessions(sessions: AttendanceSession[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function deleteSession(sessionId: string): AttendanceSession[] {
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
  localStorage.removeItem(SESSIONS_KEY);
  localStorage.removeItem(ATTENDANCE_KEY);
  localStorage.removeItem(PROBLEMS_KEY);
  localStorage.removeItem(EVALS_KEY);
  localStorage.removeItem(LAUNCH_KEY);
  
  const cleanTeams = SEEDED_TEAMS.map((t) => ({
    ...t,
    problemStatementSubmitted: false,
    pptSubmitted: false,
    pptUrl: '',
    pptSubmittedAt: undefined,
  }));
  saveTeams(cleanTeams);
}

export function getSiteLaunchState(): SiteLaunchState {
  if (typeof window === 'undefined') {
    return { isReadyForLaunch: false, isLaunched: false };
  }
  const stored = localStorage.getItem(LAUNCH_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing site launch state', e);
    }
  }
  return { isReadyForLaunch: false, isLaunched: false };
}

export function saveSiteLaunchState(state: SiteLaunchState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAUNCH_KEY, JSON.stringify(state));
  try {
    const launchDocRef = doc(db, 'config', 'site_launch');
    setDoc(launchDocRef, state, { merge: true }).catch((err) => {
      console.warn('Firestore launch sync warning:', err);
    });
  } catch (e) {
    console.warn('Firestore launch state error:', e);
  }
}

export function subscribeGlobalLaunchState(onChange: (state: SiteLaunchState) => void) {
  if (typeof window === 'undefined') return () => {};

  // First emit local state immediately
  const local = getSiteLaunchState();
  onChange(local);

  try {
    const launchDocRef = doc(db, 'config', 'site_launch');
    const unsubscribe = onSnapshot(
      launchDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as SiteLaunchState;
          localStorage.setItem(LAUNCH_KEY, JSON.stringify(data));
          onChange(data);
        }
      },
      (err) => {
        console.warn('Firestore launch listener warning:', err);
      }
    );
    return unsubscribe;
  } catch (e) {
    console.warn('Firestore launch listener error:', e);
    return () => {};
  }
}
