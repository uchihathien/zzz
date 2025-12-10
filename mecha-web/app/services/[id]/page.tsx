// app/services/[id]/page.tsx - Service Detail with White/Blue Theme
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getServiceById, getServiceTypeLabel, formatPrice, formatDuration } from "@/lib/services-api";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import type { ServiceDto } from "@/lib/types";

export default function ServiceDetailPage() {
    const params = useParams();
    const serviceId = parseInt(params.id as string);
    const { isAuthenticated } = useAuth();

    const [service, setService] = useState<ServiceDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadService();
    }, [serviceId]);

    async function loadService() {
        try {
            setLoading(true);
            setError(null);
            const data = await getServiceById(serviceId);
            setService(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Không thể tải thông tin dịch vụ");
        } finally {
            setLoading(false);
        }
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

    if (error || !service) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white border border-red-200 rounded-xl p-6 text-center shadow-sm">
                    <div className="text-5xl mb-4">😕</div>
                    <p className="text-red-600 mb-4">{error || "Không tìm thấy dịch vụ"}</p>
                    <Link
                        href="/services"
                        className="inline-block px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    >
                        ← Quay lại danh sách dịch vụ
                    </Link>
                </div>
            </div>
        );
    }

    const typeColors: Record<string, string> = {
        CLEANING: "bg-blue-100 text-blue-700 border-blue-200",
        MAINTENANCE: "bg-green-100 text-green-700 border-green-200",
        REPAIR: "bg-orange-100 text-orange-700 border-orange-200",
        OTHER: "bg-slate-100 text-slate-700 border-slate-200",
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
                {/* Back Link */}
                <Link
                    href="/services"
                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-6"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Quay lại danh sách dịch vụ</span>
                </Link>

                {/* Service Info Card */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    {/* Header */}
                    <div className="p-8 border-b border-slate-100">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-slate-800 mb-2">{service.name}</h1>
                                {service.code && (
                                    <p className="text-sm text-slate-500">Mã dịch vụ: <span className="font-medium">{service.code}</span></p>
                                )}
                            </div>
                            <span className={`px-4 py-2 rounded-full text-sm font-medium border ${typeColors[service.type] || typeColors.OTHER}`}>
                                {getServiceTypeLabel(service.type)}
                            </span>
                        </div>

                        {service.description && (
                            <p className="text-slate-600 leading-relaxed">{service.description}</p>
                        )}
                    </div>

                    {/* Details */}
                    <div className="p-8 space-y-6">
                        {/* Price */}
                        <div className="flex items-center justify-between p-6 bg-blue-50 rounded-xl border border-blue-100">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Giá dịch vụ</p>
                                <p className="text-3xl font-bold text-blue-600">{formatPrice(service.basePrice)}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Duration */}
                        {service.durationMinutes && (
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Thời gian thực hiện</p>
                                    <p className="text-sm font-semibold text-slate-700">{formatDuration(service.durationMinutes)}</p>
                                </div>
                            </div>
                        )}

                        {/* Metadata */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <p className="text-slate-500 mb-1">Ngày tạo</p>
                                <p className="font-medium text-slate-700">{new Date(service.createdAt).toLocaleDateString("vi-VN")}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <p className="text-slate-500 mb-1">Cập nhật</p>
                                <p className="font-medium text-slate-700">{new Date(service.updatedAt).toLocaleDateString("vi-VN")}</p>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="p-8 bg-blue-50 border-t border-blue-100">
                        {isAuthenticated ? (
                            <Link
                                href={`/bookings/create?serviceId=${service.id}`}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-lg shadow-blue-600/30"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>Đặt lịch dịch vụ</span>
                            </Link>
                        ) : (
                            <div className="text-center">
                                <p className="text-slate-600 mb-4">Đăng nhập để đặt lịch dịch vụ</p>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                                >
                                    <span>Đăng nhập ngay</span>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
