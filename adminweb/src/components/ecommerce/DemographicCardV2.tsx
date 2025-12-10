"use client";
import { useEffect, useState } from "react";
import { dashboardService } from "@/lib/api/dashboard.service";

interface CityDemographic {
    city: string;
    count: number;
    percentage: number;
}

// Màu sắc cho các thành phố
const cityColors = [
    "bg-brand-500",
    "bg-success-500",
    "bg-warning-500",
    "bg-error-500",
    "bg-blue-light-500",
    "bg-orange-500",
    "bg-theme-purple-500",
    "bg-theme-pink-500",
    "bg-teal-500",
    "bg-pink-500",
];

export default function DemographicCardV2() {
    const [demographics, setDemographics] = useState<CityDemographic[]>([]);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDemographics();
    }, []);

    const loadDemographics = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await dashboardService.getCityDemographics();
            setDemographics(data);

            // Tính tổng số khách hàng
            const total = data.reduce((sum, item) => sum + item.count, 0);
            setTotalCustomers(total);
        } catch (err) {
            console.error("Failed to load demographics:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Không thể tải dữ liệu. Vui lòng đăng nhập."
            );
        } finally {
            setLoading(false);
        }
    };

    // Hiển thị tất cả 5 thành phố (API đã trả về top 5)
    const displayedDemographics = demographics;

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
            <div className="flex justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Top 5 tỉnh/thành nhiều đơn hàng
                    </h3>
                    <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
                        {totalCustomers} đơn hàng từ {demographics.length} tỉnh/thành phố
                    </p>
                </div>

                <button
                    onClick={loadDemographics}
                    className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Làm mới"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent"></div>
                </div>
            )}

            {/* Error State */}
            {!loading && error && (
                <div className="py-8 text-center">
                    <svg
                        className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400 mb-3 text-sm">
                        {error}
                    </p>
                    <button
                        onClick={loadDemographics}
                        className="text-brand-500 hover:text-brand-600 text-sm font-medium"
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {/* Data */}
            {!loading && !error && (
                <div className="space-y-4">
                    {demographics.length === 0 ? (
                        <div className="py-8 text-center">
                            <svg
                                className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                            <p className="text-gray-500 dark:text-gray-400">
                                Chưa có dữ liệu đơn hàng
                            </p>
                        </div>
                    ) : (
                        <>
                            {displayedDemographics.map((item, index) => (
                                <div
                                    key={item.city}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {/* City Icon */}
                                        <div
                                            className={`flex-shrink-0 w-8 h-8 rounded-full ${cityColors[index % cityColors.length]
                                                } flex items-center justify-center text-white text-xs font-bold`}
                                        >
                                            {index + 1}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90 truncate">
                                                {item.city}
                                            </p>
                                            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                                {item.count} đơn hàng
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex w-full max-w-[140px] items-center gap-3">
                                        <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
                                            <div
                                                className={`absolute left-0 top-0 flex h-full items-center justify-center rounded-sm ${cityColors[index % cityColors.length]
                                                    } text-xs font-medium text-white transition-all duration-500`}
                                                style={{ width: `${Math.min(item.percentage, 100)}%` }}
                                            ></div>
                                        </div>
                                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90 w-10 text-right">
                                            {item.percentage}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}

            {/* Summary */}
            {!loading && !error && demographics.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <p className="text-2xl font-bold text-brand-500">
                                {totalCustomers}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Tổng đơn hàng
                            </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <p className="text-2xl font-bold text-success-500">
                                {demographics.length}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Tỉnh/Thành phố
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
