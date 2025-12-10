// app/cart/page.tsx - Shopping Cart with Database Storage
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
    getMyCart, updateCartItem, removeCartItem, clearCart,
    getCartTotal, dispatchCartUpdate, type CartDto, type CartItemDto
} from "@/lib/cart-api";
import { formatPrice } from "@/lib/products-api";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";

export default function CartPage() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [cart, setCart] = useState<CartDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<number | null>(null);

    useEffect(() => {
        if (!authLoading) {
            if (isAuthenticated) {
                loadCart();
            } else {
                setLoading(false);
            }
        }
    }, [isAuthenticated, authLoading]);

    async function loadCart() {
        try {
            setLoading(true);
            setError(null);
            const data = await getMyCart();
            setCart(data);
            dispatchCartUpdate(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Không thể tải giỏ hàng");
        } finally {
            setLoading(false);
        }
    }

    async function handleQuantityChange(itemId: number, newQuantity: number) {
        if (newQuantity <= 0) {
            await handleRemove(itemId);
            return;
        }

        try {
            setUpdating(itemId);
            const updated = await updateCartItem(itemId, newQuantity);
            setCart(updated);
            dispatchCartUpdate(updated);
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Cập nhật thất bại");
        } finally {
            setUpdating(null);
        }
    }

    async function handleRemove(itemId: number) {
        try {
            setUpdating(itemId);
            const updated = await removeCartItem(itemId);
            setCart(updated);
            dispatchCartUpdate(updated);
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Xóa thất bại");
        } finally {
            setUpdating(null);
        }
    }

    async function handleClearCart() {
        if (!confirm("Bạn có chắc muốn xóa tất cả sản phẩm?")) return;
        try {
            setLoading(true);
            const updated = await clearCart();
            setCart(updated);
            dispatchCartUpdate(updated);
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Xóa giỏ hàng thất bại");
        } finally {
            setLoading(false);
        }
    }

    const total = getCartTotal(cart);
    const items = cart?.items || [];

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 rounded-full border-4 border-slate-200 border-t-blue-600 mx-auto mb-4" />
                    <p className="text-slate-500">Đang tải giỏ hàng...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center px-4 py-8">
                    <div className="text-center bg-white rounded-2xl border border-slate-200 p-12 max-w-md">
                        <div className="text-6xl mb-4">🔒</div>
                        <h2 className="text-2xl font-bold text-slate-700 mb-2">Vui lòng đăng nhập</h2>
                        <p className="text-slate-500 mb-6">Đăng nhập để xem và quản lý giỏ hàng của bạn</p>
                        <div className="flex flex-col gap-3">
                            <Link
                                href="/login"
                                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                href="/register"
                                className="px-6 py-3 rounded-xl border-2 border-blue-600 text-blue-600 font-medium hover:bg-blue-50"
                            >
                                Đăng ký tài khoản
                            </Link>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center px-4 py-8">
                    <div className="text-center bg-white rounded-2xl border border-red-200 p-12 max-w-md">
                        <div className="text-5xl mb-4">😕</div>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={loadCart}
                            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
                        >
                            Thử lại
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Giỏ hàng</h1>
                    <p className="text-slate-500">{items.length} sản phẩm trong giỏ</p>
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                        <div className="text-6xl mb-4">🛒</div>
                        <h2 className="text-2xl font-bold text-slate-700 mb-2">Giỏ hàng trống</h2>
                        <p className="text-slate-500 mb-6">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục</p>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
                        >
                            Xem sản phẩm →
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-500">{items.length} sản phẩm</span>
                                <button onClick={handleClearCart} className="text-sm text-red-500 hover:text-red-700 font-medium">
                                    Xóa tất cả
                                </button>
                            </div>

                            {items.map((item) => (
                                <CartItemCard
                                    key={item.id}
                                    item={item}
                                    updating={updating === item.id}
                                    onQuantityChange={handleQuantityChange}
                                    onRemove={handleRemove}
                                />
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 sticky top-24 shadow-sm">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Tổng đơn hàng</h3>

                                <div className="space-y-3 mb-6">
                                    {items.map(item => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="text-slate-500 truncate max-w-40">
                                                {item.productName || item.serviceName} ×{item.quantity}
                                            </span>
                                            <span className="text-slate-700 font-medium">{formatPrice(item.lineTotal)}</span>
                                        </div>
                                    ))}
                                    <hr className="border-slate-200" />
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
                                        <span className="text-slate-700 font-medium">Tổng cộng</span>
                                        <span className="text-2xl font-bold text-blue-600">{formatPrice(total)}</span>
                                    </div>
                                </div>

                                <Link
                                    href="/orders/create"
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/30 transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                    Tiến hành đặt hàng
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

function CartItemCard({
    item,
    updating,
    onQuantityChange,
    onRemove,
}: {
    item: CartItemDto;
    updating: boolean;
    onQuantityChange: (itemId: number, quantity: number) => void;
    onRemove: (itemId: number) => void;
}) {
    const name = item.productName || item.serviceName || "Sản phẩm";
    const link = item.productId ? `/products/${item.productId}` : `/services/${item.serviceId}`;
    const icon = item.itemType === "PRODUCT" ? "📦" : "🛠️";

    return (
        <div className={`bg-white border border-slate-200 rounded-2xl p-5 flex gap-4 transition-all ${updating ? "opacity-60" : "hover:border-blue-200"}`}>
            {/* Image */}
            <Link href={link} className="w-24 h-24 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center text-3xl">
                {icon}
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <Link href={link} className="text-slate-800 font-medium hover:text-blue-600 line-clamp-2">
                    {name}
                </Link>
                <p className="text-sm text-slate-500 mt-1">
                    Đơn giá: {formatPrice(item.unitPrice)}
                    {item.itemType === "SERVICE" && <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Dịch vụ</span>}
                </p>

                {/* Quantity */}
                <div className="flex items-center gap-3 mt-3">
                    <button
                        onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                        disabled={updating}
                        className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 flex items-center justify-center font-bold transition-colors"
                    >
                        −
                    </button>
                    <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => onQuantityChange(item.id, parseInt(e.target.value) || 1)}
                        disabled={updating}
                        className="w-16 px-2 py-2 text-center rounded-lg bg-white border border-slate-200 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <button
                        onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                        disabled={updating}
                        className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 flex items-center justify-center font-bold transition-colors"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Price & Remove */}
            <div className="flex flex-col items-end justify-between">
                <button
                    onClick={() => onRemove(item.id)}
                    disabled={updating}
                    className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-50 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
                <span className="text-xl font-bold text-blue-600">{formatPrice(item.lineTotal)}</span>
            </div>
        </div>
    );
}
