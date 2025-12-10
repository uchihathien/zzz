// app/services/page.tsx - Services page with White/Blue Theme
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getServices, getServiceTypeLabel, formatPrice, formatDuration } from "@/lib/services-api";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import type { ServiceDto, ServiceType } from "@/lib/types";

export default function ServicesPage() {

    const [services, setServices] = useState<ServiceDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<ServiceType | "ALL">("ALL");
    const [searchInput, setSearchInput] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");

    useEffect(() => {
        loadServices();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchKeyword(searchInput);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    async function loadServices() {
        try {
            setLoading(true);
            setError(null);
            const data = await getServices("ACTIVE");
            setServices(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Không thể tải danh sách dịch vụ");
        } finally {
            setLoading(false);
        }
    }

    const serviceTypes: Array<ServiceType | "ALL"> = ["ALL", "CLEANING", "MAINTENANCE", "REPAIR", "OTHER"];

    const filteredServices = services.filter(s => {
        const matchType = selectedType === "ALL" || s.type === selectedType;
        const matchSearch = !searchKeyword ||
            s.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            s.description?.toLowerCase().includes(searchKeyword.toLowerCase());
        return matchType && matchSearch;
    });

    const hasFilters = selectedType !== "ALL" || searchKeyword;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            {/* Search Bar */}
            <div className="bg-white border-b border-slate-200 py-4">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Tìm kiếm dịch vụ..."
                            className="w-full px-4 py-3 pl-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                        />
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {searchInput && (
                            <button onClick={() => setSearchInput("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                ✕
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">

                {/* Type Filters */}
                <div className="mb-8 space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {serviceTypes.map((type) => (
                            <button
                                key={type}
                                onClick={() => setSelectedType(type)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedType === type
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
                                    }`}
                            >
                                {type === "ALL" ? "Tất cả" : getServiceTypeLabel(type)}
                            </button>
                        ))}
                    </div>

                    {hasFilters && (
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-500">Đang lọc:</span>
                            {selectedType !== "ALL" && (
                                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                                    {getServiceTypeLabel(selectedType)}
                                </span>
                            )}
                            {searchKeyword && (
                                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
                                    "{searchKeyword}"
                                </span>
                            )}
                            <button
                                onClick={() => { setSelectedType("ALL"); setSearchKeyword(""); setSearchInput(""); }}
                                className="text-red-500 hover:text-red-700 font-medium ml-2"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    )}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="animate-spin h-12 w-12 rounded-full border-4 border-slate-200 border-t-blue-600 mx-auto mb-4" />
                            <p className="text-slate-500">Đang tải dịch vụ...</p>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button onClick={loadServices} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium">
                            Thử lại
                        </button>
                    </div>
                )}

                {/* Services Grid */}
                {!loading && !error && (
                    <>
                        {filteredServices.length > 0 ? (
                            <>
                                <div className="mb-4 text-sm text-slate-500">
                                    Tìm thấy <span className="font-semibold text-slate-700">{filteredServices.length}</span> dịch vụ
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredServices.map((service) => (
                                        <ServiceCard key={service.id} service={service} />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                                <div className="text-6xl mb-4">🔧</div>
                                <h3 className="text-xl font-semibold text-slate-700 mb-2">Không tìm thấy dịch vụ</h3>
                                <p className="text-slate-500">Thử thay đổi bộ lọc</p>
                            </div>
                        )}
                    </>
                )}

                {/* CTA */}
                {!loading && !error && services.length > 0 && (
                    <div className="mt-12 bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Cần đặt lịch dịch vụ?</h2>
                        <p className="text-slate-600 mb-6">Đăng nhập để đặt lịch sử dụng dịch vụ ngay hôm nay</p>
                        <Link
                            href="/bookings/create"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
                        >
                            Đặt lịch ngay
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                    </div>
                )}
            </main>

            <Footer />
        </div>

    );
}

// Service Card Component
function ServiceCard({ service }: { service: ServiceDto }) {
    const typeColors: Record<string, string> = {
        CLEANING: "bg-blue-100 text-blue-700 border-blue-200",
        MAINTENANCE: "bg-green-100 text-green-700 border-green-200",
        REPAIR: "bg-orange-100 text-orange-700 border-orange-200",
        OTHER: "bg-slate-100 text-slate-700 border-slate-200",
    };

    return (
        <Link href={`/services/${service.id}`} className="group">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 h-full hover:border-blue-300 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {service.name}
                        </h3>
                        {service.code && (
                            <p className="text-xs text-slate-500 mt-1">Mã: {service.code}</p>
                        )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${typeColors[service.type] || typeColors.OTHER}`}>
                        {getServiceTypeLabel(service.type)}
                    </span>
                </div>

                {service.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{service.description}</p>
                )}

                <div className="pt-4 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Giá dịch vụ:</span>
                        <span className="text-xl font-bold text-blue-600">{formatPrice(service.basePrice)}</span>
                    </div>
                    {service.durationMinutes && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">Thời gian:</span>
                            <span className="text-sm font-medium text-slate-700">{formatDuration(service.durationMinutes)}</span>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex items-center gap-1 text-sm text-blue-600 group-hover:text-blue-700 font-medium">
                    <span>Xem chi tiết</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </Link>
    );
}
