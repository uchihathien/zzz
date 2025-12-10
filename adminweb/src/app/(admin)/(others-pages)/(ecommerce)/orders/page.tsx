"use client";
import React, { useEffect, useState, useCallback } from "react";
import { ordersService } from "@/lib/api";
import type { Order } from "@/types";
import { OrderStatus, PaymentStatus } from "@/types";
import { vi } from "@/i18n";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import toast from "react-hot-toast";

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
    const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "">("");
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            let data = await ordersService.adminSearch({
                status: statusFilter || undefined,
                paymentStatus: paymentFilter || undefined,
            });

            // Filter by date range
            if (dateFrom) {
                const fromDate = new Date(dateFrom);
                data = data.filter(o => new Date(o.createdAt) >= fromDate);
            }
            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                data = data.filter(o => new Date(o.createdAt) <= toDate);
            }

            setOrders(data);
        } catch (err) {
            const msg = err instanceof Error ? err.message : vi.messages.error.generic;
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, paymentFilter, dateFrom, dateTo]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
        try {
            await ordersService.updateStatus(orderId, newStatus);
            // Khi đặt trạng thái "Đã giao" (DELIVERED) thì tự động cập nhật thanh toán thành "Đã thanh toán" (PAID)
            if (newStatus === OrderStatus.DELIVERED) {
                await ordersService.updatePaymentStatus(orderId, PaymentStatus.PAID);
                toast.success(`Đã hoàn thành đơn hàng và cập nhật thanh toán`);
            } else {
                toast.success(`Đã cập nhật trạng thái đơn hàng thành "${vi.status.order[newStatus]}"`);
            }
            fetchOrders();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : vi.messages.error.generic);
        }
    };

    const handlePaymentStatusChange = async (orderId: number, newStatus: PaymentStatus) => {
        try {
            await ordersService.updatePaymentStatus(orderId, newStatus);
            toast.success(`Đã cập nhật trạng thái thanh toán thành "${vi.status.payment[newStatus]}"`);
            fetchOrders();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : vi.messages.error.generic);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
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

    // Print invoice function
    const handlePrintInvoice = (order: Order) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error('Không thể mở cửa sổ in. Vui lòng cho phép popup.');
            return;
        }

        // Build items table rows
        const itemsRows = order.items && order.items.length > 0
            ? order.items.map((item, idx) => `
                <tr>
                    <td style="text-align: center;">${idx + 1}</td>
                    <td>${item.productName || 'Sản phẩm'}</td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">${formatCurrency(item.unitPrice)}</td>
                    <td style="text-align: right; font-weight: 600;">${formatCurrency(item.totalPrice)}</td>
                </tr>
            `).join('')
            : `<tr><td colspan="5" style="text-align: center;">Đơn hàng ${order.orderCode}</td></tr>`;

        const invoiceHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Hóa đơn ${order.orderCode}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #1f2937; background: #fff; }
                    .container { max-width: 800px; margin: 0 auto; }
                    
                    /* Header */
                    .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 3px solid #2563eb; margin-bottom: 25px; }
                    .logo-section { display: flex; align-items: center; gap: 15px; }
                    .logo { height: 50px; }
                    .company-name { font-size: 28px; font-weight: bold; color: #2563eb; }
                    .company-slogan { font-size: 12px; color: #6b7280; margin-top: 4px; }
                    .invoice-title { text-align: right; }
                    .invoice-title h1 { font-size: 26px; color: #1f2937; font-weight: bold; }
                    .invoice-title p { color: #6b7280; margin-top: 5px; }
                    
                    /* Company Info */
                    .company-info { background: #f8fafc; padding: 15px 20px; border-radius: 8px; margin-bottom: 25px; font-size: 13px; }
                    .company-info p { margin: 4px 0; }
                    .company-info strong { color: #374151; }
                    
                    /* Info Grid */
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 25px; }
                    .info-box { padding: 15px; border-radius: 8px; background: #f9fafb; }
                    .info-box h3 { color: #2563eb; font-size: 13px; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; }
                    .info-row { margin: 8px 0; font-size: 14px; }
                    .info-row strong { display: inline-block; min-width: 100px; color: #6b7280; font-weight: 500; }
                    .order-code { font-family: monospace; font-size: 16px; font-weight: bold; color: #2563eb; background: #eff6ff; padding: 4px 10px; border-radius: 4px; }
                    
                    /* Status badges */
                    .status { display: inline-block; padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; }
                    .status-pending { background: #fef3c7; color: #d97706; }
                    .status-paid { background: #d1fae5; color: #059669; }
                    .status-failed { background: #fee2e2; color: #dc2626; }
                    .order-status-pending { background: #fef3c7; color: #d97706; }
                    .order-status-delivered { background: #d1fae5; color: #059669; }
                    .order-status-cancelled { background: #fee2e2; color: #dc2626; }
                    
                    /* Table */
                    table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
                    th { background: #2563eb; color: white; padding: 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
                    th:first-child { border-radius: 8px 0 0 0; }
                    th:last-child { border-radius: 0 8px 0 0; }
                    td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
                    tbody tr:hover { background: #f9fafb; }
                    
                    /* Summary */
                    .summary { display: flex; justify-content: flex-end; }
                    .summary-box { width: 300px; background: #f8fafc; padding: 15px 20px; border-radius: 8px; }
                    .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
                    .summary-row.total { border-top: 2px solid #e5e7eb; margin-top: 8px; padding-top: 12px; }
                    .summary-row.total span:last-child { font-size: 22px; font-weight: bold; color: #2563eb; }
                    
                    /* Footer */
                    .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; }
                    .footer p { margin: 5px 0; font-size: 13px; color: #6b7280; }
                    .footer .thanks { font-size: 16px; color: #2563eb; font-weight: 600; margin-bottom: 10px; }
                    
                    /* Print button */
                    @media print {
                        body { padding: 15px; }
                        .no-print { display: none !important; }
                        .container { max-width: 100%; }
                    }
                    .print-btn { padding: 14px 35px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4); transition: all 0.2s; }
                    .print-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5); }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo-section">
                            <img src="/images/logo/logoBig.png" alt="Getabec" class="logo" onerror="this.style.display='none'">
                            
                        </div>
                        <div class="invoice-title">
                            <h1>HÓA ĐƠN</h1>
                            <p>Số: <strong>${order.orderCode}</strong></p>
                        </div>
                    </div>
                    
                    <div class="company-info">
                        <p><strong>Công ty:</strong> Getabec Vietnam Co., Ltd</p>
                        <p><strong>Địa chỉ:</strong> 123 Đường ABC, Quận 1, TP. Hồ Chí Minh</p>
                        <p><strong>Điện thoại:</strong> 0901 234 567 | <strong>Email:</strong> contact@getabec.vn</p>
                        <p><strong>Mã số thuế:</strong> 0123456789</p>
                    </div>
                    
                    <div class="info-grid">
                        <div class="info-box">
                            <h3>📋 Thông tin đơn hàng</h3>
                            <div class="info-row"><strong>Mã đơn:</strong> <span class="order-code">${order.orderCode}</span></div>
                            <div class="info-row"><strong>Ngày đặt:</strong> ${formatDate(order.createdAt)}</div>
                            <div class="info-row"><strong>Phương thức:</strong> ${order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : order.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản ngân hàng' : order.paymentMethod}</div>
                        </div>
                        <div class="info-box">
                            <h3>👤 Thông tin khách hàng</h3>
                            <div class="info-row"><strong>Họ tên:</strong> ${order.customerName || 'Khách lẻ'}</div>
                            <div class="info-row"><strong>Điện thoại:</strong> ${order.contactPhone || '---'}</div>
                            <div class="info-row"><strong>Địa chỉ:</strong> ${order.shippingAddress || '---'}</div>
                            ${order.note ? `<div class="info-row"><strong>Ghi chú:</strong> ${order.note}</div>` : ''}
                        </div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 50px; text-align: center;">STT</th>
                                <th>Mô tả sản phẩm / Dịch vụ</th>
                                <th style="width: 80px; text-align: center;">SL</th>
                                <th style="width: 130px; text-align: right;">Đơn giá</th>
                                <th style="width: 130px; text-align: right;">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsRows}
                        </tbody>
                    </table>
                    
                    <div class="summary">
                        <div class="summary-box">
                            <div class="summary-row">
                                <span>Tạm tính:</span>
                                <span>${formatCurrency(order.totalAmount)}</span>
                            </div>
                            <div class="summary-row">
                                <span>Phí vận chuyển:</span>
                                <span>Miễn phí</span>
                            </div>
                            <div class="summary-row">
                                <span>Giảm giá:</span>
                                <span>0 ₫</span>
                            </div>
                            <div class="summary-row total">
                                <span>Tổng cộng:</span>
                                <span>${formatCurrency(order.totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p class="thanks"> Cảm ơn Quý khách đã tin tưởng sử dụng dịch vụ của Getabec!</p>
                        <p>Mọi thắc mắc xin liên hệ hotline: <strong>0901 234 567</strong></p>
                        <p>Website: <strong>www.getabec.vn</strong> | Email: <strong>support@getabec.vn</strong></p>
                        <p style="margin-top: 15px; font-style: italic;">Hóa đơn được xuất ngày ${new Date().toLocaleDateString('vi-VN')}</p>
                    </div>
                    
                    <div class="no-print" style="text-align: center; margin-top: 30px;">
                        <button onclick="window.print()" class="print-btn"> In hóa đơn</button>
                    </div>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(invoiceHTML);
        printWindow.document.close();
    };

    // Status badge with icons
    const getStatusBadge = (status: OrderStatus) => {
        const config: Record<OrderStatus, { bg: string; text: string; icon: string }> = {
            [OrderStatus.PENDING]: {
                bg: "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700",
                text: "text-amber-700 dark:text-amber-300",
                icon: "⏳"
            },
            [OrderStatus.DELIVERED]: {
                bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700",
                text: "text-emerald-700 dark:text-emerald-300",
                icon: "✅"
            },
            [OrderStatus.CANCELLED]: {
                bg: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700",
                text: "text-red-700 dark:text-red-300",
                icon: "✕"
            },
        };
        const c = config[status];
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border ${c.bg} ${c.text}`}>
                <span>{c.icon}</span>
                {vi.status.order[status]}
            </span>
        );
    };

    const getPaymentBadge = (status: PaymentStatus) => {
        const config: Record<PaymentStatus, { bg: string; text: string; icon: string }> = {
            [PaymentStatus.PENDING]: {
                bg: "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700",
                text: "text-amber-700 dark:text-amber-300",
                icon: "💳"
            },
            [PaymentStatus.PAID]: {
                bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700",
                text: "text-emerald-700 dark:text-emerald-300",
                icon: "💰"
            },
            [PaymentStatus.FAILED]: {
                bg: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700",
                text: "text-red-700 dark:text-red-300",
                icon: "❌"
            },
        };
        const c = config[status];
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border ${c.bg} ${c.text}`}>
                <span>{c.icon}</span>
                {vi.status.payment[status]}
            </span>
        );
    };

    // Stats - from all orders (not filtered by date for consistency with dashboard)
    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED).length,
        completed: orders.filter(o => o.status === OrderStatus.DELIVERED).length,
        // Revenue from filtered orders (matching current view)
        totalRevenue: orders.filter(o => o.paymentStatus === PaymentStatus.PAID).reduce((sum, o) => sum + o.totalAmount, 0),
    };

    // Pagination logic
    const totalPages = Math.ceil(orders.length / ordersPerPage);
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const paginatedOrders = orders.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    const handleFilterChange = () => {
        setCurrentPage(1);
    };

    return (
        <div>
            <PageBreadcrumb pageTitle={vi.pages.orderList.title} />

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <span className="text-xl">📦</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Tổng đơn</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                            <span className="text-xl"></span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Chờ xử lý</p>
                            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                            <span className="text-xl"></span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Hoàn thành</p>
                            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completed}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                            <span className="text-xl"></span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Doanh thu </p>
                            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.totalRevenue)}</p>
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
                                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "")}
                            >
                                <option value="">Tất cả</option>
                                {Object.values(OrderStatus).map((status) => (
                                    <option key={status} value={status}>
                                        {vi.status.order[status]}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Thanh toán:</label>
                            <select
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={paymentFilter}
                                onChange={(e) => setPaymentFilter(e.target.value as PaymentStatus | "")}
                            >
                                <option value="">Tất cả</option>
                                {Object.values(PaymentStatus).map((status) => (
                                    <option key={status} value={status}>
                                        {vi.status.payment[status]}
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
                            onClick={() => { setDateFrom(''); setDateTo(''); setStatusFilter(''); setPaymentFilter(''); }}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            Xóa bộ lọc
                        </button>

                        <button
                            onClick={fetchOrders}
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
                            Hiển thị {startIndex + 1}-{Math.min(endIndex, orders.length)} trong {orders.length} đơn hàng
                            {(dateFrom || dateTo) && ` (đã lọc theo ngày)`}
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
                            onClick={fetchOrders}
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
                                        Mã đơn
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Khách hàng
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Tổng tiền
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Thanh toán
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Ngày tạo
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-4xl mb-2">📭</span>
                                                <p className="text-gray-500 dark:text-gray-400">{vi.messages.noData}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-4 py-4">
                                                <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                    {order.orderCode}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                                                        {order.customerName?.charAt(0)?.toUpperCase() || "?"}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {order.customerName}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {order.contactPhone}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {formatCurrency(order.totalAmount)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                {getPaymentBadge(order.paymentStatus)}
                                            </td>
                                            <td className="px-4 py-4">
                                                {getStatusBadge(order.status)}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {formatDate(order.createdAt)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 transition-colors"
                                                    >
                                                        <span></span> Chi tiết
                                                    </button>
                                                    <button
                                                        onClick={() => handlePrintInvoice(order)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 transition-colors"
                                                    >
                                                        <span>🖨️</span> In hóa đơn
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

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Chi tiết đơn hàng
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                    {selectedOrder.orderCode}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 overflow-y-auto max-h-[60vh] space-y-5">
                            {/* Status row */}
                            <div className="flex items-center gap-4">
                                {getStatusBadge(selectedOrder.status)}
                                {getPaymentBadge(selectedOrder.paymentStatus)}
                            </div>

                            {/* Customer info */}
                            <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Khách hàng</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Tên</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.customerName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Điện thoại</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.contactPhone}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-500 dark:text-gray-400">Địa chỉ giao hàng</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.shippingAddress || "Chưa có"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order info */}
                            <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Thông tin đơn hàng</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Phương thức thanh toán</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.paymentMethod}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Ngày đặt</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedOrder.createdAt)}</p>
                                    </div>
                                </div>
                                {selectedOrder.note && (
                                    <div className="mt-3">
                                        <p className="text-gray-500 dark:text-gray-400">Ghi chú</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.note}</p>
                                    </div>
                                )}
                            </div>

                            {/* Update status */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Cập nhật trạng thái</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Trạng thái đơn</label>
                                        <select
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                            value={selectedOrder.status}
                                            onChange={(e) => {
                                                handleStatusChange(selectedOrder.id, e.target.value as OrderStatus);
                                                setSelectedOrder({ ...selectedOrder, status: e.target.value as OrderStatus });
                                            }}
                                        >
                                            {Object.values(OrderStatus).map((status) => (
                                                <option key={status} value={status}>
                                                    {vi.status.order[status]}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Thanh toán</label>
                                        <select
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                            value={selectedOrder.paymentStatus}
                                            onChange={(e) => {
                                                handlePaymentStatusChange(selectedOrder.id, e.target.value as PaymentStatus);
                                                setSelectedOrder({ ...selectedOrder, paymentStatus: e.target.value as PaymentStatus });
                                            }}
                                        >
                                            {Object.values(PaymentStatus).map((status) => (
                                                <option key={status} value={status}>
                                                    {vi.status.payment[status]}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                <span className="text-lg font-medium">Tổng tiền</span>
                                <span className="text-2xl font-bold">{formatCurrency(selectedOrder.totalAmount)}</span>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setSelectedOrder(null)}
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
