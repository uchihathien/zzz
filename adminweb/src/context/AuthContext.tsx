"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/lib/api";
import { getAccessToken, clearTokens } from "@/lib/api/httpClient";
import type { User } from "@/types";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Routes không cần đăng nhập
const publicRoutes = [
    "/signin",
    "/signup",
    "/reset-password",
    "/two-step-verification",
    "/oauth2/callback",
    "/error-404",
    "/error-500",
    "/error-503",
    "/coming-soon",
    "/maintenance",
];

function isPublicRoute(pathname: string): boolean {
    return publicRoutes.some((route) => pathname.startsWith(route));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        const token = getAccessToken();
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            console.error("Failed to get user:", error);
            setUser(null);
            clearTokens();
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setUser(null);
            router.push("/signin");
        }
    }, [router]);

    // Initial auth check
    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    // Redirect if not authenticated on protected routes
    useEffect(() => {
        if (!loading && !user && !isPublicRoute(pathname)) {
            router.push("/signin");
        }
    }, [loading, user, pathname, router]);

    // Check role for admin access
    useEffect(() => {
        if (user && !isPublicRoute(pathname)) {
            if (user.role !== "ADMIN" && user.role !== "STAFF") {
                // User doesn't have admin permission
                clearTokens();
                setUser(null);
                router.push("/signin");
            }
        }
    }, [user, pathname, router]);

    const value: AuthContextType = {
        user,
        loading,
        isAuthenticated: !!user,
        logout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export default AuthProvider;
