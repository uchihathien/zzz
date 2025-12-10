"use client";
import React, { useEffect, useState } from "react";
import { ordersService } from "@/lib/api/orders.service";
import { Order, PaymentMethod } from "@/types";

export default function RevenueOverview() {
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Calculate revenue by payment method
    const revenueByMethod = {
        COD: orders
            .filter(o => o.paymentMethod === PaymentMethod.COD && o.paymentStatus === "PAID")
            .reduce((sum, o) => sum + o.totalAmount, 0),
        BANK_TRANSFER: orders
            .filter(o => o.paymentMethod === PaymentMethod.BANK_TRANSFER && o.paymentStatus === "PAID")
            .reduce((sum, o) => sum + o.totalAmount, 0),
    };

    // Calculate total revenue
    const totalRevenue = orders
        .filter(o => o.paymentStatus === "PAID")
        .reduce((sum, o) => sum + o.totalAmount, 0);

    // Calculate pending revenue
    const pendingRevenue = orders
        .filter(o => o.paymentStatus === "PENDING")
        .reduce((sum, o) => sum + o.totalAmount, 0);

    // Calculate average order value
    const paidOrders = orders.filter(o => o.paymentStatus === "PAID");
    const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

    // Top customers
    const customerOrders = orders.reduce((acc, order) => {
        const key = order.customerName || "Khách lẻ";
        if (!acc[key]) {
            acc[key] = { name: key, orders: 0, revenue: 0 };
        }
        acc[key].orders++;
        if (order.paymentStatus === "PAID") {
            acc[key].revenue += order.totalAmount;
        }
        return acc;
    }, {} as Record<string, { name: string; orders: number; revenue: number }>);

    const topCustomers = Object.values(customerOrders)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    if (loading) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4"></div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
                💵 Tổng quan doanh thu
            </h3>

            {/* Revenue Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-500/10 dark:to-green-500/5 rounded-xl">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">Đã thu</p>
                    <p className="text-xl font-bold text-green-700 dark:text-green-300">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-500/10 dark:to-amber-500/5 rounded-xl">
                    <p className="text-sm text-amber-600 dark:text-amber-400 mb-1">Chờ thu</p>
                    <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{formatCurrency(pendingRevenue)}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-500/5 rounded-xl">
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">TB / đơn</p>
                    <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{formatCurrency(avgOrderValue)}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-500/10 dark:to-purple-500/5 rounded-xl">
                    <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Tổng đơn</p>
                    <p className="text-xl font-bold text-purple-700 dark:text-purple-300">{orders.length}</p>
                </div>
            </div>

            {/* Revenue by Payment Method */}
            <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Doanh thu theo phương thức thanh toán</h4>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">💵</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Thanh toán khi nhận hàng (COD)</span>
                        </div>
                        <span className="font-bold text-gray-800 dark:text-white">{formatCurrency(revenueByMethod.COD)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🏦</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Chuyển khoản ngân hàng</span>
                        </div>
                        <span className="font-bold text-gray-800 dark:text-white">{formatCurrency(revenueByMethod.BANK_TRANSFER)}</span>
                    </div>
                </div>
            </div>

            {/* Top Customers */}
            <div>
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Top khách hàng</h4>
                <div className="space-y-2">
                    {topCustomers.map((customer, idx) => (
                        <div key={customer.name} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
                            <div className="flex items-center gap-3">
                                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${idx === 0 ? "bg-yellow-400 text-yellow-900" :
                                        idx === 1 ? "bg-gray-300 text-gray-700" :
                                            idx === 2 ? "bg-amber-600 text-white" :
                                                "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                                    }`}>
                                    {idx + 1}
                                </span>
                                <div>
                                    <p className="font-medium text-gray-700 dark:text-gray-300">{customer.name}</p>
                                    <p className="text-xs text-gray-500">{customer.orders} đơn hàng</p>
                                </div>
                            </div>
                            <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(customer.revenue)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
