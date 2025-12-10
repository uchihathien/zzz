// app/bookings/[id]/payment/page.tsx - Booking Payment Page
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/lib/protected-route";
import { getBookingById, formatPrice } from "@/lib/bookings-api";
import { getJson } from "@/lib/api";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import toast from "react-hot-toast";
import type { BookingDto } from "@/lib/types";

interface BankInfo {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    branch: string;
    hotline: string;
}

function BookingPaymentContent() {
    const params = useParams();
    const router = useRouter();
    const bookingId = parseInt(params.id as string);

    const [booking, setBooking] = useState<BookingDto | null>(null);
    const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [bookingId]);

    async function loadData() {
        try {
            setLoading(true);
            const [bookingData, bankData] = await Promise.all([
                getBookingById(bookingId),
                getJson<BankInfo>("/api/payment/bank-info")
            ]);
            setBooking(bookingData);
            setBankInfo(bankData);
        } catch (err: any) {
            setError(err.message || "Không thể tải thông tin");
        } finally {
            setLoading(false);
        }
    }


    function copyToClipboard(text: string, field: string) {
        navigator.clipboard.writeText(text);
        setCopied(field);
        toast.success("Đã sao chép!");
        setTimeout(() => setCopied(null), 2000);
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin h-12 w-12 rounded-full border-4 border-slate-200 border-t-blue-600" />
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white border border-red-200 rounded-xl p-6 text-center">
                    <div className="text-5xl mb-4">😕</div>
                    <p className="text-red-600 mb-4">{error || "Không tìm thấy booking"}</p>
                    <Link href="/bookings/my" className="inline-block px-4 py-2 rounded-lg bg-blue-600 text-white">
                        ← Danh sách lịch đặt
                    </Link>
                </div>
            </div>
        );
    }

    const transferContent = `BOOKING${booking.id}`;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <main className="flex-1 max-w-2xl mx-auto px-4 py-8 w-full">
                <Link href={`/bookings/${booking.id}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-6">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Chi tiết booking</span>
                </Link>

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-6 text-white text-center">
                    <div className="text-4xl mb-2">🏦</div>
                    <h1 className="text-2xl font-bold mb-2">Thanh toán chuyển khoản</h1>
                    <p className="text-blue-100">Vui lòng chuyển khoản theo thông tin bên dưới</p>
                </div>

                {/* Amount */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 text-center">
                    <p className="text-slate-500 mb-2">Số tiền thanh toán</p>
                    <p className="text-4xl font-bold text-blue-600">{formatPrice(booking.priceAtBooking)}</p>
                    <p className="text-sm text-slate-400 mt-2">Booking #{booking.id} - {booking.serviceName}</p>
                </div>

                {/* Bank Info */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 space-y-4">
                    <h2 className="font-semibold text-slate-800 mb-4">Thông tin chuyển khoản</h2>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div>
                            <p className="text-xs text-slate-500">Ngân hàng</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div>
                            <p className="text-xs text-slate-500">Số tài khoản</p>
                        </div>
                        <button
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${copied === "account"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                }`}
                        >
                            {copied === "account" ? "✓ Đã sao chép" : "Sao chép"}
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                        <div>
                            <p className="text-xs text-yellow-700">Nội dung chuyển khoản</p>
                            <p className="font-medium text-yellow-800 font-mono">{transferContent}</p>
                        </div>
                        <button
                            onClick={() => copyToClipboard(transferContent, "content")}
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${copied === "content"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                }`}
                        >
                            {copied === "content" ? "✓ Đã sao chép" : "Sao chép"}
                        </button>
                    </div>
                </div>

                {/* Notice */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-6">
                    <div className="flex gap-3">
                        <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-blue-700">
                            <p className="font-medium mb-2">Lưu ý quan trọng:</p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Vui lòng ghi <strong>đúng nội dung chuyển khoản</strong> để được xác nhận nhanh chóng</li>
                                <li>Sau khi chuyển khoản, chúng tôi sẽ xác nhận trong vòng 30 phút</li>
                                <li>Nếu cần hỗ trợ, vui lòng liên hệ hotline: <strong>1900-xxxx</strong></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <Link
                        href={`/bookings/${booking.id}`}
                        className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-center transition-colors"
                    >
                        Tôi đã chuyển khoản
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function BookingPaymentPage() {
    return (
        <ProtectedRoute>
            <BookingPaymentContent />
        </ProtectedRoute>
    );
}
