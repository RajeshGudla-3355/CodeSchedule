import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '../services/api';
import { getMe } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cs_token'));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('cs_user');
    try {
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(!!token && !user);

  useEffect(() => {
    if (token && !user) {
      setLoading(true);
      getMe()
        .then((u) => {
          setUser(u);
          localStorage.setItem('cs_user', JSON.stringify(u));
        })
        .catch(() => {
          localStorage.removeItem('cs_token');
          localStorage.removeItem('cs_user');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    }
  }, [token, user]);

  function login(nextToken: string, nextUser: User) {
    localStorage.setItem('cs_token', nextToken);
    localStorage.setItem('cs_user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }

  function logout() {
    localStorage.removeItem('cs_token');
    localStorage.removeItem('cs_user');
    setToken(null);
    setUser(null);
  }

  function updateUser(next: User) {
    setUser(next);
    localStorage.setItem('cs_user', JSON.stringify(next));
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, setUser: updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
