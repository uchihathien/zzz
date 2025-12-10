// lib/cart.ts - Cart state management using localStorage

import type { ProductDto } from "./types";

export interface CartItem {
    product: ProductDto;
    quantity: number;
    unitPrice: number;
}

export interface Cart {
    items: CartItem[];
    updatedAt: string;
}

const CART_KEY = "getabec_cart";

export function getCart(): Cart {
    if (typeof window === "undefined") return { items: [], updatedAt: new Date().toISOString() };
    const stored = localStorage.getItem(CART_KEY);
    if (!stored) return { items: [], updatedAt: new Date().toISOString() };
    try {
        return JSON.parse(stored);
    } catch {
        return { items: [], updatedAt: new Date().toISOString() };
    }
}

export function saveCart(cart: Cart): void {
    if (typeof window === "undefined") return;
    cart.updatedAt = new Date().toISOString();
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    // Dispatch event for components listening
    window.dispatchEvent(new CustomEvent("cart-updated", { detail: cart }));
}

export function addToCart(product: ProductDto, quantity: number, unitPrice: number): Cart {
    const cart = getCart();
    const existingIndex = cart.items.findIndex(item => item.product.id === product.id);

    if (existingIndex >= 0) {
        cart.items[existingIndex].quantity += quantity;
        cart.items[existingIndex].unitPrice = unitPrice;
    } else {
        cart.items.push({ product, quantity, unitPrice });
    }

    saveCart(cart);
    return cart;
}

export function updateCartItem(productId: number, quantity: number, unitPrice?: number): Cart {
    const cart = getCart();
    const item = cart.items.find(item => item.product.id === productId);

    if (item) {
        if (quantity <= 0) {
            cart.items = cart.items.filter(i => i.product.id !== productId);
        } else {
            item.quantity = quantity;
            if (unitPrice !== undefined) item.unitPrice = unitPrice;
        }
    }

    saveCart(cart);
    return cart;
}

export function removeFromCart(productId: number): Cart {
    const cart = getCart();
    cart.items = cart.items.filter(item => item.product.id !== productId);
    saveCart(cart);
    return cart;
}

export function clearCart(): Cart {
    const cart = { items: [], updatedAt: new Date().toISOString() };
    saveCart(cart);
    return cart;
}

export function getCartTotal(cart: Cart): number {
    return cart.items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
}

export function getCartItemCount(cart: Cart): number {
    return cart.items.reduce((count, item) => count + item.quantity, 0);
}
