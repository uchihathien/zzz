/**
 * Orders Service - Quản lý đơn hàng
 */
import { httpClient } from './httpClient';
import type { Order, OrderSearchParams, OrderStatus, PaymentStatus } from '@/types';

export const ordersService = {
    /**
     * [USER] Danh sách đơn hàng của tôi
     */
    async getMyOrders(): Promise<Order[]> {
        return httpClient.get<Order[]>('/api/orders/my');
    },

    /**
     * Xem chi tiết đơn hàng
     */
    async getOrder(id: number): Promise<Order> {
        return httpClient.get<Order>(`/api/orders/${id}`);
    },

    /**
     * [USER] Hủy đơn hàng (chỉ khi PENDING)
     */
    async cancelOrder(id: number): Promise<Order> {
        return httpClient.put<Order>(`/api/orders/${id}/cancel`);
    },

    /**
     * [ADMIN] Tìm kiếm đơn hàng với filter
     */
    async adminSearch(params: OrderSearchParams = {}): Promise<Order[]> {
        return httpClient.get<Order[]>('/api/admin/orders', { params: params as Record<string, string | undefined> });
    },

    /**
     * [ADMIN] Cập nhật trạng thái đơn hàng
     */
    async updateStatus(id: number, status: OrderStatus): Promise<Order> {
        return httpClient.patch<Order>(`/api/admin/orders/${id}/status`, null, {
            params: { status },
        });
    },

    /**
     * [ADMIN] Cập nhật trạng thái thanh toán
     */
    async updatePaymentStatus(id: number, paymentStatus: PaymentStatus): Promise<Order> {
        return httpClient.patch<Order>(`/api/admin/orders/${id}/payment-status`, null, {
            params: { paymentStatus },
        });
    },
};

export default ordersService;
