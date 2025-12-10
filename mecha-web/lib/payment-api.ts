// lib/payment-api.ts - Payment API functions
import { getJson } from "./api";

export type PaymentMethod = "COD" | "BANK_TRANSFER" | "VNPAY" | "MOMO";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface SepayPaymentInfo {
    orderId: number;
    orderCode: string;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    amount: number;
    bankAccountNumber: string;
    bankName: string;
    accountHolderName: string;
    transferContent: string;
    qrImageUrl: string;
}

// Get SePay payment info for order
export async function getSepayPaymentInfo(orderId: number): Promise<SepayPaymentInfo> {
    return getJson<SepayPaymentInfo>(`/api/payment/sepay/info/${orderId}`);
}

// Payment method labels
export function getPaymentMethodLabel(method: PaymentMethod): string {
    const labels: Record<PaymentMethod, string> = {
        COD: "Thanh toán khi nhận hàng",
        BANK_TRANSFER: "Chuyển khoản ngân hàng",
        VNPAY: "VNPay",
        MOMO: "MoMo",
    };
    return labels[method] || method;
}

// Payment status labels
export function getPaymentStatusLabel(status: PaymentStatus): string {
    const labels: Record<PaymentStatus, string> = {
        PENDING: "Chờ thanh toán",
        PAID: "Đã thanh toán",
        FAILED: "Thất bại",
        REFUNDED: "Đã hoàn tiền",
    };
    return labels[status] || status;
}

// Payment status colors
export function getPaymentStatusColor(status: PaymentStatus): string {
    const colors: Record<PaymentStatus, string> = {
        PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
        PAID: "bg-green-100 text-green-700 border-green-200",
        FAILED: "bg-red-100 text-red-700 border-red-200",
        REFUNDED: "bg-blue-100 text-blue-700 border-blue-200",
    };
    return colors[status] || colors.PENDING;
}
