// Định nghĩa types cho API

// ==================== ENUMS ====================

export enum UserRole {
    USER = 'USER',          // Khách hàng (CUSTOMER)
    STAFF = 'STAFF',
    ADMIN = 'ADMIN',
    TECHNICIAN = 'TECHNICIAN',
}

export enum AccountStatus {
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export enum OrderStatus {
    PENDING = 'PENDING',      // Chờ xử lý (chưa giao)
    DELIVERED = 'DELIVERED',  // Đã giao / Hoàn thành
    CANCELLED = 'CANCELLED',  // Đã hủy
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED',
}

export enum PaymentMethod {
    COD = 'COD',
    BANK_TRANSFER = 'BANK_TRANSFER',
    VNPAY = 'VNPAY',
    MOMO = 'MOMO',
}

export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export enum CartItemType {
    PRODUCT = 'PRODUCT',
    SERVICE = 'SERVICE',
}

// ==================== AUTH ====================

export interface User {
    id: number;
    email: string;
    fullName: string;
    phone: string;
    avatar?: string;
    role: UserRole;
    status: AccountStatus;
    provider: 'LOCAL' | 'GOOGLE';
    createdAt: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

// ==================== PRODUCTS ====================

export interface TierPrice {
    id: number;
    minQty: number;
    maxQty?: number;
    unitPrice: number;
}

export interface TierPriceCreateRequest {
    minQty: number;
    maxQty?: number;
    unitPrice: number;
}

export interface ProductImage {
    id: number;
    imageUrl: string;
    sortOrder?: number;
}

export interface Product {
    id: number;
    name: string;
    sku: string;
    categoryId: number;
    categoryName: string;
    description: string;
    basePrice: number;
    stockQuantity: number;
    unitOfMeasure: string;
    attributes: Record<string, string>;
    tierPrices: TierPrice[];
    imageUrl: string;
    images: ProductImage[];
    hidden?: boolean;
}

export interface ProductCreateRequest {
    name: string;
    sku?: string;
    categoryId?: number;
    description?: string;
    basePrice: number;
    stockQuantity: number;
    unitOfMeasure?: string;
    attributes?: Record<string, string>;
    tierPrices?: TierPriceCreateRequest[];
    imageUrl?: string;
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> { }


// ==================== CATEGORIES ====================

export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    parentId?: number;
    children?: Category[];
    productCount?: number;
}

export interface CategoryCreateRequest {
    name: string;
    slug?: string;
    description?: string;
    parentId?: number;
}

export interface CategoryUpdateRequest extends Partial<CategoryCreateRequest> { }

// ==================== ORDERS ====================

export interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    productSku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface Order {
    id: number;
    orderCode: string;
    customerId: number;
    customerName: string;
    totalAmount: number;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    status: OrderStatus;
    shippingAddress: string;
    contactPhone: string;
    note?: string;
    createdAt: string;
    items: OrderItem[];
}

export interface OrderCreateRequest {
    shippingAddress: string;
    contactPhone: string;
    paymentMethod: PaymentMethod;
    note?: string;
}

export interface OrderSearchParams {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    from?: string;
    to?: string;
}

// ==================== CART ====================

export interface CartItem {
    id: number;
    itemType: CartItemType;
    productId?: number;
    serviceId?: number;
    name: string;
    imageUrl?: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
}

export interface Cart {
    id: number;
    userId: number;
    items: CartItem[];
    totalAmount: number;
}

export interface CartItemAddRequest {
    itemType: CartItemType;
    productId?: number;
    serviceId?: number;
    quantity: number;
}

export interface CartItemUpdateRequest {
    quantity: number;
}

// ==================== BOOKINGS ====================

export interface Booking {
    id: number;
    userId: number;
    userName: string;
    serviceId: number;
    serviceName: string;
    scheduledDate: string;
    address: string;
    phone: string;
    note?: string;
    status: BookingStatus;
    technicianId?: number;
    technicianName?: string;
    createdAt: string;
}

export interface BookingCreateRequest {
    serviceId: number;
    scheduledDate: string;
    address: string;
    phone: string;
    note?: string;
}

export interface BookingSearchParams {
    status?: BookingStatus;
    from?: string;
    to?: string;
}

// ==================== API RESPONSE ====================

export interface ApiError {
    message: string;
    status: number;
    errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}
