// app/bookings/create/page.tsx - Create Booking with White/Blue Theme
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/lib/protected-route";
import { getServices, formatPrice, formatDuration } from "@/lib/services-api";
import { createBooking } from "@/lib/bookings-api";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import toast from "react-hot-toast";
import type { ServiceDto } from "@/lib/types";

function CreateBookingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedServiceId = searchParams.get("serviceId");

    const [services, setServices] = useState<ServiceDto[]>([]);
    const [selectedService, setSelectedService] = useState<number | null>(preselectedServiceId ? parseInt(preselectedServiceId) : null);
    const [scheduledAt, setScheduledAt] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingServices, setLoadingServices] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadServices();
    }, []);

    async function loadServices() {
        try {
            const data = await getServices("ACTIVE");
            setServices(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingServices(false);
        }
    }

    const service = services.find(s => s.id === selectedService);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedService || !scheduledAt || !address || !phone) {
            setError("Vui lòng điền đầy đủ thông tin");
            toast.error("Vui lòng điền đầy đủ thông tin");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const booking = await createBooking({
                serviceId: selectedService,
                scheduledAt: new Date(scheduledAt).toISOString(),
                addressLine: address,
                contactPhone: phone,
                note: note || undefined,
            });

            toast.success("Đặt lịch thành công!");
            router.push(`/bookings/${booking.id}?success=1`);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Đặt lịch thất bại");
            setError(err.message || "Đặt lịch thất bại");
        } finally {
            setLoading(false);
        }
    }

    // Min date = tomorrow
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1);
    const minDateStr = minDate.toISOString().slice(0, 16);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
                <Link href="/services" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-6">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Danh sách dịch vụ</span>
                </Link>

                <h1 className="text-2xl font-bold text-slate-800 mb-6">Đặt lịch dịch vụ</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* Service Selection */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="font-semibold text-slate-800 mb-4">Chọn dịch vụ</h2>
                        {loadingServices ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin h-8 w-8 rounded-full border-4 border-slate-200 border-t-blue-600" />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {services.map((s) => (
                                    <label
                                        key={s.id}
                                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedService === s.id
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-slate-200 hover:border-slate-300"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="service"
                                            value={s.id}
                                            checked={selectedService === s.id}
                                            onChange={() => setSelectedService(s.id)}
                                            className="w-5 h-5 text-blue-600"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-800">{s.name}</p>
                                            <p className="text-sm text-slate-500">{s.description}</p>
                                            {s.durationMinutes && (
                                                <p className="text-xs text-slate-400 mt-1">
                                                    ⏱️ {formatDuration(s.durationMinutes)}
                                                </p>
                                            )}
                                        </div>
                                        <span className="font-semibold text-blue-600">{formatPrice(s.basePrice)}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Date & Time */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="font-semibold text-slate-800 mb-4">Thời gian</h2>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">Chọn ngày và giờ <span className="text-red-500">*</span></label>
                        <input
                            type="datetime-local"
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                            min={minDateStr}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Contact Info */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                        <h2 className="font-semibold text-slate-800">Thông tin liên hệ</h2>
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-2 block">Địa chỉ <span className="text-red-500">*</span></label>
                            <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                rows={2}
                                required
                                placeholder="Nhập địa chỉ..."
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-2 block">Số điện thoại <span className="text-red-500">*</span></label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                placeholder="0901234567"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-2 block">Ghi chú</label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={2}
                                placeholder="Ghi chú thêm (tùy chọn)..."
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            />
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">💵</span>
                            <div>
                                <p className="font-medium text-green-800">Thanh toán khi hoàn thành</p>
                                <p className="text-sm text-green-600">Bạn sẽ thanh toán sau khi dịch vụ hoàn thành</p>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    {service && (
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-slate-700">Dịch vụ</span>
                                <span className="font-medium text-slate-800">{service.name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-700">Thành tiền</span>
                                <span className="text-2xl font-bold text-blue-600">{formatPrice(service.basePrice)}</span>
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading || !selectedService}
                        className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold transition-colors shadow-lg shadow-blue-600/30"
                    >
                        {loading ? "Đang xử lý..." : "Xác nhận đặt lịch"}
                    </button>
                </form>
            </main>

            <Footer />
        </div>
    );
}

export default function CreateBookingPage() {
    return (
        <ProtectedRoute>
            <CreateBookingContent />
        </ProtectedRoute>
    );
}
