// lib/protected-route.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";
import type { UserRole } from "./types";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: UserRole;
    allowedRoles?: UserRole[];
    fallbackPath?: string;
}

export function ProtectedRoute({
    children,
    requiredRole,
    allowedRoles,
    fallbackPath = "/login",
}: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Không có user, redirect về login
                router.replace(fallbackPath);
                return;
            }

            // Check single role (backward compatible)
            if (requiredRole && user.role !== requiredRole) {
                router.replace("/");
                return;
            }

            // Check multiple allowed roles
            if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role as UserRole)) {
                router.replace("/");
                return;
            }
        }
    }, [user, loading, requiredRole, allowedRoles, fallbackPath, router]);

    // Hiển thị loading spinner trong khi check auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 rounded-full border-4 border-slate-200 border-t-blue-600 mx-auto mb-4" />
                    <p className="text-slate-500">Đang tải...</p>
                </div>
            </div>
        );
    }

    // Nếu không có user, không render children
    if (!user) {
        return null;
    }

    // Check roles
    if (requiredRole && user.role !== requiredRole) {
        return null;
    }

    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role as UserRole)) {
        return null;
    }

    return <>{children}</>;
}
