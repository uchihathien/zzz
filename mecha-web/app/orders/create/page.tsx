// app/orders/create/page.tsx - Checkout with Address Selection
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/lib/protected-route";
import { getMyCart, clearCart, dispatchCartUpdate, type CartDto } from "@/lib/cart-api";
import { checkout, type PaymentMethod } from "@/lib/orders-api";
import { getMyAddresses, formatFullAddress, type ShippingAddressDto } from "@/lib/shipping-api";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { formatPrice } from "@/lib/products-api";
import toast from "react-hot-toast";

function CreateOrderContent() {
    const router = useRouter();
    const [cart, setCart] = useState<CartDto | null>(null);
    const [addresses, setAddresses] = useState<ShippingAddressDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
    const [useNewAddress, setUseNewAddress] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

    // New address fields
    const [newAddress, setNewAddress] = useState("");
    const [newPhone, setNewPhone] = useState("");
    const [note, setNote] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            const [cartData, addressesData] = await Promise.all([
                getMyCart(),
                getMyAddresses()
            ]);

            setCart(cartData);
            setAddresses(addressesData);

            if (!cartData.items || cartData.items.length === 0) {
                router.push("/cart");
                return;
            }

            // Auto-select default address if exists
            const defaultAddr = addressesData.find(a => a.defaultAddress);
            if (defaultAddr) {
                setSelectedAddressId(defaultAddr.id);
                setUseNewAddress(false);
            } else if (addressesData.length > 0) {
                setSelectedAddressId(addressesData[0].id);
                setUseNewAddress(false);
            } else {
                setUseNewAddress(true);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!useNewAddress && !selectedAddressId) {
            setError("Vui lòng chọn địa chỉ giao hàng");
            return;
        }

        if (useNewAddress && (!newAddress.trim() || !newPhone.trim())) {
            setError("Vui lòng nhập đầy đủ địa chỉ và số điện thoại");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const checkoutData: any = {
                paymentMethod,
                note: note || undefined,
            };

            if (useNewAddress) {
                checkoutData.shippingAddress = newAddress;
                checkoutData.contactPhone = newPhone;
            } else {
                checkoutData.shippingAddressId = selectedAddressId;
            }

            const order = await checkout(checkoutData);

            // Clear cart
            const emptyCart = await clearCart();
            dispatchCartUpdate(emptyCart);

            toast.success("Đặt hàng thành công!");

            // Redirect based on payment method
            if (paymentMethod === "BANK_TRANSFER") {
                router.push(`/orders/${order.id}/payment`);
            } else {
                router.push(`/orders/${order.id}?success=1`);
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Đặt hàng thất bại");
            setError(err.message || "Đặt hàng thất bại");
        } finally {
            setSubmitting(false);
        }
    }


    const items = cart?.items || [];
    const total = cart?.totalAmount || 0;

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

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
                <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-6">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Quay lại giỏ hàng</span>
                </Link>

                <h1 className="text-2xl font-bold text-slate-800 mb-6">Xác nhận đơn hàng</h1>

                <form onSubmit={handleSubmit}>
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Left - Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Payment Method */}


                            {/* Shipping Address */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Địa chỉ giao hàng
                                    </h2>
                                    {addresses.length > 0 && (
                                        <Link
                                            href="/shipping-addresses"
                                            className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            Quản lý địa chỉ
                                        </Link>
                                    )}
                                </div>

                                {/* Saved Addresses */}
                                {addresses.length > 0 && !useNewAddress && (
                                    <div className="space-y-3 mb-4">
                                        {addresses.map((addr) => (
                                            <label
                                                key={addr.id}
                                                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressId === addr.id
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-slate-200 hover:border-blue-200"
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="address"
                                                    value={addr.id}
                                                    checked={selectedAddressId === addr.id}
                                                    onChange={() => setSelectedAddressId(addr.id)}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-medium text-slate-800">{addr.recipientName}</p>
                                                        {addr.defaultAddress && (
                                                            <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium">
                                                                Mặc định
                                                            </span>
                                                        )}
                                                        {addr.label && (
                                                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs">
                                                                {addr.label}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-600">{addr.phone}</p>
                                                    <p className="text-sm text-slate-500 mt-1">{formatFullAddress(addr)}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {/* Toggle new address button */}
                                {addresses.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setUseNewAddress(!useNewAddress)}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-4"
                                    >
                                        {useNewAddress ? "← Chọn địa chỉ đã lưu" : "+ Sử dụng địa chỉ mới"}
                                    </button>
                                )}

                                {/* New Address Form */}
                                {useNewAddress && (
                                    <div className="space-y-4 pt-4 border-t border-slate-200">
                                        <div>
                                            <label className="text-sm font-medium text-slate-700 mb-2 block">
                                                Địa chỉ <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={newAddress}
                                                onChange={(e) => setNewAddress(e.target.value)}
                                                rows={2}
                                                required={useNewAddress}
                                                placeholder="Nhập địa chỉ giao hàng đầy đủ..."
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white resize-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-700 mb-2 block">
                                                Số điện thoại <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                value={newPhone}
                                                onChange={(e) => setNewPhone(e.target.value)}
                                                required={useNewAddress}
                                                placeholder="0901234567"
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                )}
                                {/* Note */}
                                <div className="mt-4">
                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Ghi chú</label>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        rows={2}
                                        placeholder="Ghi chú cho đơn hàng..."
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white resize-none"
                                    />
                                </div>

                                {/* Payment Method */}
                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <h3 className="font-semibold text-slate-800 mb-3">Phương thức thanh toán</h3>
                                    <div className="space-y-3">
                                        <label
                                            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "COD"
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-slate-200 hover:border-blue-200"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="COD"
                                                checked={paymentMethod === "COD"}
                                                onChange={() => setPaymentMethod("COD")}
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-800">💵 Thanh toán khi nhận hàng (COD)</p>
                                                <p className="text-sm text-slate-500">Thanh toán bằng tiền mặt khi nhận hàng</p>
                                            </div>
                                        </label>

                                        <label
                                            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "BANK_TRANSFER"
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-slate-200 hover:border-blue-200"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="BANK_TRANSFER"
                                                checked={paymentMethod === "BANK_TRANSFER"}
                                                onChange={() => setPaymentMethod("BANK_TRANSFER")}
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-800">🏦 Chuyển khoản ngân hàng</p>
                                                <p className="text-sm text-slate-500">Quét QR hoặc chuyển khoản trực tiếp</p>
                                            </div>
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                                                Ưu tiên
                                            </span>
                                        </label>
                                    </div>
                                </div>


                            </div>


                            {/* Items */}
                            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                <div className="p-6 border-b border-slate-100">
                                    <h2 className="font-semibold text-slate-800">Sản phẩm ({items.length})</h2>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {items.map((item) => (
                                        <div key={item.id} className="p-4 flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center text-xl">
                                                {item.itemType === "PRODUCT" ? "📦" : "🛠️"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-800 truncate">
                                                    {item.productName || item.serviceName}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {formatPrice(item.unitPrice)} × {item.quantity}
                                                </p>
                                            </div>
                                            <p className="font-semibold text-slate-800">{formatPrice(item.lineTotal)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right - Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-24">
                                <h3 className="font-semibold text-slate-800 mb-4">Tổng đơn hàng</h3>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Tạm tính</span>
                                        <span className="text-slate-700">{formatPrice(total)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Phí vận chuyển</span>
                                        <span className="text-slate-700">Liên hệ</span>
                                    </div>
                                    <hr className="border-slate-200" />
                                    <div className="flex justify-between">
                                        <span className="font-medium text-slate-700">Tổng cộng</span>
                                        <span className="text-xl font-bold text-blue-600">{formatPrice(total)}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting || items.length === 0}
                                    className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold transition-colors shadow-lg shadow-blue-600/30"
                                >
                                    {submitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Đang xử lý...
                                        </span>
                                    ) : (
                                        "Đặt hàng"
                                    )}
                                </button>

                                <p className="text-xs text-center text-slate-400 mt-4">
                                    Bằng việc đặt hàng, bạn đồng ý với điều khoản sử dụng
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </main>

            <Footer />
        </div>
    );
}

export default function CreateOrderPage() {
    return (
        <ProtectedRoute>
            <CreateOrderContent />
        </ProtectedRoute>
    );
}
