// lib/types.ts
// Type definitions for Getabec platform

// ============= ENUMS =============
export type UserRole = "USER" | "STAFF" | "TECHNICIAN" | "ADMIN";
export type AuthProvider = "LOCAL" | "GOOGLE";
export type AccountStatus = "ACTIVE" | "BLOCKED" | "DELETED";

export type ServiceType = "CLEANING" | "MAINTENANCE" | "REPAIR" | "OTHER";
export type ServiceStatus = "ACTIVE" | "INACTIVE";

export type BookingStatus =
    | "PENDING"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";

export type ProductStatus = "ACTIVE" | "INACTIVE";

// ============= USER =============
export interface UserDto {
    id: number;
    email: string;
    fullName: string;
    phone?: string;
    role: UserRole;
    provider: AuthProvider;
    status?: AccountStatus;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: UserDto;
}

// ============= CATEGORY =============
export interface CategoryDto {
    id: number;
    name: string;
    description?: string;
    slug?: string;
    parentId?: number;
    children?: CategoryDto[];
    productCount?: number;
}

export interface CategoryCreateRequest {
    name: string;
    description?: string;
    parentId?: number;
}

export interface CategoryUpdateRequest {
    name?: string;
    description?: string;
    parentId?: number;
}

// ============= PRODUCT =============
export interface TierPriceDto {
    id: number;
    minQty: number;
    maxQty?: number;
    unitPrice: number;
}

export interface ProductDto {
    id: number;
    name: string;
    description?: string;
    code?: string;
    basePrice: number;
    unit?: string;
    stockQuantity?: number;
    status: ProductStatus;
    imageUrl?: string;
    categoryId?: number;
    categoryName?: string;
    tierPrices?: TierPriceDto[];
    createdAt: string;
    updatedAt: string;
}

export interface ProductCreateRequest {
    name: string;
    description?: string;
    code?: string;
    basePrice: number;
    unit?: string;
    stockQuantity?: number;
    status?: ProductStatus;
    imageUrl?: string;
    categoryId?: number;
    tierPrices?: Array<{
        minQty: number;
        maxQty?: number;
        unitPrice: number;
    }>;
}

export interface ProductUpdateRequest {
    name?: string;
    description?: string;
    code?: string;
    basePrice?: number;
    unit?: string;
    stockQuantity?: number;
    status?: ProductStatus;
    imageUrl?: string;
    categoryId?: number;
    tierPrices?: Array<{
        minQty: number;
        maxQty?: number;
        unitPrice: number;
    }>;
}

// ============= SERVICE =============
export interface ServiceDto {
    id: number;
    name: string;
    code?: string;
    description?: string;
    type: ServiceType;
    status: ServiceStatus;
    basePrice: number;
    durationMinutes?: number;
    createdAt: string;
    updatedAt: string;
}

export interface ServiceCreateRequest {
    name: string;
    code?: string;
    description?: string;
    type: ServiceType;
    basePrice: number;
    durationMinutes?: number;
    status?: ServiceStatus;
}

export interface ServiceUpdateRequest {
    name?: string;
    code?: string;
    description?: string;
    type?: ServiceType;
    basePrice?: number;
    durationMinutes?: number;
}

// ============= BOOKING =============
export interface BookingDto {
    id: number;
    customerId: number;
    customerName?: string;
    customerEmail?: string;
    serviceId: number;
    serviceName?: string;
    technicianId?: number;
    technicianName?: string;
    scheduledAt: string;
    status: BookingStatus;
    paymentMethod?: PaymentMethod;
    paymentStatus?: PaymentStatus;
    priceAtBooking: number;
    addressLine: string;
    contactPhone: string;
    note?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface BookingCreateRequest {
    serviceId: number;
    scheduledAt: string; // ISO 8601 format
    addressLine: string;
    contactPhone: string;
    note?: string;
    paymentMethod?: PaymentMethod;
}

export interface BookingUpdateStatusRequest {
    status: BookingStatus;
    note?: string;
}

export interface BookingAssignTechnicianRequest {
    technicianId: number;
}

// ============= PAGINATION =============
export interface PageRequest {
    page?: number;
    size?: number;
    sort?: string;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

// ============= ORDER =============
export type OrderStatus =
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";

export interface OrderItemDto {
    id: number;
    itemType?: "PRODUCT" | "SERVICE";
    productId?: number;
    productName?: string;
    serviceId?: number;
    serviceName?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}


export type PaymentMethod = "COD" | "BANK_TRANSFER" | "VNPAY" | "MOMO";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface OrderDto {
    id: number;
    orderNumber?: string;
    orderCode?: string;
    customerId: number;
    customerName?: string;
    customerEmail?: string;
    status: OrderStatus;
    paymentMethod?: PaymentMethod;
    paymentStatus?: PaymentStatus;
    items: OrderItemDto[];
    totalAmount: number;
    shippingAddress: string;
    contactPhone?: string;
    note?: string;
    createdAt: string;
    updatedAt: string;
}


export interface OrderCreateRequest {
    items: {
        productId: number;
        quantity: number;
        unitPrice: number;
    }[];
    shippingAddress: string;
    note?: string;
}
