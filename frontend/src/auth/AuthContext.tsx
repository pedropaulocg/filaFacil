import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthUser } from '../types';
import { login as apiLogin, register as apiRegister, fetchMe } from '../api/auth';
import { storeToken, clearToken, getStoredToken } from '../api/client';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getStoredToken()) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then(setUser)
      .catch(() => {
        clearToken();
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function login(email: string, password: string): Promise<void> {
    const result = await apiLogin(email, password);
    storeToken(result.token);
    setUser(result.user);
  }

  async function register(name: string, email: string, password: string): Promise<void> {
    const result = await apiRegister(name, email, password);
    storeToken(result.token);
    setUser(result.user);
  }

  function logout(): void {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
