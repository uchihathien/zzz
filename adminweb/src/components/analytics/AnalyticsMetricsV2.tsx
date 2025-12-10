"use client";
import React, { useEffect, useState } from "react";
import { dashboardService, type DashboardStats } from "@/lib/api/dashboard.service";
import Badge from "../ui/badge/Badge";

export default function AnalyticsMetricsV2() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    async function loadStats() {
        try {
            setLoading(true);
            const data = await dashboardService.getStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to load analytics stats:", error);
        } finally {
            setLoading(false);
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
        if (num >= 1000) return (num / 1000).toFixed(1) + "K";
        return num.toString();
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse"
                    >
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    </div>
                ))}
            </div>
        );
    }

    const metricsData = [
        {
            id: 1,
            title: "Tổng đơn hàng",
            value: stats?.totalOrders || 0,
            monthValue: stats?.monthlyOrders || 0,
            icon: "📦",
            comparisonText: "Tháng này",
            color: "blue",
        },
        {
            id: 2,
            title: "Doanh thu",
            value: formatCurrency(stats?.totalRevenue || 0),
            monthValue: formatCurrency(stats?.monthlyRevenue || 0),
            icon: "💰",
            comparisonText: "Tháng này",
            color: "green",
        },
        {
            id: 3,
            title: "Tổng khách hàng",
            value: stats?.totalCustomers || 0,
            monthValue: stats?.monthlyCustomers || 0,
            icon: "👥",
            comparisonText: "Đăng ký mới",
            color: "purple",
        },
        {
            id: 4,
            title: "Đơn chờ xử lý",
            value: stats?.monthlyPendingOrders || 0,
            monthValue: stats?.todayOrders || 0,
            icon: "⏳",
            comparisonText: "Đơn hôm nay",
            color: "orange",
        },
    ];

    const colorMap: Record<string, { bg: string; text: string }> = {
        blue: { bg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-600 dark:text-blue-400" },
        green: { bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-600 dark:text-green-400" },
        purple: { bg: "bg-purple-100 dark:bg-purple-500/20", text: "text-purple-600 dark:text-purple-400" },
        orange: { bg: "bg-orange-100 dark:bg-orange-500/20", text: "text-orange-600 dark:text-orange-400" },
    };

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
            {metricsData.map((item) => (
                <div
                    key={item.id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-shadow"
                >
                    <div className="flex items-center justify-between">
                        <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                            {item.title}
                        </p>
                        <span className={`w-10 h-10 flex items-center justify-center rounded-xl text-xl ${colorMap[item.color].bg}`}>
                            {item.icon}
                        </span>
                    </div>
                    <div className="mt-3">
                        <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                            {item.value}
                        </h4>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge color="primary">
                            <span className="text-xs">{item.monthValue}</span>
                        </Badge>
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                            {item.comparisonText}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
