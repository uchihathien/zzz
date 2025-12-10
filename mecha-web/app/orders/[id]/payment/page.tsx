// app/orders/[id]/payment/page.tsx - SePay Payment Page
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/lib/protected-route";
import { getOrderById } from "@/lib/orders-api";
import { getSepayPaymentInfo, getPaymentStatusLabel, type SepayPaymentInfo } from "@/lib/payment-api";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { formatPrice } from "@/lib/products-api";
import type { OrderDto } from "@/lib/types";

function PaymentContent() {
    const params = useParams();
    const router = useRouter();
    const orderId = parseInt(params.id as string);

    const [order, setOrder] = useState<OrderDto | null>(null);
    const [paymentInfo, setPaymentInfo] = useState<SepayPaymentInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [checking, setChecking] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [orderId]);

    // Auto check payment status every 10 seconds
    useEffect(() => {
        if (!order || order.paymentStatus === "PAID") return;

        const interval = setInterval(async () => {
            try {
                setChecking(true);
                const updatedOrder = await getOrderById(orderId);
                if (updatedOrder.paymentStatus === "PAID") {
                    setOrder(updatedOrder);
                    clearInterval(interval);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setChecking(false);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [order, orderId]);

    async function loadData() {
        try {
            setLoading(true);
            setError(null);

            const [orderData, paymentData] = await Promise.all([
                getOrderById(orderId),
                getSepayPaymentInfo(orderId)
            ]);

            setOrder(orderData);
            setPaymentInfo(paymentData);

            // Already paid, redirect to order detail
            if (orderData.paymentStatus === "PAID") {
                router.push(`/orders/${orderId}?success=1`);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Không thể tải thông tin thanh toán");
        } finally {
            setLoading(false);
        }
    }

    async function handleCheckPayment() {
        try {
            setChecking(true);
            const updatedOrder = await getOrderById(orderId);
            setOrder(updatedOrder);

            if (updatedOrder.paymentStatus === "PAID") {
                router.push(`/orders/${orderId}?success=1`);
            }
        } catch (err: any) {
            console.error(err);
        } finally {
            setChecking(false);
        }
    }

    function copyToClipboard(text: string, label: string) {
        navigator.clipboard.writeText(text);
        setCopied(label);
        setTimeout(() => setCopied(null), 2000);
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 rounded-full border-4 border-slate-200 border-t-blue-600 mx-auto mb-4" />
                    <p className="text-slate-500">Đang tải thông tin thanh toán...</p>
                </div>
            </div>
        );
    }

    if (error || !paymentInfo || !order) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white border border-red-200 rounded-xl p-6 text-center shadow-sm">
                    <div className="text-5xl mb-4">⚠️</div>
                    <p className="text-red-600 mb-4">{error || "Không tìm thấy thông tin thanh toán"}</p>
                    <Link href={`/orders/${orderId}`} className="inline-block px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium">
                        Xem đơn hàng
                    </Link>
                </div>
            </div>
        );
    }

    // Already paid
    if (order.paymentStatus === "PAID") {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white border border-green-200 rounded-xl p-8 text-center shadow-sm">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-green-800 mb-2">Thanh toán thành công!</h1>
                    <p className="text-slate-600 mb-6">Đơn hàng #{order.orderCode || order.id} đã được thanh toán</p>
                    <Link href={`/orders/${orderId}?success=1`} className="inline-block px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition-colors">
                        Xem chi tiết đơn hàng
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
                {/* Back */}
                <Link href={`/orders/${orderId}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-6">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Quay lại đơn hàng</span>
                </Link>

                <h1 className="text-2xl font-bold text-slate-800 mb-2">Thanh toán đơn hàng</h1>
                <p className="text-slate-500 mb-6">Mã đơn: <span className="font-medium text-slate-700">#{paymentInfo.orderCode}</span></p>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Left - QR Code */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 text-center">Quét mã QR để thanh toán</h2>

                        <div className="bg-white border-2 border-slate-200 rounded-xl p-4 mb-4">
                            <img
                                src={paymentInfo.qrImageUrl}
                                alt="QR Code thanh toán"
                                className="w-full max-w-xs mx-auto"
                            />
                        </div>

                        <div className="text-center">
                            <p className="text-3xl font-bold text-blue-600 mb-2">
                                {formatPrice(paymentInfo.amount)}
                            </p>
                            <p className="text-sm text-slate-500">Số tiền cần thanh toán</p>
                        </div>
                    </div>

                    {/* Right - Bank Info */}
                    <div className="space-y-4">
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4">Hoặc chuyển khoản thủ công</h2>

                            <div className="space-y-4">
                                {/* Bank Name */}
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <div>
                                        <p className="text-xs text-slate-500">Ngân hàng</p>
                                        <p className="font-medium text-slate-800">{paymentInfo.bankName}</p>
                                    </div>
                                </div>

                                {/* Account Number */}
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <div>
                                        <p className="text-xs text-slate-500">Số tài khoản</p>
                                        <p className="font-mono font-bold text-slate-800 text-lg">{paymentInfo.bankAccountNumber}</p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(paymentInfo.bankAccountNumber, "account")}
                                        className="px-3 py-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        {copied === "account" ? "✓ Đã sao chép" : "Sao chép"}
                                    </button>
                                </div>

                                {/* Account Holder */}
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <div>
                                        <p className="text-xs text-slate-500">Chủ tài khoản</p>
                                        <p className="font-medium text-slate-800">{paymentInfo.accountHolderName}</p>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <div>
                                        <p className="text-xs text-slate-500">Số tiền</p>
                                        <p className="font-bold text-blue-600 text-lg">{formatPrice(paymentInfo.amount)}</p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(paymentInfo.amount.toString(), "amount")}
                                        className="px-3 py-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        {copied === "amount" ? "✓ Đã sao chép" : "Sao chép"}
                                    </button>
                                </div>

                                {/* Transfer Content */}
                                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                                    <div>
                                        <p className="text-xs text-yellow-700">Nội dung chuyển khoản (bắt buộc)</p>
                                        <p className="font-mono font-bold text-yellow-800 text-lg">{paymentInfo.transferContent}</p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(paymentInfo.transferContent, "content")}
                                        className="px-3 py-2 bg-yellow-200 text-yellow-700 hover:bg-yellow-300 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        {copied === "content" ? "✓ Đã sao chép" : "Sao chép"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-slate-600">Trạng thái thanh toán</span>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-full text-sm font-medium">
                                    {getPaymentStatusLabel(paymentInfo.paymentStatus)}
                                </span>
                            </div>

                            <button
                                onClick={handleCheckPayment}
                                disabled={checking}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {checking ? (
                                    <>
                                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                        Đang kiểm tra...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Kiểm tra thanh toán
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-slate-500 text-center mt-3">
                                Hệ thống tự động kiểm tra mỗi 10 giây
                            </p>
                        </div>

                        {/* Instructions */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                            <p className="font-medium mb-2">💡 Hướng dẫn thanh toán:</p>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>Quét mã QR bằng app ngân hàng hoặc ví điện tử</li>
                                <li>Kiểm tra thông tin và xác nhận thanh toán</li>
                                <li>Nhập đúng nội dung chuyển khoản</li>
                                <li>Đợi hệ thống xác nhận (thường trong 1-2 phút)</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function PaymentPage() {
    return (
        <ProtectedRoute>
            <PaymentContent />
        </ProtectedRoute>
    );
}
