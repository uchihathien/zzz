/**
 * Products Service - CRUD sản phẩm cơ khí
 */
import { httpClient, uploadFile } from './httpClient';
import type { Product, ProductCreateRequest, ProductUpdateRequest } from '@/types';

export const productsService = {
    /**
     * Lấy danh sách sản phẩm
     * @param categoryId - Lọc theo danh mục (optional)
     * @param keyword - Tìm kiếm theo tên/SKU (optional)
     */
    async getProducts(categoryId?: number, keyword?: string): Promise<Product[]> {
        return httpClient.get<Product[]>('/api/products', {
            params: { categoryId, keyword },
            skipAuth: true, // Public API
        });
    },

    /**
     * Lấy chi tiết sản phẩm
     */
    async getProduct(id: number): Promise<Product> {
        return httpClient.get<Product>(`/api/products/${id}`, { skipAuth: true });
    },

    /**
     * Tính giá theo số lượng (tier pricing)
     */
    async getPriceForQuantity(id: number, quantity: number): Promise<number> {
        return httpClient.get<number>(`/api/products/${id}/price`, {
            params: { quantity },
            skipAuth: true,
        });
    },

    /**
     * Tạo sản phẩm mới (ADMIN/STAFF)
     */
    async createProduct(data: ProductCreateRequest): Promise<Product> {
        console.log('[Product] Creating product:', data);
        return httpClient.post<Product>('/api/products', data);
    },

    /**
     * Cập nhật sản phẩm (ADMIN/STAFF)
     */
    async updateProduct(id: number, data: ProductUpdateRequest): Promise<Product> {
        return httpClient.put<Product>(`/api/products/${id}`, data);
    },

    /**
     * Xóa sản phẩm (ADMIN/STAFF)
     */
    async deleteProduct(id: number): Promise<void> {
        return httpClient.delete(`/api/products/${id}`);
    },

    /**
     * Thêm ảnh cho sản phẩm (ADMIN/STAFF)
     */
    async addImage(productId: number, file: File): Promise<Product> {
        return uploadFile<Product>(`/api/products/${productId}/images`, file);
    },

    /**
     * Xóa ảnh của sản phẩm (ADMIN/STAFF)
     */
    async deleteImage(productId: number, imageId: number): Promise<Product> {
        return httpClient.delete<Product>(`/api/products/${productId}/images/${imageId}`);
    },

    /**
     * Ẩn/Hiện sản phẩm (ADMIN/STAFF) - Thay thế cho xóa
     */
    async toggleVisibility(id: number): Promise<Product> {
        return httpClient.patch<Product>(`/api/products/${id}/toggle-visibility`);
    },

    /**
     * Đặt ảnh làm ảnh chính (ADMIN/STAFF)
     */
    async setPrimaryImage(productId: number, imageId: number): Promise<Product> {
        return httpClient.patch<Product>(`/api/products/${productId}/images/${imageId}/set-primary`);
    },
};

export default productsService;
