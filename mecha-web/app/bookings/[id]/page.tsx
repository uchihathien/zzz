// app/bookings/[id]/page.tsx - Booking Detail with White/Blue Theme
"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/lib/protected-route";
import { getBookingById, cancelBooking } from "@/lib/bookings-api";
import { formatPrice } from "@/lib/services-api";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import toast from "react-hot-toast";
import type { BookingDto, BookingStatus } from "@/lib/types";

function BookingDetailContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const bookingId = parseInt(params.id as string);
    const isSuccess = searchParams.get("success") === "1";
    const confirm = useConfirm();

    const [booking, setBooking] = useState<BookingDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        loadBooking();
    }, [bookingId]);

    async function loadBooking() {
        try {
            setLoading(true);
            setError(null);
            const data = await getBookingById(bookingId);
            setBooking(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Không thể tải thông tin booking");
        } finally {
            setLoading(false);
        }
    }

    async function handleCancel() {
        const confirmed = await confirm({
            title: "Hủy lịch đặt",
            message: "Bạn có chắc muốn hủy lịch đặt dịch vụ này không? Hành động này không thể hoàn tác.",
            confirmText: "Hủy lịch",
            cancelText: "Quay lại",
            type: "danger",
        });

        if (!confirmed) return;

        try {
            setCancelling(true);
            await cancelBooking(bookingId);
            toast.success("Đã hủy lịch đặt thành công!");
            await loadBooking();
        } catch (err: any) {
            toast.error(err.message || "Hủy lịch thất bại");
        } finally {
            setCancelling(false);
        }
    }


    function getStatusLabel(status: BookingStatus): string {
        const labels: Record<BookingStatus, string> = {
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

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 rounded-full border-4 border-slate-200 border-t-blue-600 mx-auto mb-4" />
                    <p className="text-slate-500">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white border border-red-200 rounded-xl p-6 text-center shadow-sm">
                    <div className="text-5xl mb-4">😕</div>
                    <p className="text-red-600 mb-4">{error || "Không tìm thấy booking"}</p>
                    <Link href="/bookings/my" className="inline-block px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium">
                        ← Danh sách lịch đặt
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
                {/* Success Banner */}
                {isSuccess && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="font-semibold text-green-800">Đặt lịch thành công!</p>
                            <p className="text-sm text-green-600">Chúng tôi sẽ liên hệ xác nhận sớm nhất</p>
                        </div>
                    </div>
                )}

                {/* Back */}
                <Link href="/bookings/my" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-6">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Danh sách lịch đặt</span>
                </Link>

                {/* Booking Header */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Booking #{booking.id}</h1>
                            <p className="text-slate-500">
                                Đặt lúc: {new Date(booking.createdAt).toLocaleDateString("vi-VN", {
                                    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
                                })}
                            </p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                            {getStatusLabel(booking.status)}
                        </span>
                    </div>
                </div>

                {/* Service Info */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
                    <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Dịch vụ
                    </h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-lg font-medium text-slate-800">{booking.serviceName}</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{formatPrice(booking.priceAtBooking)}</p>
                    </div>
                </div>

                {/* Schedule */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
                    <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Thời gian hẹn
                    </h2>
                    <p className="text-lg text-slate-700">
                        {new Date(booking.scheduledAt).toLocaleDateString("vi-VN", {
                            weekday: "long", day: "2-digit", month: "2-digit", year: "numeric"
                        })}
                        {" lúc "}
                        {new Date(booking.scheduledAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit", minute: "2-digit"
                        })}
                    </p>
                </div>

                {/* Contact Info */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
                    <h2 className="font-semibold text-slate-800 mb-4">Thông tin liên hệ</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-slate-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-slate-700">{booking.addressLine}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <p className="text-slate-700">{booking.contactPhone}</p>
                        </div>
                        {booking.note && (
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-slate-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                                <p className="text-slate-600">{booking.note}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Technician Info */}
                {booking.technicianName && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
                        <h2 className="font-semibold text-slate-800 mb-4">Kỹ thuật viên</h2>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-semibold">
                                    {booking.technicianName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <p className="font-medium text-slate-700">{booking.technicianName}</p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <button
                            onClick={handleCancel}
                            disabled={cancelling}
                            className="w-full py-3 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 font-medium transition-colors disabled:opacity-50"
                        >
                            {cancelling ? "Đang hủy..." : "Hủy lịch đặt"}
                        </button>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default function BookingDetailPage() {
    return (
        <ProtectedRoute>
            <BookingDetailContent />
        </ProtectedRoute>
    );
}
