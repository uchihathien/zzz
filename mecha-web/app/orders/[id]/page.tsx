// app/orders/[id]/page.tsx - Order Detail with White/Blue Theme
"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/lib/protected-route";
import { getOrderById, cancelOrder, getOrderStatusLabel } from "@/lib/orders-api";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { formatPrice } from "@/lib/products-api";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import toast from "react-hot-toast";
import type { OrderDto, OrderStatus } from "@/lib/types";

function OrderDetailContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const orderId = parseInt(params.id as string);
    const isSuccess = searchParams.get("success") === "1";
    const confirm = useConfirm();

    const [order, setOrder] = useState<OrderDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        loadOrder();
    }, [orderId]);

    async function loadOrder() {
        try {
            setLoading(true);
            setError(null);
            const data = await getOrderById(orderId);
            setOrder(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Không thể tải đơn hàng");
        } finally {
            setLoading(false);
        }
    }

    async function handleCancel() {
        const confirmed = await confirm({
            title: "Hủy đơn hàng",
            message: "Bạn có chắc muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.",
            confirmText: "Hủy đơn",
            cancelText: "Quay lại",
            type: "danger",
        });

        if (!confirmed) return;

        try {
            setCancelling(true);
            await cancelOrder(orderId);
            toast.success("Đã hủy đơn hàng thành công!");
            await loadOrder();
        } catch (err: any) {
            toast.error(err.message || "Hủy đơn thất bại");
        } finally {
            setCancelling(false);
        }
    }


    function getStatusColor(status: OrderStatus): string {
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

    if (error || !order) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white border border-red-200 rounded-xl p-6 text-center shadow-sm">
                    <div className="text-5xl mb-4">😕</div>
                    <p className="text-red-600 mb-4">{error || "Không tìm thấy đơn hàng"}</p>
                    <Link href="/orders/my" className="inline-block px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium">
                        ← Danh sách đơn hàng
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
                {/* Success Banner */}
                {isSuccess && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="font-semibold text-green-800">Đặt hàng thành công!</p>
                            <p className="text-sm text-green-600">Chúng tôi sẽ liên hệ xác nhận đơn hàng sớm nhất</p>
                        </div>
                    </div>
                )}

                {/* Back */}
                <Link href="/orders/my" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-6">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Danh sách đơn hàng</span>
                </Link>

                {/* Order Header */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Đơn hàng #{order.orderNumber || order.id}</h1>
                            <p className="text-slate-500">
                                {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                                    weekday: "long", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
                                })}
                            </p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                            {getOrderStatusLabel(order.status)}
                        </span>
                    </div>
                </div>

                {/* Order Items */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mb-6">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="font-semibold text-slate-800">Sản phẩm ({order.items.length})</h2>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="p-6 flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">
                                    {item.itemType === "SERVICE" ? "🛠️" : "📦"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-slate-800 truncate">
                                        {item.productName || item.serviceName || "Sản phẩm"}
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        {formatPrice(item.unitPrice)} × {item.quantity}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-blue-600">{formatPrice(item.lineTotal)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-100">
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-slate-700">Tổng cộng</span>
                            <span className="text-2xl font-bold text-blue-600">{formatPrice(order.totalAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* Shipping Info */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
                    <h2 className="font-semibold text-slate-800 mb-4">Thông tin giao hàng</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-slate-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-slate-700">{order.shippingAddress}</p>
                        </div>
                        {order.note && (
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-slate-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                                <p className="text-slate-600">{order.note}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment Info */}
                {order.paymentMethod && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
                        <h2 className="font-semibold text-slate-800 mb-4">Thanh toán</h2>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm text-slate-500">Phương thức</p>
                                <p className="font-medium text-slate-800">
                                    {order.paymentMethod === "COD" ? "💵 Thanh toán khi nhận hàng" : "🏦 Chuyển khoản ngân hàng"}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-slate-500 mb-1">Trạng thái</p>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${order.paymentStatus === "PAID"
                                    ? "bg-green-100 text-green-700 border-green-200"
                                    : order.paymentStatus === "FAILED"
                                        ? "bg-red-100 text-red-700 border-red-200"
                                        : "bg-yellow-100 text-yellow-700 border-yellow-200"
                                    }`}>
                                    {order.paymentStatus === "PAID" ? "Đã thanh toán"
                                        : order.paymentStatus === "FAILED" ? "Thất bại"
                                            : order.paymentStatus === "REFUNDED" ? "Đã hoàn tiền"
                                                : "Chờ thanh toán"}
                                </span>
                            </div>
                        </div>

                        {/* Show payment link for unpaid bank transfer orders */}
                        {order.paymentMethod === "BANK_TRANSFER" && order.paymentStatus === "PENDING" && order.status !== "CANCELLED" && (
                            <Link
                                href={`/orders/${order.id}/payment`}
                                className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Thanh toán ngay
                            </Link>
                        )}
                    </div>
                )}


                {/* Actions */}
                {order.status === "PENDING" && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <button
                            onClick={handleCancel}
                            disabled={cancelling}
                            className="w-full py-3 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 font-medium transition-colors disabled:opacity-50"
                        >
                            {cancelling ? "Đang hủy..." : "Hủy đơn hàng"}
                        </button>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default function OrderDetailPage() {
    return (
        <ProtectedRoute>
            <OrderDetailContent />
        </ProtectedRoute>
    );
}
