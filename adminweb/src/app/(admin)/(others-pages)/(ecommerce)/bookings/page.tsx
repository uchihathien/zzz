"use client";
import React, { useEffect, useState, useCallback } from "react";
import { bookingsService } from "@/lib/api";
import type { Booking } from "@/types";
import { BookingStatus } from "@/types";
import { vi } from "@/i18n";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import toast from "react-hot-toast";

interface Technician {
    id: number;
    fullName: string;
    phone: string;
}

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState<BookingStatus | "">("");
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const bookingsPerPage = 10;

    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            let data = await bookingsService.getAllBookings({
                status: statusFilter || undefined,
            });

            // Filter by date range
            if (dateFrom) {
                const fromDate = new Date(dateFrom);
                data = data.filter(b => new Date(b.scheduledDate) >= fromDate);
            }
            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                data = data.filter(b => new Date(b.scheduledDate) <= toDate);
            }

            setBookings(data);
        } catch (err) {
            const msg = err instanceof Error ? err.message : vi.messages.error.generic;
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, dateFrom, dateTo]);

    const fetchTechnicians = async () => {
        try {
            const data = await bookingsService.getTechnicians();
            setTechnicians(data);
        } catch (err) {
            console.error("Failed to fetch technicians:", err);
        }
    };

    useEffect(() => {
        fetchBookings();
        fetchTechnicians();
    }, [fetchBookings]);

    const handleStatusChange = async (bookingId: number, newStatus: BookingStatus) => {
        try {
            await bookingsService.updateStatus(bookingId, newStatus);
            toast.success(`Đã cập nhật trạng thái thành "${vi.status.booking[newStatus]}"`);
            fetchBookings();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : vi.messages.error.generic);
        }
    };

    const handleAssignTechnician = async (bookingId: number, technicianId: number) => {
        try {
            await bookingsService.assignTechnician(bookingId, technicianId);
            const tech = technicians.find(t => t.id === technicianId);
            toast.success(`Đã phân công cho ${tech?.fullName || "kỹ thuật viên"}`);
            fetchBookings();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : vi.messages.error.generic);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Status badge with icons
    const getStatusBadge = (status: BookingStatus) => {
        const config: Record<BookingStatus, { bg: string; text: string; icon: string }> = {
            [BookingStatus.PENDING]: {
                bg: "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700",
                text: "text-amber-700 dark:text-amber-300",
                icon: "⏳"
            },
            [BookingStatus.CONFIRMED]: {
                bg: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700",
                text: "text-blue-700 dark:text-blue-300",
                icon: "✓"
            },
            [BookingStatus.IN_PROGRESS]: {
                bg: "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700",
                text: "text-purple-700 dark:text-purple-300",
                icon: "⚙️"
            },
            [BookingStatus.COMPLETED]: {
                bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700",
                text: "text-emerald-700 dark:text-emerald-300",
                icon: "✅"
            },
            [BookingStatus.CANCELLED]: {
                bg: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700",
                text: "text-red-700 dark:text-red-300",
                icon: "✕"
            },
        };
        const c = config[status];
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border ${c.bg} ${c.text}`}>
                <span>{c.icon}</span>
                {vi.status.booking[status]}
            </span>
        );
    };

    // Stats
    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === BookingStatus.PENDING).length,
        inProgress: bookings.filter(b => b.status === BookingStatus.IN_PROGRESS || b.status === BookingStatus.CONFIRMED).length,
        completed: bookings.filter(b => b.status === BookingStatus.COMPLETED).length,
    };

    // Pagination logic
    const totalPages = Math.ceil(bookings.length / bookingsPerPage);
    const startIndex = (currentPage - 1) * bookingsPerPage;
    const endIndex = startIndex + bookingsPerPage;
    const paginatedBookings = bookings.slice(startIndex, endIndex);

    return (
        <div>
            <PageBreadcrumb pageTitle="Quản lý dịch vụ đã đặt" />

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <span className="text-xl">📋</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Tổng lịch hẹn</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                            <span className="text-xl">⏳</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Chờ xác nhận</p>
                            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                            <span className="text-xl">⚙️</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Đang thực hiện</p>
                            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats.inProgress}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                            <span className="text-xl">✅</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Hoàn thành</p>
                            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completed}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                {/* Filters */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Trạng thái:</label>
                            <select
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as BookingStatus | "")}
                            >
                                <option value="">Tất cả</option>
                                {Object.values(BookingStatus).map((status) => (
                                    <option key={status} value={status}>
                                        {vi.status.booking[status]}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Từ:</label>
                            <input
                                type="date"
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Đến:</label>
                            <input
                                type="date"
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={() => { setDateFrom(''); setDateTo(''); setStatusFilter(''); }}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            Xóa bộ lọc
                        </button>

                        <button
                            onClick={fetchBookings}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Làm mới
                        </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Hiển thị {startIndex + 1}-{Math.min(endIndex, bookings.length)} trong {bookings.length} lịch hẹn
                        </span>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    ← Trước
                                </button>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Trang {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Sau →
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">{vi.messages.loading}</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                            <span className="text-2xl">❌</span>
                        </div>
                        <p className="text-red-500">{error}</p>
                        <button
                            onClick={fetchBookings}
                            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                        >
                            Thử lại
                        </button>
                    </div>
                )}

                {/* Table */}
                {!loading && !error && (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Khách hàng
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Dịch vụ
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Lịch hẹn
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Kỹ thuật viên
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {bookings.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-4xl mb-2">📭</span>
                                                <p className="text-gray-500 dark:text-gray-400">{vi.messages.noData}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                                                        {booking.userName?.charAt(0)?.toUpperCase() || "?"}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {booking.userName}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {booking.phone}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {booking.serviceName}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-sm text-gray-900 dark:text-white">
                                                    {formatDate(booking.scheduledDate)}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                                                    📍 {booking.address}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                {booking.technicianName ? (
                                                    <span className="text-sm text-gray-900 dark:text-white">
                                                        🔧 {booking.technicianName}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-400 italic">
                                                        Chưa phân công
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                {getStatusBadge(booking.status)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => setSelectedBooking(booking)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 transition-colors"
                                                    >
                                                        <span>👁</span> Chi tiết
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
            </div>

            {/* Booking Detail Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Chi tiết lịch hẹn
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    #{selectedBooking.id}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 overflow-y-auto max-h-[60vh] space-y-5">
                            {/* Status row */}
                            <div className="flex items-center gap-4">
                                {getStatusBadge(selectedBooking.status)}
                            </div>

                            {/* Customer info */}
                            <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Khách hàng</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Tên</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedBooking.userName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Điện thoại</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedBooking.phone}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-500 dark:text-gray-400">Địa chỉ</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedBooking.address}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Booking info */}
                            <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Thông tin lịch hẹn</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Dịch vụ</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedBooking.serviceName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Lịch hẹn</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedBooking.scheduledDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Ngày tạo</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedBooking.createdAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Kỹ thuật viên</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {selectedBooking.technicianName || "Chưa phân công"}
                                        </p>
                                    </div>
                                </div>
                                {selectedBooking.note && (
                                    <div className="mt-3">
                                        <p className="text-gray-500 dark:text-gray-400">Ghi chú</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedBooking.note}</p>
                                    </div>
                                )}
                            </div>

                            {/* Update status & assign technician */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Cập nhật</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Trạng thái</label>
                                        <select
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                            value={selectedBooking.status}
                                            onChange={(e) => {
                                                handleStatusChange(selectedBooking.id, e.target.value as BookingStatus);
                                                setSelectedBooking({ ...selectedBooking, status: e.target.value as BookingStatus });
                                            }}
                                        >
                                            {Object.values(BookingStatus).map((status) => (
                                                <option key={status} value={status}>
                                                    {vi.status.booking[status]}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Kỹ thuật viên</label>
                                        <select
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                            value={selectedBooking.technicianId || ""}
                                            onChange={(e) => {
                                                const techId = parseInt(e.target.value);
                                                if (techId) {
                                                    handleAssignTechnician(selectedBooking.id, techId);
                                                    const tech = technicians.find(t => t.id === techId);
                                                    setSelectedBooking({
                                                        ...selectedBooking,
                                                        technicianId: techId,
                                                        technicianName: tech?.fullName
                                                    });
                                                }
                                            }}
                                        >
                                            <option value="">Chọn kỹ thuật viên</option>
                                            {technicians.map((tech) => (
                                                <option key={tech.id} value={tech.id}>
                                                    {tech.fullName} - {tech.phone}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
