// lib/shipping-api.ts - Shipping Address API client
import { getJson, postJson, putJson, deleteJson, patchJson } from "./api";

export interface ShippingAddressDto {
    id: number;
    label?: string;
    recipientName: string;
    phone: string;
    addressLine: string;
    city?: string;
    district?: string;
    ward?: string;
    defaultAddress: boolean;
}

export interface ShippingAddressCreateRequest {
    label?: string;
    recipientName: string;
    phone: string;
    addressLine: string;
    city?: string;
    district?: string;
    ward?: string;
    defaultAddress?: boolean;
}

export interface ShippingAddressUpdateRequest {
    label?: string;
    recipientName?: string;
    phone?: string;
    addressLine?: string;
    city?: string;
    district?: string;
    ward?: string;
    defaultAddress?: boolean;
}

// Get my addresses (max 3)
export async function getMyAddresses(): Promise<ShippingAddressDto[]> {
    return getJson<ShippingAddressDto[]>("/api/shipping-addresses/my");
}

// Create new address
export async function createAddress(data: ShippingAddressCreateRequest): Promise<ShippingAddressDto> {
    return postJson<ShippingAddressCreateRequest, ShippingAddressDto>("/api/shipping-addresses", data);
}

// Update address
export async function updateAddress(id: number, data: ShippingAddressUpdateRequest): Promise<ShippingAddressDto> {
    return putJson<ShippingAddressUpdateRequest, ShippingAddressDto>(`/api/shipping-addresses/${id}`, data);
}

// Delete address
export async function deleteAddress(id: number): Promise<void> {
    return deleteJson(`/api/shipping-addresses/${id}`);
}

// Set as default
export async function setDefaultAddress(id: number): Promise<ShippingAddressDto> {
    return patchJson<object, ShippingAddressDto>(`/api/shipping-addresses/${id}/set-default`, {});
}

// Format full address
export function formatFullAddress(addr: ShippingAddressDto): string {
    const parts = [addr.addressLine];
    if (addr.ward) parts.push(addr.ward);
    if (addr.district) parts.push(addr.district);
    if (addr.city) parts.push(addr.city);
    return parts.join(", ");
}
