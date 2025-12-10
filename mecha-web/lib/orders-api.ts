// lib/orders-api.ts - Orders API functions

import { getJson, postJson, putJson } from "./api";
import type { OrderDto, OrderStatus } from "./types";

export type PaymentMethod = "COD" | "BANK_TRANSFER" | "VNPAY" | "MOMO";

export interface CheckoutRequest {
    paymentMethod: PaymentMethod;
    shippingAddressId?: number; // Use saved address
    shippingAddress?: string; // Or enter new address
    contactPhone?: string; // Phone for new address
    note?: string;
}


// Checkout từ giỏ hàng (cart is already in backend)
export async function checkout(data: CheckoutRequest): Promise<OrderDto> {
    return postJson<CheckoutRequest, OrderDto>("/api/orders/checkout", data);
}

export async function getMyOrders(): Promise<OrderDto[]> {
    return getJson<OrderDto[]>("/api/orders/my");
}

export async function getOrderById(id: number): Promise<OrderDto> {
    return getJson<OrderDto>(`/api/orders/${id}`);
}

export async function cancelOrder(id: number): Promise<OrderDto> {
    return putJson<object, OrderDto>(`/api/orders/${id}/cancel`, {});
}


export function getOrderStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
        PENDING: "Chờ xác nhận",
        CONFIRMED: "Đã xác nhận",
        PROCESSING: "Đang xử lý",
        SHIPPED: "Đang giao",
        DELIVERED: "Đã giao",
        CANCELLED: "Đã hủy",
    };
    return labels[status] || status;
}

export function getOrderStatusColor(status: OrderStatus): string {
    const colors: Record<OrderStatus, string> = {
        PENDING: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
        CONFIRMED: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        PROCESSING: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        SHIPPED: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
        DELIVERED: "bg-green-500/20 text-green-300 border-green-500/30",
        CANCELLED: "bg-red-500/20 text-red-300 border-red-500/30",
    };
    return colors[status] || "bg-slate-500/20 text-slate-300 border-slate-500/30";
}

export function formatOrderDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}
