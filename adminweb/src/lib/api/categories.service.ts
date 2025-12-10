/**
 * Categories Service - Quản lý danh mục sản phẩm
 */
import { httpClient } from './httpClient';
import type { Category, CategoryCreateRequest, CategoryUpdateRequest } from '@/types';

export const categoriesService = {
    /**
     * Lấy cây danh mục (root + children)
     */
    async getCategoryTree(): Promise<Category[]> {
        return httpClient.get<Category[]>('/api/categories', { skipAuth: true });
    },

    /**
     * Lấy danh sách phẳng tất cả danh mục
     */
    async getAllCategories(): Promise<Category[]> {
        const tree = await this.getCategoryTree();
        return this.flattenCategories(tree);
    },

    /**
     * Tạo danh mục mới (ADMIN/STAFF)
     */
    async createCategory(data: CategoryCreateRequest): Promise<Category> {
        return httpClient.post<Category>('/api/categories', data);
    },

    /**
     * Cập nhật danh mục (ADMIN/STAFF)
     */
    async updateCategory(id: number, data: CategoryUpdateRequest): Promise<Category> {
        return httpClient.put<Category>(`/api/categories/${id}`, data);
    },

    /**
     * Xóa danh mục (ADMIN/STAFF)
     */
    async deleteCategory(id: number): Promise<void> {
        return httpClient.delete(`/api/categories/${id}`);
    },

    /**
     * Flatten tree thành mảng phẳng
     */
    flattenCategories(categories: Category[], level = 0): Category[] {
        const result: Category[] = [];
        for (const cat of categories) {
            result.push({ ...cat, name: '— '.repeat(level) + cat.name });
            if (cat.children && cat.children.length > 0) {
                result.push(...this.flattenCategories(cat.children, level + 1));
            }
        }
        return result;
    },
};

export default categoriesService;
