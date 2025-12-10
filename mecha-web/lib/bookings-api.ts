// lib/bookings-api.ts
import { getJson, postJson, API_BASE_URL } from "./api";
import type {
    BookingDto,
    BookingCreateRequest,
    BookingUpdateStatusRequest,
    BookingAssignTechnicianRequest,
    BookingStatus,
} from "./types";

// Create booking (authenticated users)
export async function createBooking(
    data: BookingCreateRequest
): Promise<BookingDto> {
    return postJson<BookingCreateRequest, BookingDto>("/api/bookings", data);
}

// Get my bookings
export async function getMyBookings(): Promise<BookingDto[]> {
    return getJson<BookingDto[]>("/api/bookings/my");
}

// Get assigned bookings (for technicians)
export async function getAssignedBookings(): Promise<BookingDto[]> {
    return getJson<BookingDto[]>("/api/bookings/assigned-to-me");
}

// Get all bookings (ADMIN/STAFF)
export async function getAllBookings(
    status?: BookingStatus,
    from?: string,
    to?: string
): Promise<BookingDto[]> {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    const path = `/api/bookings${params.toString() ? `?${params}` : ""}`;
    return getJson<BookingDto[]>(path);
}

// Get booking by ID
export async function getBookingById(id: number): Promise<BookingDto> {
    return getJson<BookingDto>(`/api/bookings/${id}`);
}

// Update booking status
export async function updateBookingStatus(
    id: number,
    data: BookingUpdateStatusRequest
): Promise<BookingDto> {
    // Backend uses PATCH for status update
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

    console.log("[updateBookingStatus] Token exists:", !!token);

    if (!token) {
        throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");
    }

    const response = await fetch(`${API_BASE_URL}/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error("[updateBookingStatus] Error:", response.status, error);

        if (response.status === 401) {
            throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        }
        if (response.status === 403) {
            throw new Error("Bạn không có quyền thực hiện thao tác này");
        }
        throw new Error(error.message || 'Không thể cập nhật trạng thái');
    }

    return response.json();
}

// Assign technician (ADMIN/STAFF)
export async function assignTechnician(
    id: number,
    data: BookingAssignTechnicianRequest
): Promise<BookingDto> {
    // Backend uses PATCH for assign technician
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const response = await fetch(`${API_BASE_URL}/api/bookings/${id}/assign-technician`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Không thể gán kỹ thuật viên');
    }

    return response.json();
}

// Cancel booking (user can cancel their own booking)
export async function cancelBooking(id: number): Promise<BookingDto> {
    return updateBookingStatus(id, { status: "CANCELLED" });
}

// Helper to get booking status label
export function getBookingStatusLabel(status: BookingStatus): string {
    const labels: Record<BookingStatus, string> = {
        PENDING: "Chờ xác nhận",
        CONFIRMED: "Đã xác nhận",
        IN_PROGRESS: "Đang thực hiện",
        COMPLETED: "Hoàn thành",
        CANCELLED: "Đã hủy",
    };
    return labels[status] || status;
}

// Helper to get booking status color
export function getBookingStatusColor(status: BookingStatus): string {
    const colors: Record<BookingStatus, string> = {
        PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        CONFIRMED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        IN_PROGRESS: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        COMPLETED: "bg-green-500/20 text-green-400 border-green-500/30",
        CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return colors[status] || colors.PENDING;
}

// Helper to format datetime
export function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(date);
}

// Helper to format date only
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "long",
    }).format(date);
}

// Helper to format time only
export function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
        timeStyle: "short",
    }).format(date);
}

// Helper to format price
export function formatPrice(price: number): string {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(price);
}

// Helper to check if booking can be cancelled by user
export function canUserCancelBooking(status: BookingStatus): boolean {
    return status === "PENDING" || status === "CONFIRMED";
}

// Helper to check if technician can update status
export function canTechnicianUpdateStatus(
    currentStatus: BookingStatus,
    newStatus: BookingStatus
): boolean {
    const allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
        PENDING: [],
        CONFIRMED: ["IN_PROGRESS"],
        IN_PROGRESS: ["COMPLETED"],
        COMPLETED: [],
        CANCELLED: [],
    };

    return allowedTransitions[currentStatus]?.includes(newStatus) || false;
}
