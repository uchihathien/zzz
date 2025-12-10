"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { dashboardService, DashboardStats } from "@/lib/api/dashboard.service";
import type { Order } from "@/types";
import Badge from "../ui/badge/Badge";

export default function RecentOrdersV2() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const stats: DashboardStats = await dashboardService.getStats();
            setOrders(stats.recentOrders || []);
        } catch (err) {
            console.error("Failed to load orders:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Không thể tải đơn hàng. Vui lòng đăng nhập."
            );
        } finally {
            setLoading(false);
        }
    };

    // Format currency
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount || 0);
    };

    // Format date
    const formatDate = (dateStr: string): string => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Get status badge color
    const getStatusColor = (
        status: string
    ): "success" | "warning" | "error" | "info" | "light" => {
        switch (status) {
            case "DELIVERED":
                return "success";
            case "PENDING":
                return "warning";
            case "CANCELLED":
                return "error";
            default:
                return "light";
        }
    };

    // Get status text
    const getStatusText = (status: string): string => {
        switch (status) {
            case "PENDING":
                return "Chờ xử lý";
            case "DELIVERED":
                return "Hoàn thành";
            case "CANCELLED":
                return "Đã hủy";
            default:
                return status || "Không xác định";
        }
    };

    // Get payment status badge
    const getPaymentBadge = (paymentStatus: string) => {
        switch (paymentStatus) {
            case "PAID":
                return <Badge size="sm" color="success">Đã TT</Badge>;
            case "PENDING":
                return <Badge size="sm" color="warning">Chờ TT</Badge>;
            case "FAILED":
                return <Badge size="sm" color="error">Lỗi TT</Badge>;
            default:
                return null;
        }
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Đơn hàng gần đây
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {orders.length} đơn hàng mới nhất
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={loadOrders}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                    >
                        <svg
                            className="w-4 h-4"
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
                        Làm mới
                    </button>
                    <button
                        onClick={() => router.push("/orders")}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                    >
                        Xem tất cả
                    </button>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent"></div>
                </div>
            )}

            {/* Error */}
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
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400 mb-3 text-sm">
                        {error}
                    </p>
                    <button
                        onClick={loadOrders}
                        className="text-brand-500 hover:text-brand-600 text-sm font-medium"
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {/* Table */}
            {!loading && !error && (
                <div className="max-w-full overflow-x-auto">
                    {orders.length === 0 ? (
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
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                            <p className="text-gray-500 dark:text-gray-400">
                                Chưa có đơn hàng nào
                            </p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="border-y border-gray-100 dark:border-gray-800">
                                <tr>
                                    <th className="py-3 font-medium text-gray-500 text-left text-xs dark:text-gray-400">
                                        Mã đơn
                                    </th>
                                    <th className="py-3 font-medium text-gray-500 text-left text-xs dark:text-gray-400">
                                        Khách hàng
                                    </th>
                                    <th className="py-3 font-medium text-gray-500 text-left text-xs dark:text-gray-400">
                                        Tổng tiền
                                    </th>
                                    <th className="py-3 font-medium text-gray-500 text-left text-xs dark:text-gray-400">
                                        Thời gian
                                    </th>
                                    <th className="py-3 font-medium text-gray-500 text-left text-xs dark:text-gray-400">
                                        Thanh toán
                                    </th>
                                    <th className="py-3 font-medium text-gray-500 text-left text-xs dark:text-gray-400">
                                        Trạng thái
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {orders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                        onClick={() => router.push(`/orders`)}
                                    >
                                        <td className="py-3">
                                            <p className="font-medium text-brand-500 text-sm">
                                                {order.orderCode}
                                            </p>
                                        </td>
                                        <td className="py-3">
                                            <div>
                                                <p className="font-medium text-gray-800 text-sm dark:text-white/90">
                                                    {order.customerName}
                                                </p>
                                                <span className="text-gray-500 text-xs dark:text-gray-400">
                                                    {order.contactPhone}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 text-gray-800 text-sm dark:text-white/90 font-medium">
                                            {formatCurrency(order.totalAmount)}
                                        </td>
                                        <td className="py-3 text-gray-500 text-xs dark:text-gray-400">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="py-3">
                                            {getPaymentBadge(order.paymentStatus)}
                                        </td>
                                        <td className="py-3">
                                            <Badge size="sm" color={getStatusColor(order.status)}>
                                                {getStatusText(order.status)}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}
