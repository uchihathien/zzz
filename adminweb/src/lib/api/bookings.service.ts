/**
 * Bookings Service - Quản lý lịch đặt dịch vụ
 */
import { httpClient } from "./httpClient";
import type { Booking, BookingSearchParams, BookingStatus } from "@/types";

export const bookingsService = {
    /**
     * [USER] Đặt lịch dịch vụ mới
     */
    async createBooking(data: {
        serviceId: number;
        scheduledDate: string;
        address: string;
        phone: string;
        note?: string;
    }): Promise<Booking> {
        return httpClient.post<Booking>("/api/bookings", data);
    },

    /**
     * [USER] Danh sách lịch đặt của tôi
     */
    async getMyBookings(): Promise<Booking[]> {
        return httpClient.get<Booking[]>("/api/bookings/my");
    },

    /**
     * [TECHNICIAN] Danh sách lịch được phân công
     */
    async getAssignedBookings(): Promise<Booking[]> {
        return httpClient.get<Booking[]>("/api/bookings/assigned-to-me");
    },

    /**
     * [ADMIN] Lấy tất cả lịch đặt với filter
     */
    async getAllBookings(params: BookingSearchParams = {}): Promise<Booking[]> {
        return httpClient.get<Booking[]>("/api/bookings", {
            params: params as Record<string, string | undefined>,
        });
    },

    /**
     * Xem chi tiết lịch đặt
     */
    async getBooking(id: number): Promise<Booking> {
        return httpClient.get<Booking>(`/api/bookings/${id}`);
    },

    /**
     * [ADMIN/STAFF] Cập nhật trạng thái lịch đặt
     */
    async updateStatus(id: number, status: BookingStatus): Promise<Booking> {
        return httpClient.patch<Booking>(`/api/bookings/${id}/status`, { status });
    },

    /**
     * [ADMIN/STAFF] Phân công kỹ thuật viên
     */
    async assignTechnician(
        bookingId: number,
        technicianId: number
    ): Promise<Booking> {
        return httpClient.patch<Booking>(
            `/api/bookings/${bookingId}/assign-technician`,
            { technicianId }
        );
    },

    /**
     * [ADMIN/STAFF] Lấy danh sách kỹ thuật viên
     */
    async getTechnicians(): Promise<
        { id: number; fullName: string; phone: string }[]
    > {
        const users = await httpClient.get<
            { id: number; fullName: string; phone: string; role: string }[]
        >("/api/admin/users", {
            params: { role: "TECHNICIAN" },
        });
        return users || [];
    },
};

export default bookingsService;
