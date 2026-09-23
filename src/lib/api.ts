import type { Role } from './auth';

export const BACKEND_URL = '';

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const token = localStorage.getItem('token') || localStorage.getItem('placement_ops_token') || 'usr_demo_01';
  headers.set('Authorization', `Bearer ${token}`);

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return fetch(cleanPath, { ...options, headers });
}

export type SyncedProfile =
  | { role: 'student'; profile_id: string; student_id: number; email: string; name: string; profile_complete: boolean }
  | { role: 'recruiter'; profile_id: string; email: string }
  | { role: 'tpo'; profile_id: string; email: string }
  | { role: 'faculty'; profile_id: string; email: string };

export async function syncProfile(role: Role): Promise<SyncedProfile> {
  const res = await apiFetch('/auth/sync-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail?.detail || 'Failed to sync profile with backend.');
  }
  return res.json();
}
