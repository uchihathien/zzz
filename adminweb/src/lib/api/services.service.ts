/**
 * Services Service - CRUD dịch vụ vệ sinh/bảo trì/sửa chữa
 */
import { httpClient } from './httpClient';

export enum ServiceType {
    CLEANING = 'CLEANING',
    MAINTENANCE = 'MAINTENANCE',
    REPAIR = 'REPAIR',
    OTHER = 'OTHER'
}

export enum ServiceStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

export interface ServiceItem {
    id: number;
    name: string;
    code: string;
    description: string;
    type: ServiceType;
    basePrice: number;
    durationMinutes: number;
    status: ServiceStatus;
}

export interface ServiceCreateRequest {
    name: string;
    code?: string;
    description?: string;
    type: ServiceType;
    basePrice: number;
    durationMinutes?: number;
}

export interface ServiceUpdateRequest {
    name?: string;
    code?: string;
    description?: string;
    type?: ServiceType;
    basePrice?: number;
    durationMinutes?: number;
}

export const servicesService = {
    /**
     * Lấy danh sách dịch vụ
     */
    async getServices(status?: ServiceStatus): Promise<ServiceItem[]> {
        return httpClient.get<ServiceItem[]>('/api/services', {
            params: { status },
            skipAuth: true,
        });
    },

    /**
     * Lấy chi tiết dịch vụ
     */
    async getService(id: number): Promise<ServiceItem> {
        return httpClient.get<ServiceItem>(`/api/services/${id}`, { skipAuth: true });
    },

    /**
     * Tạo dịch vụ mới (ADMIN/STAFF)
     */
    async createService(data: ServiceCreateRequest): Promise<ServiceItem> {
        return httpClient.post<ServiceItem>('/api/services', data);
    },

    /**
     * Cập nhật dịch vụ (ADMIN/STAFF)
     */
    async updateService(id: number, data: ServiceUpdateRequest): Promise<ServiceItem> {
        return httpClient.put<ServiceItem>(`/api/services/${id}`, data);
    },

    /**
     * Đổi trạng thái dịch vụ (ADMIN/STAFF)
     */
    async changeStatus(id: number, status: ServiceStatus): Promise<ServiceItem> {
        return httpClient.patch<ServiceItem>(`/api/services/${id}/status`, null, {
            params: { status },
        });
    },

    /**
     * Xóa dịch vụ (ADMIN/STAFF)
     */
    async deleteService(id: number): Promise<void> {
        return httpClient.delete(`/api/services/${id}`);
    },
};

export default servicesService;
