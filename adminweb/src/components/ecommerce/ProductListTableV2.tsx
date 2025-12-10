"use client";
import React, { useState, useEffect, useCallback } from "react";
import { productsService, categoriesService } from "@/lib/api";
import type { Product, Category } from "@/types";
import { vi } from "@/i18n";
import Button from "../ui/button/Button";
import Link from "next/link";
import Image from "next/image";
import { showSuccess, showError } from "@/components/ui/Toaster";
import { useConfirm } from "@/components/ui/ConfirmModal";

const ProductListTableV2: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<number | "">("");

    // Pagination
    const [page, setPage] = useState(1);
    const [perPage] = useState(10);
    const [selected, setSelected] = useState<number[]>([]);

    // Fetch categories on mount
    useEffect(() => {
        categoriesService.getAllCategories()
            .then(setCategories)
            .catch(console.error);
    }, []);

    // Fetch products
    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await productsService.getProducts(
                categoryFilter || undefined,
                search || undefined
            );
            setProducts(data);
            setPage(1);
        } catch (err) {
            const msg = err instanceof Error ? err.message : vi.messages.error.generic;
            setError(msg);
            showError(msg);
        } finally {
            setLoading(false);
        }
    }, [categoryFilter, search]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Toggle visibility (hide/show)
    const confirm = useConfirm();

    const handleToggleVisibility = async (id: number, name: string, currentHidden: boolean) => {
        const actionVerb = currentHidden ? "hiện lại" : "ẩn";
        const actionDesc = currentHidden
            ? "Sản phẩm sẽ được hiển thị trở lại cho khách hàng."
            : "Sản phẩm sẽ bị ẩn khỏi cửa hàng, khách hàng sẽ không thể xem.";

        const confirmed = await confirm({
            title: `${currentHidden ? "Hiện lại" : "Ẩn"} sản phẩm`,
            message: `Bạn có chắc muốn ${actionVerb} sản phẩm "${name}"?\n\n${actionDesc}`,
            confirmText: currentHidden ? "Hiện lại" : "Ẩn sản phẩm",
            cancelText: "Hủy",
            type: currentHidden ? "info" : "warning",
        });

        if (!confirmed) return;

        try {
            await productsService.toggleVisibility(id);
            showSuccess(`Đã ${actionVerb} sản phẩm "${name}" thành công!`);
            fetchProducts();
        } catch (err) {
            showError(err instanceof Error ? err.message : `${actionVerb} sản phẩm thất bại`);
        }
    };

    // Pagination helpers
    const paginatedProducts = products.slice(
        (page - 1) * perPage,
        page * perPage
    );
    const totalPages = Math.ceil(products.length / perPage);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const toggleSelect = (id: number) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        const ids = paginatedProducts.map((p) => p.id);
        setSelected((prev) =>
            ids.every((id) => prev.includes(id))
                ? prev.filter((id) => !ids.includes(id))
                : [...new Set([...prev, ...ids])]
        );
    };

    const isAllSelected = () => {
        const ids = paginatedProducts.map((p) => p.id);
        return ids.length > 0 && ids.every((id) => selected.includes(id));
    };

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            {/* Header */}
            <div className="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        {vi.pages.productList.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {vi.pages.productList.subtitle}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={fetchProducts}>
                        {vi.actions.refresh}
                    </Button>
                    <Link
                        href="/add-product"
                        className="bg-brand-500 shadow-sm hover inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                        >
                            <path
                                d="M5 10.0002H15.0006M10.0002 5V15.0006"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        {vi.menu.addProduct}
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                            <svg
                                className="fill-current"
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M3.04199 9.37336937363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z"
                                    fill=""
                                />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder={vi.pages.productList.searchPlaceholder}
                            className="shadow-sm focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-4 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        className="h-11 px-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white text-sm min-w-[180px]"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value ? Number(e.target.value) : "")}
                    >
                        <option value="">{vi.pages.productList.allCategories}</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    {vi.messages.loading}
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="p-8 text-center text-red-500">
                    {error}
                </div>
            )}

            {/* Table */}
            {!loading && !error && (
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                                <th className="w-14 px-5 py-4 text-left">
                                    <label className="cursor-pointer text-sm font-medium text-gray-700 select-none dark:text-gray-400">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            onChange={toggleAll}
                                            checked={isAllSelected()}
                                        />
                                        <span
                                            className={`flex h-4 w-4 items-center justify-center rounded-sm border-[1.25px] ${isAllSelected()
                                                ? "border-brand-500 bg-brand-500"
                                                : "bg-transparent border-gray-300 dark:border-gray-700"
                                                }`}
                                        >
                                            <span className={isAllSelected() ? "" : "opacity-0"}>
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                    <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="1.6666" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </span>
                                        </span>
                                    </label>
                                </th>
                                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    {vi.pages.productList.columns.product}
                                </th>
                                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    {vi.pages.productList.columns.sku}
                                </th>
                                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    {vi.pages.productList.columns.category}
                                </th>
                                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    {vi.pages.productList.columns.price}
                                </th>
                                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    {vi.pages.productList.columns.stock}
                                </th>
                                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    {vi.pages.productList.columns.unit}
                                </th>
                                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    {vi.common.actions}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {paginatedProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                                        {vi.pages.productList.noProducts}
                                    </td>
                                </tr>
                            ) : (
                                paginatedProducts.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="transition hover:bg-gray-50 dark:hover:bg-gray-900"
                                    >
                                        <td className="w-14 px-5 py-4 whitespace-nowrap">
                                            <label className="cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={selected.includes(product.id)}
                                                    onChange={() => toggleSelect(product.id)}
                                                />
                                                <span
                                                    className={`flex h-4 w-4 items-center justify-center rounded-sm border-[1.25px] ${selected.includes(product.id)
                                                        ? "border-brand-500 bg-brand-500"
                                                        : "bg-transparent border-gray-300 dark:border-gray-700"
                                                        }`}
                                                >
                                                    <span className={selected.includes(product.id) ? "" : "opacity-0"}>
                                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                            <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="1.6666" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </span>
                                                </span>
                                            </label>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                                                    {product.imageUrl ? (
                                                        <Image
                                                            width={48}
                                                            height={48}
                                                            src={product.imageUrl}
                                                            className="h-12 w-12 object-cover"
                                                            alt={product.name}
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 flex items-center justify-center text-gray-400">
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                                                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                                                                <path d="M6 21L17 12L21 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {product.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {product.sku || "—"}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {product.categoryName || "—"}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {formatCurrency(product.basePrice)}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <span
                                                className={`text-xs rounded-full px-2 py-0.5 font-medium ${product.stockQuantity > 0
                                                    ? "bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-500"
                                                    : "bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-500"
                                                    }`}
                                            >
                                                {product.stockQuantity}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {product.unitOfMeasure || "—"}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {/* Status badge */}
                                                {product.hidden && (
                                                    <span className="px-2 py-0.5 text-xs font-medium text-amber-700 bg-amber-100 rounded-full dark:bg-amber-900/30 dark:text-amber-400">
                                                        Đã ẩn
                                                    </span>
                                                )}
                                                <Link
                                                    href={`/add-product?id=${product.id}`}
                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm"
                                                >
                                                    {vi.actions.edit}
                                                </Link>
                                                <button
                                                    onClick={() => handleToggleVisibility(product.id, product.name, !!product.hidden)}
                                                    className={`text-sm ${product.hidden ? 'text-green-600 hover:text-green-800 dark:text-green-400' : 'text-amber-600 hover:text-amber-800 dark:text-amber-400'}`}
                                                >
                                                    {product.hidden ? 'Hiện' : 'Ẩn'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {!loading && !error && products.length > 0 && (
                <div className="flex items-center flex-col sm:flex-row justify-between border-t border-gray-200 px-5 py-4 dark:border-gray-800">
                    <div className="pb-3 sm:pb-0">
                        <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                            {vi.pages.productList.showing}{" "}
                            <span className="text-gray-800 dark:text-white/90">
                                {(page - 1) * perPage + 1}
                            </span>
                            {" - "}
                            <span className="text-gray-800 dark:text-white/90">
                                {Math.min(page * perPage, products.length)}
                            </span>
                            {" "}{vi.pages.productList.of}{" "}
                            <span className="text-gray-800 dark:text-white/90">
                                {products.length}
                            </span>
                            {" "}{vi.pages.productList.results}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="px-3 py-2 text-sm border rounded-lg disabled:opacity-50 dark:border-gray-700"
                        >
                            {vi.actions.previous}
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className={`px-3 py-2 text-sm border rounded-lg ${page === pageNum
                                        ? "bg-brand-500 text-white border-brand-500"
                                        : "dark:border-gray-700"
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-2 text-sm border rounded-lg disabled:opacity-50 dark:border-gray-700"
                        >
                            {vi.actions.next}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductListTableV2;
