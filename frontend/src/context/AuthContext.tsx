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
  institution?: string;
  institution_tier?: number;
  graduation_year?: number;
  gpa?: number;
  target_career_id?: string;
  target_career_title?: string;
  weekly_study_hours?: number;
  learning_velocity_index?: number;
  skills: any[];
  projects_count: number;
  certifications_count: number;
}

interface AuthContextType {
  user: User | null;
  profile: StudentProfileData | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
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

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await studentApi.getProfile();
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          setUser(res.data);
          await refreshProfile();
        } catch (err) {
          console.error('Session expired:', err);
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (credentials: any) => {
    const res = await authApi.login(credentials);
    const { access_token, user: userData } = res.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    await refreshProfile();
  };

  const register = async (data: any) => {
    const res = await authApi.register(data);
    const { access_token, user: userData } = res.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    await refreshProfile();
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
        logout,
        refreshProfile,
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
