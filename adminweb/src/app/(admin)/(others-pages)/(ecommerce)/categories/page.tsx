"use client";
import React, { useEffect, useState, useCallback } from "react";
import { categoriesService } from "@/lib/api";
import type { Category, CategoryCreateRequest } from "@/types";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { showSuccess, showError } from "@/components/ui/Toaster";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState<CategoryCreateRequest>({
        name: "",
        description: "",
        parentId: undefined,
    });

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const data = await categoriesService.getCategoryTree();
            setCategories(data);
        } catch (err) {
            showError(err instanceof Error ? err.message : "Lỗi tải danh mục");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            showError("Vui lòng nhập tên danh mục");
            return;
        }

        try {
            if (editingCategory) {
                await categoriesService.updateCategory(editingCategory.id, formData);
                showSuccess("Cập nhật danh mục thành công!");
            } else {
                await categoriesService.createCategory(formData);
                showSuccess("Thêm danh mục thành công!");
            }
            setShowModal(false);
            setEditingCategory(null);
            setFormData({ name: "", description: "", parentId: undefined });
            fetchCategories();
        } catch (err) {
            showError(err instanceof Error ? err.message : "Lỗi lưu danh mục");
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || "",
            parentId: category.parentId,
        });
        setShowModal(true);
    };

    const openAddModal = () => {
        setEditingCategory(null);
        setFormData({ name: "", description: "", parentId: undefined });
        setShowModal(true);
    };

    // Render category tree
    const renderCategory = (cat: Category, level = 0): React.ReactNode => (
        <React.Fragment key={cat.id}>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-5 py-4">
                    <span style={{ marginLeft: level * 24 }} className="flex items-center gap-2">
                        {level > 0 && <span className="text-gray-400">└─</span>}
                        <span className="font-medium text-gray-800 dark:text-white">{cat.name}</span>
                    </span>
                </td>
                <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                    {cat.description || "—"}
                </td>
                <td className="px-5 py-4">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                        {cat.productCount || 0} sản phẩm
                    </span>
                </td>
                <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleEdit(cat)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm"
                        >
                            Sửa
                        </button>
                    </div>
                </td>
            </tr>
            {cat.children?.map(child => renderCategory(child, level + 1))}
        </React.Fragment>
    );

    return (
        <div>
            <PageBreadcrumb pageTitle="Quản lý danh mục" />

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Danh sách danh mục
                    </h3>
                    <button
                        onClick={openAddModal}
                        className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600"
                    >
                        + Thêm danh mục
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800/50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Tên danh mục
                                    </th>
                                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Mô tả
                                    </th>
                                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Số sản phẩm
                                    </th>
                                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {categories.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-12 text-center text-gray-500">
                                            Chưa có danh mục nào
                                        </td>
                                    </tr>
                                ) : (
                                    categories.map(cat => renderCategory(cat))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                {editingCategory ? "Sửa danh mục" : "Thêm danh mục mới"}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tên danh mục *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                    placeholder="Nhập tên danh mục"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Mô tả
                                </label>
                                <textarea
                                    value={formData.description || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                    placeholder="Nhập mô tả"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Danh mục cha
                                </label>
                                <select
                                    value={formData.parentId || ""}
                                    onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value ? Number(e.target.value) : undefined }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="">Không có (danh mục gốc)</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id} disabled={editingCategory?.id === cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600"
                                >
                                    {editingCategory ? "Cập nhật" : "Thêm mới"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
