"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "../ui/badge/Badge";
import { ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";
import { dashboardService, DashboardStats } from "@/lib/api/dashboard.service";
import { getAccessToken } from "@/lib/api/httpClient";

export const EcommerceMetricsV2 = () => {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            setError(null);

            // Kiểm tra đã đăng nhập chưa
            const token = getAccessToken();
            if (!token) {
                setError("Vui lòng đăng nhập để xem thống kê");
                setLoading(false);
                return;
            }

            const data = await dashboardService.getStats();
            setStats(data);
        } catch (err) {
            console.error("Failed to load stats:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Không thể tải dữ liệu. Vui lòng đăng nhập lại."
            );
        } finally {
            setLoading(false);
        }
    };

    // Format currency
    const formatCurrency = (amount: number): string => {
        if (amount >= 1000000000) {
            return `${(amount / 1000000000).toFixed(1)} tỷ`;
        }
        if (amount >= 1000000) {
            return `${(amount / 1000000).toFixed(1)} tr`;
        }
        if (amount >= 1000) {
            return `${(amount / 1000).toFixed(1)}k`;
        }
        return amount.toLocaleString("vi-VN");
    };

    // Get current month name
    const getMonthName = (): string => {
        const now = new Date();
        return `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`;
    };

    const LoadingSkeleton = () => (
        <span className="inline-block w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></span>
    );

    // Hiển thị lỗi hoặc yêu cầu đăng nhập
    if (error) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03] text-center">
                <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600"
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
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
                    Không thể tải dữ liệu
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
                <div className="flex justify-center gap-3">
                    <button
                        onClick={loadStats}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 font-medium text-sm"
                    >
                        Thử lại
                    </button>
                    <button
                        onClick={() => router.push("/signin")}
                        className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 font-medium text-sm"
                    >
                        Đăng nhập
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Tổng quan {getMonthName()}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Từ ngày 01 đến hiện tại
                    </p>
                </div>
                <button
                    onClick={loadStats}
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

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
                {/* Khách hàng trong tháng */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-light-100 rounded-xl dark:bg-blue-light-900/30">
                        <GroupIcon className="text-blue-light-600 size-6 dark:text-blue-light-400" />
                    </div>

                    <div className="flex items-end justify-between mt-5">
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Khách hàng mới
                            </span>
                            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                                {loading ? (
                                    <LoadingSkeleton />
                                ) : (
                                    (stats?.monthlyCustomers || 0).toLocaleString("vi-VN")
                                )}
                            </h4>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                Tổng: {(stats?.totalCustomers || 0).toLocaleString("vi-VN")} khách
                            </p>
                        </div>
                        <Badge color="info">Tháng này</Badge>
                    </div>
                </div>

                {/* Đơn hàng trong tháng */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-brand-100 rounded-xl dark:bg-brand-900/30">
                        <BoxIconLine className="text-brand-600 dark:text-brand-400" />
                    </div>
                    <div className="flex items-end justify-between mt-5">
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Đơn hàng
                            </span>
                            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                                {loading ? (
                                    <LoadingSkeleton />
                                ) : (
                                    (stats?.monthlyOrders || 0).toLocaleString("vi-VN")
                                )}
                            </h4>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                Tổng: {(stats?.totalOrders || 0).toLocaleString("vi-VN")} đơn
                            </p>
                        </div>

                        <Badge color="info">Tháng này</Badge>
                    </div>
                </div>

                {/* Doanh thu trong tháng */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-success-100 rounded-xl dark:bg-success-900/30">
                        <svg
                            className="w-6 h-6 text-success-600 dark:text-success-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <div className="flex items-end justify-between mt-5">
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Doanh thu
                            </span>
                            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                                {loading ? (
                                    <LoadingSkeleton />
                                ) : (
                                    <span className="flex items-baseline gap-1">
                                        {formatCurrency(stats?.monthlyRevenue || 0)}
                                        <span className="text-sm font-normal text-gray-500">
                                            VNĐ
                                        </span>
                                    </span>
                                )}
                            </h4>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                Hôm nay: {formatCurrency(stats?.todayRevenue || 0)} VNĐ
                            </p>
                        </div>

                        <Badge color="success">
                            <ArrowUpIcon />
                            Tháng này
                        </Badge>
                    </div>
                </div>

                {/* Đơn hàng cần xử lý trong tháng */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-warning-100 rounded-xl dark:bg-warning-900/30">
                        <svg
                            className="w-6 h-6 text-warning-600 dark:text-warning-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <div className="flex items-end justify-between mt-5">
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Cần xử lý
                            </span>
                            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                                {loading ? (
                                    <LoadingSkeleton />
                                ) : (
                                    (stats?.monthlyPendingOrders || 0).toLocaleString("vi-VN")
                                )}
                            </h4>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                Đơn hàng chờ xử lý
                            </p>
                        </div>

                        <Badge
                            color={
                                stats?.monthlyPendingOrders && stats.monthlyPendingOrders > 0
                                    ? "warning"
                                    : "success"
                            }
                        >
                            {stats?.monthlyPendingOrders && stats.monthlyPendingOrders > 0
                                ? "Đang chờ"
                                : "Đã xong"}
                        </Badge>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EcommerceMetricsV2;
