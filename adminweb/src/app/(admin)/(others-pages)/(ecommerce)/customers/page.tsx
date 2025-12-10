"use client";
import React, { useEffect, useState, useCallback } from "react";
import { customersService } from "@/lib/api";
import type { User } from "@/types";
import { AccountStatus } from "@/types";
import { vi } from "@/i18n";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function CustomersPage() {
    const { user: currentUser } = useAuth();
    const [customers, setCustomers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    // Modal states
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // Check if current user is ADMIN
    const isAdmin = currentUser?.role === "ADMIN";

    const fetchCustomers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await customersService.getCustomers();
            setCustomers(data);
        } catch (err) {
            const msg = err instanceof Error ? err.message : vi.messages.error.generic;
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    // Khóa tài khoản
    const handleLockAccount = async (customer: User) => {
        if (!confirm(`Bạn có chắc muốn khóa tài khoản "${customer.fullName || customer.email}"?`)) {
            return;
        }
        try {
            setActionLoading(true);
            await customersService.lockAccount(customer.id);
            await fetchCustomers();
            toast.success("Đã khóa tài khoản thành công!");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
        } finally {
            setActionLoading(false);
        }
    };

    // Mở khóa tài khoản
    const handleUnlockAccount = async (customer: User) => {
        if (!confirm(`Bạn có chắc muốn mở khóa tài khoản "${customer.fullName || customer.email}"?`)) {
            return;
        }
        try {
            setActionLoading(true);
            await customersService.unlockAccount(customer.id);
            await fetchCustomers();
            toast.success("Đã mở khóa tài khoản thành công!");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
        } finally {
            setActionLoading(false);
        }
    };

    // Mở modal đặt lại mật khẩu
    const openResetPasswordModal = (customer: User) => {
        setSelectedCustomer(customer);
        setNewPassword("");
        setShowResetPasswordModal(true);
    };

    // Đặt lại mật khẩu
    const handleResetPassword = async () => {
        if (!selectedCustomer) return;
        if (!newPassword || newPassword.length < 6) {
            toast.error("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }
        try {
            setActionLoading(true);
            await customersService.resetPassword(selectedCustomer.id, newPassword);
            setShowResetPasswordModal(false);
            setNewPassword("");
            setSelectedCustomer(null);
            toast.success("Đã cập nhật mật khẩu thành công!");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString("vi-VN");
    };

    const getStatusBadge = (status: AccountStatus) => {
        const colors: Record<AccountStatus, string> = {
            [AccountStatus.ACTIVE]:
                "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
            [AccountStatus.SUSPENDED]:
                "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
            [AccountStatus.PENDING_VERIFICATION]:
                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        };
        return (
            <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || "bg-gray-100 text-gray-800"}`}
            >
                {vi.status.account[status] || status}
            </span>
        );
    };

    // Filter customers by search
    const filteredCustomers = customers.filter((customer) => {
        const searchLower = search.toLowerCase();
        return (
            customer.fullName?.toLowerCase().includes(searchLower) ||
            customer.email?.toLowerCase().includes(searchLower) ||
            customer.phone?.toLowerCase().includes(searchLower)
        );
    });

    // Kiểm tra quyền Admin
    if (!isAdmin) {
        return (
            <div>
                <PageBreadcrumb pageTitle={vi.pages.customerList.title} />
                <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03] text-center">
                    <svg
                        className="w-16 h-16 mx-auto mb-4 text-red-300 dark:text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 mb-2">
                        Không có quyền truy cập
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Chỉ Admin mới có quyền quản lý khách hàng
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageBreadcrumb pageTitle={vi.pages.customerList.title} />

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                Quản lý khách hàng
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Chỉ Admin mới có quyền khóa tài khoản và đặt lại mật khẩu
                            </p>
                        </div>
                        <button
                            onClick={fetchCustomers}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Đang tải..." : vi.actions.refresh}
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <input
                        type="text"
                        placeholder={vi.pages.customerList.searchPlaceholder}
                        className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Loading */}
                {loading && (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                            {vi.messages.loading}
                        </p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="p-8 text-center text-red-500">{error}</div>
                )}

                {/* Table */}
                {!loading && !error && (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {vi.pages.customerList.columns.name}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {vi.pages.customerList.columns.email}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {vi.pages.customerList.columns.phone}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {vi.pages.customerList.columns.status}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {vi.pages.customerList.columns.createdAt}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {vi.pages.customerList.columns.actions}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredCustomers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            {vi.messages.noData}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCustomers.map((customer) => (
                                        <tr
                                            key={customer.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                                {customer.fullName || "—"}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                {customer.email}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                {customer.phone || "—"}
                                            </td>
                                            <td className="px-4 py-3">
                                                {getStatusBadge(customer.status)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                {formatDate(customer.createdAt)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {/* Khóa/Mở khóa tài khoản */}
                                                    {customer.status === AccountStatus.ACTIVE ? (
                                                        <button
                                                            onClick={() => handleLockAccount(customer)}
                                                            disabled={actionLoading}
                                                            className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 disabled:opacity-50"
                                                            title="Khóa tài khoản"
                                                        >
                                                            Khóa
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleUnlockAccount(customer)}
                                                            disabled={actionLoading}
                                                            className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 disabled:opacity-50"
                                                            title="Mở khóa tài khoản"
                                                        >
                                                            Mở khóa
                                                        </button>
                                                    )}

                                                    {/* Đặt lại mật khẩu */}
                                                    <button
                                                        onClick={() => openResetPasswordModal(customer)}
                                                        disabled={actionLoading}
                                                        className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 disabled:opacity-50"
                                                        title="Đặt lại mật khẩu"
                                                    >
                                                        Đổi MK
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Summary */}
                {!loading && !error && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                        Hiển thị {filteredCustomers.length} / {customers.length} khách hàng
                    </div>
                )}
            </div>

            {/* Reset Password Modal */}
            {showResetPasswordModal && selectedCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            Đặt lại mật khẩu
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Đặt mật khẩu mới cho:{" "}
                            <strong>{selectedCustomer.fullName || selectedCustomer.email}</strong>
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Mật khẩu mới
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowResetPasswordModal(false);
                                    setSelectedCustomer(null);
                                    setNewPassword("");
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleResetPassword}
                                disabled={actionLoading || !newPassword || newPassword.length < 6}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {actionLoading ? "Đang xử lý..." : "Cập nhật"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
