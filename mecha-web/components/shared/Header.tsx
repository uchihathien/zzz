"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getMyCart, getCartItemCount, type CartDto } from "@/lib/cart-api";
import { Logo } from "@/components/shared/Logo";

export function Header() {
    const { user, logout, loading: authLoading, isAuthenticated } = useAuth();
    const [cartCount, setCartCount] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Load cart count
    useEffect(() => {
        if (isAuthenticated) {
            loadCartCount();
        } else {
            setCartCount(0);
        }

        const handleCartUpdate = (e: CustomEvent<CartDto>) => {
            setCartCount(getCartItemCount(e.detail));
        };

        window.addEventListener("cart-updated", handleCartUpdate as EventListener);
        return () =>
            window.removeEventListener("cart-updated", handleCartUpdate as EventListener);
    }, [isAuthenticated]);

    async function loadCartCount() {
        try {
            const cart = await getMyCart();
            setCartCount(getCartItemCount(cart));
        } catch (err) {
            console.error("Failed to load cart:", err);
        }
    }

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* LOGO */}
                    <Link href="/" className="flex items-center gap-2">
                        <Logo size="big" clickable={false} />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link
                            href="/products"
                            className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
                        >
                            Sản phẩm
                        </Link>
                        <Link
                            href="/services"
                            className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
                        >
                            Dịch vụ
                        </Link>

                        {user && (
                            <>
                                <Link
                                    href="/bookings/my"
                                    className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
                                >
                                    Lịch đặt
                                </Link>
                                <Link
                                    href="/orders/my"
                                    className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
                                >
                                    Đơn hàng
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* RIGHT SIDE – Cart + User Menu */}
                    <div className="flex items-center gap-3">
                        {/* Cart */}
                        <Link
                            href="/cart"
                            className="relative p-2 text-slate-600 hover:text-blue-600 transition-colors"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>

                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">
                                    {cartCount > 9 ? "9+" : cartCount}
                                </span>
                            )}
                        </Link>

                        {/* User Menu */}
                        {!authLoading && (
                            <>
                                {user ? (
                                    <div className="relative group">
                                        <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="text-blue-600 font-semibold text-sm">
                                                    {user.fullName?.charAt(0).toUpperCase() || "U"}
                                                </span>
                                            </div>
                                            <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-24 truncate">
                                                {user.fullName}
                                            </span>

                                            <svg
                                                className="w-4 h-4 text-slate-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </button>

                                        {/* DROPDOWN */}
                                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                            <div className="p-3 border-b border-slate-100">
                                                <p className="text-sm font-medium text-slate-800 truncate">
                                                    {user.fullName}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate">
                                                    {user.email}
                                                </p>

                                                {user.role !== "USER" && (
                                                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                                                        {user.role}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="p-2">
                                                {(user.role === "ADMIN" ||
                                                    user.role === "STAFF") && (
                                                        <Link
                                                            href="/admin"
                                                            className="block px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
                                                        >
                                                            🔧 Quản trị
                                                        </Link>
                                                    )}

                                                {user.role === "TECHNICIAN" && (
                                                    <Link
                                                        href="/technician"
                                                        className="block px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg font-medium"
                                                    >
                                                        🛠️ Công việc của tôi
                                                    </Link>
                                                )}

                                                <Link
                                                    href="/dashboard"
                                                    className="block px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"
                                                >
                                                    Dashboard
                                                </Link>
                                                <Link
                                                    href="/orders/my"
                                                    className="block px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"
                                                >
                                                    Đơn hàng của tôi
                                                </Link>
                                                <Link
                                                    href="/bookings/my"
                                                    className="block px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"
                                                >
                                                    Lịch đặt của tôi
                                                </Link>
                                                <Link
                                                    href="/shipping-addresses"
                                                    className="block px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"
                                                >
                                                    Địa chỉ giao hàng
                                                </Link>

                                                <hr className="my-2 border-slate-100" />

                                                <button
                                                    onClick={logout}
                                                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                                                >
                                                    Đăng xuất
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href="/login"
                                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                                        >
                                            Đăng nhập
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-sm"
                                        >
                                            Đăng ký
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-slate-600 hover:text-blue-600"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d={
                                        mobileMenuOpen
                                            ? "M6 18L18 6M6 6l12 12"
                                            : "M4 6h16M4 12h16M4 18h16"
                                    }
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* MOBILE MENU */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-slate-100">
                        <nav className="flex flex-col gap-2">
                            <Link
                                href="/products"
                                className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium"
                            >
                                Sản phẩm
                            </Link>
                            <Link
                                href="/services"
                                className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium"
                            >
                                Dịch vụ
                            </Link>
                            {user && (
                                <>
                                    <Link
                                        href="/bookings/my"
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium"
                                    >
                                        Lịch đặt
                                    </Link>
                                    <Link
                                        href="/orders/my"
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium"
                                    >
                                        Đơn hàng
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
