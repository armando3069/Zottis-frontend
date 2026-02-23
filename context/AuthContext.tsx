"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  type AuthUser,
  type LoginPayload,
  type SignupPayload,
  clearToken,
  getCurrentUser,
  getToken,
  login as authLogin,
  logout as authLogout,
  signup as authSignup,
  startGoogleLogin as authStartGoogleLogin,
  startSlackLogin as authStartSlackLogin,
} from "@/services/auth";

// ── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  startGoogleLogin: () => void;
  loginWithSlack: () => void;
}

// ── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: load token from localStorage and fetch the current user.
  useEffect(() => {
    const stored = getToken();
    if (!stored) {
      setIsLoading(false);
      return;
    }

    setToken(stored);
    getCurrentUser()
      .then(setUser)
      .catch(() => {
        // Token is invalid or expired — clear it.
        clearToken();
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const refreshUser = useCallback(async () => {
    const currentToken = getToken();
    if (!currentToken) return;
    setToken(currentToken);
    const freshUser = await getCurrentUser();
    setUser(freshUser);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const newToken = await authLogin(payload);
    setToken(newToken);
    const freshUser = await getCurrentUser();
    setUser(freshUser);
  }, []);

  const signup = useCallback(async (payload: SignupPayload) => {
    const newToken = await authSignup(payload);
    setToken(newToken);
    const freshUser = await getCurrentUser();
    setUser(freshUser);
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setToken(null);
    setUser(null);
  }, []);

  const startGoogleLogin = useCallback(() => {
    authStartGoogleLogin();
  }, []);

  const loginWithSlack = useCallback(() => {
    authStartSlackLogin();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshUser,
        startGoogleLogin,
        loginWithSlack,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}