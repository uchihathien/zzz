// app/dashboard/page.tsx - Dashboard with White/Blue Theme
"use client";

import { useAuth } from "@/lib/auth-context";
import { ProtectedRoute } from "@/lib/protected-route";
import Link from "next/link";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";

function DashboardContent() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                    <p className="text-slate-500">Quản lý tài khoản và hoạt động của bạn</p>
                </div>

                <div className="grid gap-6">
                    {/* Account Info */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Thông tin tài khoản
                        </h2>
                        <div className="space-y-3">
                            <InfoRow label="Họ tên" value={user?.fullName || "—"} />
                            <InfoRow label="Email" value={user?.email || "—"} />
                            {user?.phone && <InfoRow label="Điện thoại" value={user.phone} />}
                            <InfoRow label="Vai trò" value={getRoleLabel(user?.role)} />
                            <InfoRow label="Đăng nhập qua" value={user?.provider === "GOOGLE" ? "Google" : "Tài khoản"} />
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4">Truy cập nhanh</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <QuickLink href="/orders/my" icon="📦" label="Đơn hàng" />
                            <QuickLink href="/bookings/my" icon="📅" label="Lịch đặt" />
                            <QuickLink href="/cart" icon="🛒" label="Giỏ hàng" />
                            <QuickLink href="/shipping-addresses" icon="📍" label="Địa chỉ" />
                            <QuickLink href="/products" icon="🔧" label="Sản phẩm" />
                            <QuickLink href="/services" icon="🛠️" label="Dịch vụ" />
                        </div>
                    </div>

                    {/* Logout Button */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 font-medium transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between py-2 border-b border-slate-100 last:border-0">
            <span className="text-slate-500">{label}</span>
            <span className="font-medium text-slate-700">{value}</span>
        </div>
    );
}

function QuickLink({ href, icon, label }: { href: string; icon: string; label: string }) {
    return (
        <Link
            href={href}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition-colors"
        >
            <span className="text-2xl">{icon}</span>
            <span className="text-sm font-medium text-slate-700">{label}</span>
        </Link>
    );
}

function getRoleLabel(role?: string): string {
    const labels: Record<string, string> = {
        USER: "Khách hàng",
        STAFF: "Nhân viên",
        TECHNICIAN: "Kỹ thuật viên",
        ADMIN: "Quản trị viên",
    };
    return labels[role || ""] || role || "—";
}

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    );
}
