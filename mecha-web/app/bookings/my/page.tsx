// app/bookings/my/page.tsx - My Bookings with White/Blue Theme
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/lib/protected-route";
import { getMyBookings } from "@/lib/bookings-api";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import type { BookingDto, BookingStatus } from "@/lib/types";
import { formatPrice } from "@/lib/services-api";

function MyBookingsContent() {
    const [bookings, setBookings] = useState<BookingDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<BookingStatus | "ALL">("ALL");

    useEffect(() => {
        loadBookings();
    }, []);

    async function loadBookings() {
        try {
            setLoading(true);
            setError(null);
            const data = await getMyBookings();
            setBookings(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Không thể tải danh sách booking");
        } finally {
            setLoading(false);
        }
    }

    const filteredBookings = filter === "ALL"
        ? bookings
        : bookings.filter(b => b.status === filter);

    const statuses: Array<BookingStatus | "ALL"> = ["ALL", "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

    function getStatusLabel(status: BookingStatus | "ALL"): string {
        const labels: Record<BookingStatus | "ALL", string> = {
            ALL: "Tất cả",
            PENDING: "Chờ xác nhận",
            CONFIRMED: "Đã xác nhận",
            IN_PROGRESS: "Đang thực hiện",
            COMPLETED: "Hoàn thành",
            CANCELLED: "Đã hủy",
        };
        return labels[status];
    }

    function getStatusColor(status: BookingStatus): string {
        const colors: Record<BookingStatus, string> = {
            PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
            CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
            IN_PROGRESS: "bg-purple-100 text-purple-700 border-purple-200",
            COMPLETED: "bg-green-100 text-green-700 border-green-200",
            CANCELLED: "bg-red-100 text-red-700 border-red-200",
        };
        return colors[status];
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
                {/* Top Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-1">Lịch đã đặt</h1>
                        <p className="text-slate-500">Quản lý và theo dõi các booking của bạn</p>
                    </div>
                    <Link
                        href="/bookings/create"
                        className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-sm flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Đặt lịch mới</span>
                    </Link>
                </div>

                {/* Filter */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                        {statuses.map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === status
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
                                    }`}
                            >
                                {getStatusLabel(status)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="animate-spin h-12 w-12 rounded-full border-4 border-slate-200 border-t-blue-600 mx-auto mb-4" />
                            <p className="text-slate-500">Đang tải...</p>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button onClick={loadBookings} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium">
                            Thử lại
                        </button>
                    </div>
                )}

                {/* Bookings Grid */}
                {!loading && !error && (
                    <>
                        {filteredBookings.length > 0 ? (
                            <>
                                <div className="mb-4 text-sm text-slate-500">
                                    {filteredBookings.length} booking{filteredBookings.length > 1 ? "s" : ""}
                                </div>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredBookings.map((booking) => (
                                        <Link key={booking.id} href={`/bookings/${booking.id}`} className="group">
                                            <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg transition-all h-full">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h3 className="font-semibold text-slate-800 group-hover:text-blue-600">
                                                            {booking.serviceName}
                                                        </h3>
                                                        <p className="text-sm text-slate-500">#{booking.id}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                                                        {getStatusLabel(booking.status)}
                                                    </span>
                                                </div>

                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        {new Date(booking.scheduledAt).toLocaleDateString("vi-VN", {
                                                            weekday: "short", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
                                                        })}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <span className="truncate">{booking.addressLine}</span>
                                                    </div>
                                                </div>

                                                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                                                    <span className="font-bold text-blue-600">{formatPrice(booking.priceAtBooking)}</span>
                                                    <span className="text-sm text-blue-600 group-hover:text-blue-700 font-medium">
                                                        Xem chi tiết →
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                                <div className="text-6xl mb-4">📅</div>
                                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                                    {filter === "ALL" ? "Chưa có booking nào" : `Không có booking ${getStatusLabel(filter).toLowerCase()}`}
                                </h3>
                                <p className="text-slate-500 mb-6">Bắt đầu đặt lịch dịch vụ ngay hôm nay</p>
                                <Link
                                    href="/services"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                >
                                    Xem dịch vụ →
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default function MyBookingsPage() {
    return (
        <ProtectedRoute>
            <MyBookingsContent />
        </ProtectedRoute>
    );
}
