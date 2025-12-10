"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { ordersService } from "@/lib/api/orders.service";
import { Order, OrderStatus, PaymentStatus } from "@/types";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
});

export default function OrdersAnalyticsChart() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        try {
            setLoading(true);
            const data = await ordersService.adminSearch();
            setOrders(data || []);
        } catch (error) {
            console.error("Failed to load orders:", error);
        } finally {
            setLoading(false);
        }
    }

    // Count orders by status
    const statusCounts = {
        PENDING: orders.filter(o => o.status === OrderStatus.PENDING).length,
        DELIVERED: orders.filter(o => o.status === OrderStatus.DELIVERED).length,
        CANCELLED: orders.filter(o => o.status === OrderStatus.CANCELLED).length,
    };

    // Count by payment status
    const paymentCounts = {
        PENDING: orders.filter(o => o.paymentStatus === PaymentStatus.PENDING).length,
        PAID: orders.filter(o => o.paymentStatus === PaymentStatus.PAID).length,
        FAILED: orders.filter(o => o.paymentStatus === PaymentStatus.FAILED).length,
    };

    const statusChartOptions: ApexOptions = {
        chart: {
            type: "donut",
            fontFamily: "Outfit, sans-serif",
        },
        labels: ["Đang xử lý", "Hoàn thành", "Đã hủy"],
        colors: ["#f59e0b", "#10b981", "#ef4444"],
        legend: {
            position: "bottom",
            fontFamily: "Outfit",
        },
        plotOptions: {
            pie: {
                donut: {
                    size: "65%",
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: "Tổng đơn",
                            formatter: () => orders.length.toString(),
                        },
                    },
                },
            },
        },
        dataLabels: {
            enabled: false,
        },
        responsive: [
            {
                breakpoint: 480,
                options: {
                    chart: {
                        width: 280,
                    },
                },
            },
        ],
    };

    const paymentChartOptions: ApexOptions = {
        chart: {
            type: "donut",
            fontFamily: "Outfit, sans-serif",
        },
        labels: ["Chờ thanh toán", "Đã thanh toán", "Thất bại"],
        colors: ["#f59e0b", "#10b981", "#ef4444"],
        legend: {
            position: "bottom",
            fontFamily: "Outfit",
        },
        plotOptions: {
            pie: {
                donut: {
                    size: "65%",
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: "Tổng đơn",
                            formatter: () => orders.length.toString(),
                        },
                    },
                },
            },
        },
        dataLabels: {
            enabled: false,
        },
        responsive: [
            {
                breakpoint: 480,
                options: {
                    chart: {
                        width: 280,
                    },
                },
            },
        ],
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse"
                    >
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4"></div>
                        <div className="h-[280px] bg-gray-100 dark:bg-gray-800 rounded-full mx-auto w-[280px]"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Status Chart */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                    📋 Phân tích trạng thái đơn hàng
                </h3>
                <div className="flex justify-center">
                    <ReactApexChart
                        options={statusChartOptions}
                        series={[statusCounts.PENDING, statusCounts.DELIVERED, statusCounts.CANCELLED]}
                        type="donut"
                        height={300}
                    />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-3 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                        <p className="text-2xl font-bold text-amber-600">{statusCounts.PENDING}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Đang xử lý</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-500/10 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{statusCounts.DELIVERED}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Hoàn thành</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 dark:bg-red-500/10 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{statusCounts.CANCELLED}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Đã hủy</p>
                    </div>
                </div>
            </div>

            {/* Payment Status Chart */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                    💳 Phân tích thanh toán
                </h3>
                <div className="flex justify-center">
                    <ReactApexChart
                        options={paymentChartOptions}
                        series={[paymentCounts.PENDING, paymentCounts.PAID, paymentCounts.FAILED]}
                        type="donut"
                        height={300}
                    />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-3 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                        <p className="text-2xl font-bold text-amber-600">{paymentCounts.PENDING}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Chờ thanh toán</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-500/10 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{paymentCounts.PAID}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Đã thanh toán</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 dark:bg-red-500/10 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{paymentCounts.FAILED}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Thất bại</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
