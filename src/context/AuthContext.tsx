import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, studentApi } from '../api/client';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  profile_id?: string;
}

export interface StudentProfileData {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  headline?: string;
  bio?: string;
  degree?: string;
  branch?: string;
  major_or_branch?: string;
  academic_year?: string;
  institution?: string;
  institution_tier?: number;
  graduation_year?: number;
  gpa?: number;
  target_career_id?: string;
  target_career_title?: string;
  weekly_study_hours?: number;
  learning_velocity_index?: number;
  skills: any[];
  interests?: string[];
  projects_count: number;
  certifications_count: number;
  experiences_count?: number;
  onboarded?: boolean;
  resume_name?: string;
  resume_ats_score?: number;
}

interface AuthContextType {
  user: User | null;
  profile: StudentProfileData | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  oauthLogin: (data: { provider: string; email: string; full_name?: string; avatar_url?: string }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async (currentToken?: string) => {
    const activeToken = currentToken || token || localStorage.getItem('token');
    if (!activeToken) return;
    try {
      const res = await studentApi.getProfile();
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken) {
        // If we already have storedUser in state/localStorage, keep user authenticated immediately
        if (storedUser && !user) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.warn('Could not parse stored user:', e);
          }
        }

        try {
          const res = await authApi.getMe();
          if (isMounted && res.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
          await refreshProfile(storedToken);
        } catch (err: any) {
          console.warn('Auth sync notice:', err?.response?.data || err.message);
          // Only clear session if the server explicitly returned 401 Unauthorized for the token
          if (err?.response?.status === 401) {
            if (isMounted) logout();
          }
        }
      }
      if (isMounted) setIsLoading(false);
    };

    initAuth();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = async (credentials: any) => {
    const res = await authApi.login(credentials);
    const { access_token, user: userData } = res.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('placement_ops_token', access_token);
    localStorage.setItem('placement_ops_current_user', JSON.stringify({ ...userData, name: userData.full_name }));
    setToken(access_token);
    setUser(userData);
    await refreshProfile(access_token);
  };

  const register = async (data: any) => {
    const res = await authApi.register(data);
    const { access_token, user: userData } = res.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('placement_ops_token', access_token);
    localStorage.setItem('placement_ops_current_user', JSON.stringify({ ...userData, name: userData.full_name }));
    setToken(access_token);
    setUser(userData);
    await refreshProfile(access_token);
  };

  const oauthLogin = async (data: { provider: string; email: string; full_name?: string; avatar_url?: string }) => {
    const res = await authApi.oauthLogin(data);
    const { access_token, user: userData } = res.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('placement_ops_token', access_token);
    localStorage.setItem('placement_ops_current_user', JSON.stringify({ ...userData, name: userData.full_name }));
    setToken(access_token);
    setUser(userData);
    await refreshProfile(access_token);
  };

  const updateProfile = async (data: any) => {
    const res = await studentApi.updateProfile(data);
    setProfile(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('placement_ops_token');
    localStorage.removeItem('placement_ops_current_user');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        oauthLogin,
        logout,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
