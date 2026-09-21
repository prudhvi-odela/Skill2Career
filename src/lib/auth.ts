export type Role = 'student' | 'recruiter' | 'tpo' | 'faculty' | 'hod' | 'principal';

export interface Profile {
  id: string;
  role: Role;
  name: string | null;
  email: string | null;
  phone?: string | null;
  company?: string | null;
  branch?: string | null;
  cgpa?: number | null;
  api_score?: number | null;
  ssi_score?: number | null;
  prs_score?: number | null;
}

const STORAGE_KEY = 'placement_ops_current_user';

export async function signUpWithEmail(email: string, _password: string, name: string, role: Role) {
  const profile: Profile = {
    id: `usr_${Date.now()}`,
    role,
    name,
    email,
    branch: 'CSE',
    cgpa: 9.0,
    api_score: 88,
    ssi_score: 80,
    prs_score: 75
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  return { user: profile, session: { user: profile, access_token: profile.id } };
}

export async function signInWithEmail(email: string, _password: string) {
  const role: Role = email.includes('recruiter') ? 'recruiter' : email.includes('tpo') ? 'tpo' : 'student';
  const profile: Profile = {
    id: `usr_${Date.now()}`,
    role,
    name: email.split('@')[0].replace(/[._]/g, ' '),
    email,
    branch: 'CSE',
    cgpa: 9.0,
    api_score: 88,
    ssi_score: 80,
    prs_score: 75
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  return { user: profile, session: { user: profile, access_token: profile.id } };
}

export async function signOut() {
  localStorage.removeItem(STORAGE_KEY);
}

export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('getProfile fallback:', e);
  }
  return {
    id: userId || 'demo-student',
    role: 'student',
    name: 'Aditya Sharma',
    email: 'aditya.sharma@example.com',
    branch: 'CSE',
    cgpa: 9.2,
    api_score: 91.2,
    ssi_score: 80.0,
    prs_score: 75.0
  };
}

export async function ensureProfile(userId: string, email: string | null, name: string, role: Role): Promise<Profile> {
  const p: Profile = {
    id: userId,
    email,
    name,
    role,
    branch: 'CSE',
    cgpa: 9.2,
    api_score: 91.2,
    ssi_score: 80.0,
    prs_score: 75.0
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  return p;
}
