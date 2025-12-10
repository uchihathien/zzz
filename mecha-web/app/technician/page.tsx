// app/technician/page.tsx - Technician Dashboard
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/lib/protected-route";
import { useAuth } from "@/lib/auth-context";
import { getAssignedBookings, getBookingStatusLabel, updateBookingStatus, formatDateTime, formatPrice } from "@/lib/bookings-api";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import type { BookingDto, BookingStatus } from "@/lib/types";


function TechnicianDashboardContent() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<BookingDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    useEffect(() => {
        loadBookings();
    }, []);

    async function loadBookings() {
        try {
            setLoading(true);
            const data = await getAssignedBookings();
            setBookings(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusChange(bookingId: number, newStatus: BookingStatus) {
        try {
            setUpdatingId(bookingId);
            await updateBookingStatus(bookingId, { status: newStatus });
            await loadBookings();
        } catch (err: any) {
            alert(err.message || "Không thể cập nhật");
        } finally {
            setUpdatingId(null);
        }
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

    // Group by status
    const pendingBookings = bookings.filter(b => b.status === "CONFIRMED");
    const inProgressBookings = bookings.filter(b => b.status === "IN_PROGRESS");
    const otherBookings = bookings.filter(b => !["CONFIRMED", "IN_PROGRESS"].includes(b.status));

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">
                        Xin chào, {user?.fullName}!
                    </h1>
                    <p className="text-slate-500">Danh sách công việc được giao cho bạn</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-blue-600">{pendingBookings.length}</p>
                        <p className="text-sm text-slate-500">Chờ thực hiện</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-purple-600">{inProgressBookings.length}</p>
                        <p className="text-sm text-slate-500">Đang thực hiện</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-green-600">
                            {bookings.filter(b => b.status === "COMPLETED").length}
                        </p>
                        <p className="text-sm text-slate-500">Hoàn thành</p>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="animate-spin h-10 w-10 border-4 border-slate-200 border-t-blue-600 rounded-full mx-auto mb-4" />
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 mb-6">
                        {error}
                    </div>
                )}

                {/* Active Jobs */}
                {!loading && !error && (
                    <>
                        {/* In Progress */}
                        {inProgressBookings.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <span className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></span>
                                    Đang thực hiện
                                </h2>
                                <div className="space-y-4">
                                    {inProgressBookings.map(booking => (
                                        <BookingCard
                                            key={booking.id}
                                            booking={booking}
                                            onStatusChange={handleStatusChange}
                                            updatingId={updatingId}
                                            getStatusColor={getStatusColor}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pending */}
                        {pendingBookings.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-lg font-bold text-slate-800 mb-4">Chờ thực hiện</h2>
                                <div className="space-y-4">
                                    {pendingBookings.map(booking => (
                                        <BookingCard
                                            key={booking.id}
                                            booking={booking}
                                            onStatusChange={handleStatusChange}
                                            updatingId={updatingId}
                                            getStatusColor={getStatusColor}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Others */}
                        {otherBookings.length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 mb-4">Khác</h2>
                                <div className="space-y-4">
                                    {otherBookings.map(booking => (
                                        <BookingCard
                                            key={booking.id}
                                            booking={booking}
                                            onStatusChange={handleStatusChange}
                                            updatingId={updatingId}
                                            getStatusColor={getStatusColor}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {bookings.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                                <div className="text-5xl mb-4">📋</div>
                                <p className="text-slate-500">Chưa có công việc nào được giao</p>
                            </div>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}

function BookingCard({
    booking,
    onStatusChange,
    updatingId,
    getStatusColor
}: {
    booking: BookingDto;
    onStatusChange: (id: number, status: BookingStatus) => void;
    updatingId: number | null;
    getStatusColor: (status: BookingStatus) => string;
}) {
    const canStart = booking.status === "CONFIRMED";
    const canComplete = booking.status === "IN_PROGRESS";
    const isUpdating = updatingId === booking.id;

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-slate-800">{booking.serviceName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                            {getBookingStatusLabel(booking.status)}
                        </span>
                    </div>
                    <div className="space-y-1 text-sm text-slate-600">
                        <p>📅 {formatDateTime(booking.scheduledAt)}</p>
                        <p>👤 {booking.customerName} - {booking.contactPhone}</p>
                        <p>📍 {booking.addressLine}</p>
                        {booking.note && <p>📝 {booking.note}</p>}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <p className="text-lg font-bold text-blue-600 text-right">{formatPrice(booking.priceAtBooking)}</p>

                    {canStart && (
                        <button
                            onClick={() => onStatusChange(booking.id, "IN_PROGRESS")}
                            disabled={isUpdating}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm disabled:opacity-50"
                        >
                            {isUpdating ? "Đang xử lý..." : "Bắt đầu thực hiện"}
                        </button>
                    )}

                    {canComplete && (
                        <button
                            onClick={() => onStatusChange(booking.id, "COMPLETED")}
                            disabled={isUpdating}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm disabled:opacity-50"
                        >
                            {isUpdating ? "Đang xử lý..." : "Hoàn thành"}
                        </button>
                    )}

                    <Link
                        href={`/bookings/${booking.id}`}
                        className="px-4 py-2 border border-slate-200 text-slate-600 hover:border-blue-300 rounded-lg font-medium text-sm text-center"
                    >
                        Chi tiết
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function TechnicianDashboardPage() {
    return (
        <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
            <TechnicianDashboardContent />
        </ProtectedRoute>
    );
}
