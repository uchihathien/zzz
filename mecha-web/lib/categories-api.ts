// lib/categories-api.ts
import { getJson, postJson, putJson, deleteJson } from "./api";
import type {
    CategoryDto,
    CategoryCreateRequest,
    CategoryUpdateRequest,
} from "./types";

// Get category tree
export async function getCategoryTree(): Promise<CategoryDto[]> {
    return getJson<CategoryDto[]>("/api/categories");
}

// Create category (ADMIN/STAFF only)
export async function createCategory(
    data: CategoryCreateRequest
): Promise<CategoryDto> {
    return postJson<CategoryCreateRequest, CategoryDto>("/api/categories", data);
}

// Update category (ADMIN/STAFF only)
export async function updateCategory(
    id: number,
    data: CategoryUpdateRequest
): Promise<CategoryDto> {
    return putJson<CategoryUpdateRequest, CategoryDto>(
        `/api/categories/${id}`,
        data
    );
}

// Delete category (ADMIN/STAFF only)
export async function deleteCategory(id: number): Promise<void> {
    return deleteJson<void>(`/api/categories/${id}`);
}

// Helper to flatten category tree
export function flattenCategories(
    categories: CategoryDto[],
    level: number = 0
): Array<CategoryDto & { level: number }> {
    let result: Array<CategoryDto & { level: number }> = [];

    for (const category of categories) {
        result.push({ ...category, level });
        if (category.children && category.children.length > 0) {
            result = result.concat(flattenCategories(category.children, level + 1));
        }
    }

    return result;
}

// Helper to find category by ID in tree
export function findCategoryById(
    categories: CategoryDto[],
    id: number
): CategoryDto | null {
    for (const category of categories) {
        if (category.id === id) return category;
        if (category.children && category.children.length > 0) {
            const found = findCategoryById(category.children, id);
            if (found) return found;
        }
    }
    return null;
}

// Helper to get category path (breadcrumb)
export function getCategoryPath(
    categories: CategoryDto[],
    id: number
): CategoryDto[] {
    const path: CategoryDto[] = [];

    function findPath(cats: CategoryDto[], targetId: number): boolean {
        for (const cat of cats) {
            path.push(cat);
            if (cat.id === targetId) return true;

            if (cat.children && cat.children.length > 0) {
                if (findPath(cat.children, targetId)) return true;
            }

            path.pop();
        }
        return false;
    }

    findPath(categories, id);
    return path;
}
