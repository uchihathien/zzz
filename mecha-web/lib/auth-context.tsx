// lib/auth-context.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL, UserDto, AuthResponse, postJson } from "./api";

interface AuthContextType {
  user: UserDto | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);

  // Hàm lấy thông tin user từ backend
  const fetchUser = useCallback(async () => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token")
          : null;

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!res.ok) {
        // Token không hợp lệ, thử refresh
        await attemptRefresh();
        return;
      }

      const userData: UserDto = await res.json();
      setUser(userData);

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Hàm refresh token
  const attemptRefresh = useCallback(async () => {
    try {
      const refreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem("refresh_token")
          : null;

      if (!refreshToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      const data = await postJson<{ refreshToken: string }, AuthResponse>(
        "/api/auth/refresh",
        { refreshToken }
      );

      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", data.accessToken);
        localStorage.setItem("refresh_token", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      setUser(data.user);
    } catch (error) {
      console.error("Failed to refresh token:", error);
      // Clear all auth data
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load user khi mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Hàm login
  const login = useCallback(
    async (email: string, password: string) => {
      const data = await postJson<
        { email: string; password: string },
        AuthResponse
      >("/api/auth/login", { email, password });

      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", data.accessToken);
        localStorage.setItem("refresh_token", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      setUser(data.user);
      router.push("/");
    },
    [router]
  );

  // Hàm register
  const register = useCallback(
    async (formData: {
      fullName: string;
      email: string;
      password: string;
      phone?: string;
    }) => {
      const data = await postJson<typeof formData, AuthResponse>(
        "/api/auth/register",
        formData
      );

      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", data.accessToken);
        localStorage.setItem("refresh_token", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      setUser(data.user);
      router.push("/");
    },
    [router]
  );

  // Hàm logout
  const logout = useCallback(async () => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token")
          : null;

      // Call backend logout endpoint
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage regardless of backend response
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
      }

      setUser(null);
      router.push("/login");
    }
  }, [router]);

  // Hàm refresh user data
  const refreshUserData = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUserData,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
