// lib/services-api.ts
import { getJson, postJson, putJson, deleteJson, API_BASE_URL } from "./api";
import type {
    ServiceDto,
    ServiceCreateRequest,
    ServiceUpdateRequest,
    ServiceStatus,
} from "./types";

// Get list of services
export async function getServices(status?: ServiceStatus): Promise<ServiceDto[]> {
    const params = new URLSearchParams();
    if (status) params.append("status", status);

    const path = `/api/services${params.toString() ? `?${params}` : ""}`;
    return getJson<ServiceDto[]>(path);
}

// Get service by ID
export async function getServiceById(id: number): Promise<ServiceDto> {
    return getJson<ServiceDto>(`/api/services/${id}`);
}

// Create service (ADMIN/STAFF only)
export async function createService(
    data: ServiceCreateRequest
): Promise<ServiceDto> {
    return postJson<ServiceCreateRequest, ServiceDto>("/api/services", data);
}

// Update service (ADMIN/STAFF only)
export async function updateService(
    id: number,
    data: ServiceUpdateRequest
): Promise<ServiceDto> {
    return putJson<ServiceUpdateRequest, ServiceDto>(`/api/services/${id}`, data);
}

// Change service status (ADMIN/STAFF only)
export async function changeServiceStatus(
    id: number,
    status: ServiceStatus
): Promise<ServiceDto> {
    return postJson<{ status: ServiceStatus }, ServiceDto>(
        `/api/services/${id}/status?status=${status}`,
        { status }
    );
}

// Delete service (ADMIN/STAFF only)
export async function deleteService(id: number): Promise<void> {
    return deleteJson<void>(`/api/services/${id}`);
}

// Helper to get service type label
export function getServiceTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        CLEANING: "Vệ sinh",
        MAINTENANCE: "Bảo trì",
        REPAIR: "Sửa chữa",
        OTHER: "Khác",
    };
    return labels[type] || type;
}

// Helper to format price
export function formatPrice(price: number): string {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(price);
}

// Helper to format duration
export function formatDuration(minutes?: number): string {
    if (!minutes) return "Chưa xác định";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0 && mins > 0) {
        return `${hours} giờ ${mins} phút`;
    } else if (hours > 0) {
        return `${hours} giờ`;
    } else {
        return `${mins} phút`;
    }
}
