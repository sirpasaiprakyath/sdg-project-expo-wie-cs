export type UserRole = 'participant' | 'volunteer' | 'reviewer' | 'admin';

export interface TeamMember {
  name: string;
  regNo: string;
  email: string;
  department: string;
  year: string;
}

export interface Team {
  id: string; // Exact CSV Team ID e.g., "SDG-001"
  teamName: string;
  members: TeamMember[];
  qrToken: string; // Permanent opaque secure token
  createdAt: string;
  problemStatementSubmitted: boolean;
  pptSubmitted: boolean;
  pptUrl?: string;
  pptSubmittedAt?: string;
}

export type SDGGoalKey = 'SDG_3' | 'SDG_4' | 'SDG_9' | 'SDG_11' | 'SDG_13';

export interface SDGGoalInfo {
  key: SDGGoalKey;
  id: number;
  title: string;
  subtitle: string;
  color: string;
  iconName: string;
}

export const ALLOWED_SDGS: SDGGoalInfo[] = [
  {
    key: 'SDG_3',
    id: 3,
    title: 'SDG 3 — GOOD HEALTH AND WELL-BEING',
    subtitle: 'Ensure healthy lives and promote well-being for all at all ages',
    color: '#4C9F38',
    iconName: 'HeartPulse',
  },
  {
    key: 'SDG_4',
    id: 4,
    title: 'SDG 4 — QUALITY EDUCATION',
    subtitle: 'Ensure inclusive and equitable quality education and promote lifelong learning',
    color: '#C5192D',
    iconName: 'GraduationCap',
  },
  {
    key: 'SDG_9',
    id: 9,
    title: 'SDG 9 — INDUSTRY, INNOVATION AND INFRASTRUCTURE',
    subtitle: 'Build resilient infrastructure, promote inclusive and sustainable industrialization',
    color: '#FD6925',
    iconName: 'Lightbulb',
  },
  {
    key: 'SDG_11',
    id: 11,
    title: 'SDG 11 — SUSTAINABLE CITIES AND COMMUNITIES',
    subtitle: 'Make cities and human settlements inclusive, safe, resilient and sustainable',
    color: '#FD9D24',
    iconName: 'Building2',
  },
  {
    key: 'SDG_13',
    id: 13,
    title: 'SDG 13 — CLIMATE ACTION',
    subtitle: 'Take urgent action to combat climate change and its impacts',
    color: '#3F7E44',
    iconName: 'Leaf',
  },
];

export const TECH_STACK_OPTIONS = [
  'React',
  'Next.js',
  'Node.js',
  'Express.js',
  'Python',
  'Java',
  'Flutter',
  'React Native',
  'Firebase',
  'MongoDB',
  'PostgreSQL',
  'MySQL',
  'TensorFlow',
  'PyTorch',
  'OpenCV',
  'Arduino',
  'ESP32',
  'IoT',
  'AI/ML',
  'Cloud',
  'Blockchain',
  'Other',
];

export interface ProblemStatement {
  teamId: string;
  teamName: string;
  title: string;
  sdgs: string[];
  problemDescription: string;
  proposedSolution: string;
  keyInnovation: string;
  expectedImpact: string;
  techStack: string[];
  otherTech?: string | null;
  updatedAt: string;
}

export interface AttendanceSession {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  closedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  sessionName: string;
  teamId: string;
  teamName: string;
  memberRegNo: string;
  memberName: string;
  status: 'PRESENT' | 'ABSENT';
  markedAt: string;
  volunteerId?: string;
}

export interface ReviewRound {
  id: string;
  roundNumber: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  closedAt?: string;
}

export interface ReviewerEvaluation {
  id: string;
  roundId: string;
  roundName: string;
  roundNumber: number;
  teamId: string;
  teamName: string;
  reviewerId: string;
  reviewerName: string;
  marks: number; // 0 to 100
  comments?: string;
  updatedAt: string;
}

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  teamId?: string;
  memberInfo?: TeamMember;
}

export interface SiteLaunchState {
  isReadyForLaunch: boolean;
  isLaunched: boolean;
  launchedAt?: string;
}
