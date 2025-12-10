// lib/cart-api.ts - Cart API client (saves to database)
import { getJson, postJson, putJson, deleteJson } from "./api";

// Types matching backend DTOs
export type CartItemType = "PRODUCT" | "SERVICE";

export interface CartItemDto {
    id: number;
    itemType: CartItemType;
    productId?: number;
    productName?: string;
    serviceId?: number;
    serviceName?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}

export interface CartDto {
    id: number;
    items: CartItemDto[];
    totalItems: number;
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

// Get current user's cart
export async function getMyCart(): Promise<CartDto> {
    return getJson<CartDto>("/api/cart");
}

// Add item to cart
export async function addToCart(request: CartItemAddRequest): Promise<CartDto> {
    return postJson<CartItemAddRequest, CartDto>("/api/cart/items", request);
}

// Update cart item quantity
export async function updateCartItem(itemId: number, quantity: number): Promise<CartDto> {
    return putJson<CartItemUpdateRequest, CartDto>(`/api/cart/items/${itemId}`, { quantity });
}

// Remove item from cart
export async function removeCartItem(itemId: number): Promise<CartDto> {
    return deleteJson<CartDto>(`/api/cart/items/${itemId}`);
}

// Clear entire cart
export async function clearCart(): Promise<CartDto> {
    return deleteJson<CartDto>("/api/cart/items");
}

// Helper functions
export function getCartItemCount(cart: CartDto | null): number {
    return cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
}

export function getCartTotal(cart: CartDto | null): number {
    return cart?.totalAmount || 0;
}

// Event for cart updates
export function dispatchCartUpdate(cart: CartDto) {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart-updated", { detail: cart }));
    }
}
