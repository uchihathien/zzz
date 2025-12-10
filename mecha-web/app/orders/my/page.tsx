// app/orders/my/page.tsx - My Orders with White/Blue Theme
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/lib/protected-route";
import { getMyOrders, getOrderStatusLabel, getOrderStatusColor } from "@/lib/orders-api";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { formatPrice } from "@/lib/products-api";
import type { OrderDto, OrderStatus } from "@/lib/types";

function MyOrdersContent() {
    const [orders, setOrders] = useState<OrderDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        try {
            setLoading(true);
            setError(null);
            const data = await getMyOrders();
            setOrders(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Không thể tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    }

    const filteredOrders = filter === "ALL"
        ? orders
        : orders.filter(o => o.status === filter);

    const statuses: Array<OrderStatus | "ALL"> = ["ALL", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

    function getLocalStatusLabel(status: OrderStatus | "ALL"): string {
        if (status === "ALL") return "Tất cả";
        return getOrderStatusLabel(status);
    }

    function getLocalStatusColor(status: OrderStatus): string {
        const colors: Record<OrderStatus, string> = {
            PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
            CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
            PROCESSING: "bg-purple-100 text-purple-700 border-purple-200",
            SHIPPED: "bg-cyan-100 text-cyan-700 border-cyan-200",
            DELIVERED: "bg-green-100 text-green-700 border-green-200",
            CANCELLED: "bg-red-100 text-red-700 border-red-200",
        };
        return colors[status];
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
                {/* Top */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-1">Đơn hàng của tôi</h1>
                        <p className="text-slate-500">Theo dõi và quản lý đơn hàng</p>
                    </div>
                    <Link
                        href="/products"
                        className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-sm flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Mua thêm</span>
                    </Link>
                </div>

                {/* Filter */}
                <div className="mb-6 overflow-x-auto">
                    <div className="flex gap-2 min-w-max">
                        {statuses.map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filter === status
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
                                    }`}
                            >
                                {getLocalStatusLabel(status)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="animate-spin h-12 w-12 rounded-full border-4 border-slate-200 border-t-blue-600 mx-auto mb-4" />
                            <p className="text-slate-500">Đang tải...</p>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button onClick={loadOrders} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium">
                            Thử lại
                        </button>
                    </div>
                )}

                {/* Orders */}
                {!loading && !error && (
                    <>
                        {filteredOrders.length > 0 ? (
                            <div className="space-y-4">
                                {filteredOrders.map((order) => (
                                    <Link key={order.id} href={`/orders/${order.id}`} className="block group">
                                        <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg transition-all">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                                                        <h3 className="font-semibold text-slate-800 group-hover:text-blue-600">
                                                            Đơn hàng #{order.orderCode || order.orderNumber || order.id}
                                                        </h3>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getLocalStatusColor(order.status)}`}>
                                                            {getOrderStatusLabel(order.status)}
                                                        </span>
                                                        {/* Payment Status */}
                                                        {order.paymentMethod && (
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${order.paymentStatus === "PAID"
                                                                ? "bg-green-100 text-green-700 border-green-200"
                                                                : "bg-yellow-100 text-yellow-700 border-yellow-200"
                                                                }`}>
                                                                {order.paymentStatus === "PAID" ? "Đã thanh toán" : " Chờ thanh toán"}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-500">
                                                        {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                                                            day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
                                                        })}
                                                        {order.paymentMethod && (
                                                            <span className="ml-2">
                                                                • {order.paymentMethod === "COD" ? "Thanh toán khi nhận" : "Chuyển khoản"}
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-blue-600">{formatPrice(order.totalAmount)}</p>
                                                    <p className="text-sm text-slate-500">{order.items.length} sản phẩm</p>
                                                </div>

                                            </div>

                                            {/* Items preview */}
                                            <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                                                <div className="flex -space-x-2">
                                                    {order.items.slice(0, 3).map((item, idx) => (
                                                        <div key={idx} className="w-10 h-10 rounded-lg bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-500">
                                                            📦
                                                        </div>
                                                    ))}
                                                    {order.items.length > 3 && (
                                                        <div className="w-10 h-10 rounded-lg bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-medium text-blue-600">
                                                            +{order.items.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 ml-2">
                                                    <p className="text-sm text-slate-600 truncate">
                                                        {order.items.map(i => i.productName).join(", ")}
                                                    </p>
                                                </div>
                                                <span className="text-sm text-blue-600 font-medium group-hover:text-blue-700">
                                                    Xem chi tiết →
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                                <div className="text-6xl mb-4">📦</div>
                                <h3 className="text-xl font-semibold text-slate-700 mb-2">Chưa có đơn hàng nào</h3>
                                <p className="text-slate-500 mb-6">Hãy bắt đầu mua sắm ngay!</p>
                                <Link
                                    href="/products"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                >
                                    Xem sản phẩm →
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default function MyOrdersPage() {
    return (
        <ProtectedRoute>
            <MyOrdersContent />
        </ProtectedRoute>
    );
}
