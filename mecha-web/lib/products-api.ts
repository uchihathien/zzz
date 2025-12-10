// lib/products-api.ts
import { getJson, postJson, putJson, deleteJson } from "./api";
import type {
    ProductDto,
    ProductCreateRequest,
    ProductUpdateRequest,
} from "./types";

// Get list of products
export async function getProducts(
    categoryId?: number,
    keyword?: string
): Promise<ProductDto[]> {
    const params = new URLSearchParams();
    if (categoryId) params.append("categoryId", categoryId.toString());
    if (keyword) params.append("keyword", keyword);

    const path = `/api/products${params.toString() ? `?${params}` : ""}`;
    return getJson<ProductDto[]>(path);
}

// Get product by ID
export async function getProductById(id: number): Promise<ProductDto> {
    return getJson<ProductDto>(`/api/products/${id}`);
}

// Get price for quantity
export async function getProductPrice(
    id: number,
    quantity: number
): Promise<number> {
    return getJson<number>(`/api/products/${id}/price?quantity=${quantity}`);
}

// Create product (ADMIN/STAFF only)
export async function createProduct(
    data: ProductCreateRequest
): Promise<ProductDto> {
    return postJson<ProductCreateRequest, ProductDto>("/api/products", data);
}

// Update product (ADMIN/STAFF only)
export async function updateProduct(
    id: number,
    data: ProductUpdateRequest
): Promise<ProductDto> {
    return putJson<ProductUpdateRequest, ProductDto>(
        `/api/products/${id}`,
        data
    );
}

// Delete product (ADMIN/STAFF only)
export async function deleteProduct(id: number): Promise<void> {
    return deleteJson<void>(`/api/products/${id}`);
}

// Helper to format price
export function formatPrice(price: number | undefined | null): string {
    if (price == null || isNaN(price)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(price);
}


// Helper to get product status label
export function getProductStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        ACTIVE: "Đang bán",
        INACTIVE: "Ngưng bán",
    };
    return labels[status] || status;
}

// Helper to get status color
export function getProductStatusColor(status: string): string {
    const colors: Record<string, string> = {
        ACTIVE: "bg-green-500/20 text-green-400 border-green-500/30",
        INACTIVE: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };
    return colors[status] || colors.INACTIVE;
}
