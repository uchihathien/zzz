// app/products/page.tsx - Products page with White/Blue Theme
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProducts, formatPrice } from "@/lib/products-api";
import { getCategoryTree } from "@/lib/categories-api";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import type { ProductDto, CategoryDto } from "@/lib/types";

export default function ProductsPage() {

    const [products, setProducts] = useState<ProductDto[]>([]);
    const [categories, setCategories] = useState<CategoryDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchKeyword(searchInput);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        loadProducts();
    }, [selectedCategory, searchKeyword]);

    async function loadCategories() {
        try {
            const data = await getCategoryTree();
            setCategories(data);
        } catch (err) {
            console.error("Failed to load categories:", err);
        }
    }

    async function loadProducts() {
        try {
            setLoading(true);
            setError(null);
            const data = await getProducts(selectedCategory || undefined, searchKeyword || undefined);
            setProducts(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Không thể tải danh sách sản phẩm");
        } finally {
            setLoading(false);
        }
    }

    function flatCategories(cats: CategoryDto[]): CategoryDto[] {
        let result: CategoryDto[] = [];
        for (const cat of cats) {
            result.push(cat);
            if (cat.children) {
                result = result.concat(flatCategories(cat.children));
            }
        }
        return result;
    }

    const flatCats = flatCategories(categories);

    const filteredProducts = products.filter(p => {
        const price = p.basePrice;
        const min = minPrice ? parseFloat(minPrice) : 0;
        const max = maxPrice ? parseFloat(maxPrice) : Infinity;
        return price >= min && price <= max;
    });

    const hasFilters = selectedCategory || searchKeyword || minPrice || maxPrice;

    // Pagination
    const ITEMS_PER_PAGE = 12;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, searchKeyword, minPrice, maxPrice]);

    function clearAllFilters() {
        setSelectedCategory(null);
        setSearchKeyword("");
        setSearchInput("");
        setMinPrice("");
        setMaxPrice("");
        setCurrentPage(1);
    }


    const priceRanges = [
        { label: "Dưới 100K", min: "", max: "100000" },
        { label: "100K - 500K", min: "100000", max: "500000" },
        { label: "500K - 1 triệu", min: "500000", max: "1000000" },
        { label: "1 - 5 triệu", min: "1000000", max: "5000000" },
        { label: "Trên 5 triệu", min: "5000000", max: "" },
    ];

    // Filter sidebar content (reusable for both desktop and mobile)
    const FilterContent = () => (
        <>
            {/* Category Filter */}
            {flatCats.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        Danh mục
                    </h4>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${selectedCategory === null
                                ? "bg-blue-50 text-blue-700 font-medium border border-blue-200"
                                : "text-slate-600 hover:bg-slate-50"
                                }`}
                        >
                            Tất cả danh mục
                        </button>
                        {flatCats.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${selectedCategory === cat.id
                                    ? "bg-blue-50 text-blue-700 font-medium border border-blue-200"
                                    : "text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Price Filter */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Khoảng giá
                </h4>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-slate-500 mb-1 block">Từ</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                placeholder="0"
                                min="0"
                                className="w-full px-3 py-2 pr-10 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">₫</span>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 mb-1 block">Đến</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                placeholder="Không giới hạn"
                                min="0"
                                className="w-full px-3 py-2 pr-10 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">₫</span>
                        </div>
                    </div>
                    {/* Quick Price Ranges */}
                    <div className="pt-2 space-y-1">
                        <p className="text-xs text-slate-500 mb-2">Mức giá nhanh:</p>
                        {priceRanges.map((range) => (
                            <button
                                key={range.label}
                                onClick={() => {
                                    setMinPrice(range.min);
                                    setMaxPrice(range.max);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${minPrice === range.min && maxPrice === range.max
                                    ? "bg-green-50 text-green-700 font-medium border border-green-200"
                                    : "text-slate-600 hover:bg-slate-50 border border-transparent"
                                    }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Active Filters Summary */}
            {hasFilters && (
                <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500 mb-2">Đang lọc theo:</p>
                    <div className="flex flex-wrap gap-2">
                        {selectedCategory && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                                📂 {flatCats.find(c => c.id === selectedCategory)?.name}
                                <button onClick={() => setSelectedCategory(null)} className="hover:text-blue-900 ml-1">×</button>
                            </span>
                        )}
                        {searchKeyword && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                                🔍 &quot;{searchKeyword}&quot;
                                <button onClick={() => { setSearchKeyword(""); setSearchInput(""); }} className="hover:text-purple-900 ml-1">×</button>
                            </span>
                        )}
                        {(minPrice || maxPrice) && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                💰 {minPrice ? formatPrice(parseFloat(minPrice)) : "0₫"} - {maxPrice ? formatPrice(parseFloat(maxPrice)) : "∞"}
                                <button onClick={() => { setMinPrice(""); setMaxPrice(""); }} className="hover:text-green-900 ml-1">×</button>
                            </span>
                        )}
                    </div>
                </div>
            )}
        </>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            {/* Search Bar */}
            <div className="bg-white border-b border-slate-200 py-4">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-3">
                        {/* Mobile Filter Toggle */}
                        <button
                            onClick={() => setShowMobileFilters(true)}
                            className="lg:hidden flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-200 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Lọc
                            {hasFilters && (
                                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                                    {[selectedCategory, searchKeyword, minPrice || maxPrice].filter(Boolean).length}
                                </span>
                            )}
                        </button>

                        {/* Search Input */}
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Tìm kiếm sản phẩm..."
                                className="w-full px-4 py-3 pl-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                            />
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {searchInput && (
                                <button onClick={() => setSearchInput("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Filter Modal */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
                    <div className="absolute inset-y-0 left-0 w-80 max-w-full bg-white shadow-xl overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-slate-800">Bộ lọc</h3>
                                <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <FilterContent />
                            {hasFilters && (
                                <button
                                    onClick={clearAllFilters}
                                    className="w-full mt-4 py-3 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
                                >
                                    Xóa tất cả bộ lọc
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Desktop Sidebar Filters */}
                    <aside className="hidden lg:block lg:w-72 flex-shrink-0">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-slate-800">Bộ lọc</h3>
                                {hasFilters && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-sm text-red-500 hover:text-red-700 font-medium"
                                    >
                                        Xóa tất cả
                                    </button>
                                )}
                            </div>
                            <FilterContent />
                        </div>
                    </aside>

                    {/* Products Content */}
                    <div className="flex-1 min-w-0">
                        {/* Loading */}
                        {loading && (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center">
                                    <div className="animate-spin h-12 w-12 rounded-full border-4 border-slate-200 border-t-blue-600 mx-auto mb-4" />
                                    <p className="text-slate-500">Đang tải sản phẩm...</p>
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {error && !loading && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                                <p className="text-red-600 mb-4">{error}</p>
                                <button onClick={loadProducts} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium">
                                    Thử lại
                                </button>
                            </div>
                        )}

                        {/* Products Grid */}
                        {!loading && !error && (
                            <>
                                {filteredProducts.length > 0 ? (
                                    <>
                                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                                            <span className="text-sm text-slate-500">
                                                Tìm thấy <span className="font-semibold text-slate-700">{filteredProducts.length}</span> sản phẩm
                                                {totalPages > 1 && (
                                                    <span className="text-slate-400 ml-2">
                                                        (Trang {currentPage}/{totalPages})
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                            {paginatedProducts.map((product) => (
                                                <ProductCard key={product.id} product={product} />
                                            ))}
                                        </div>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="mt-8 flex items-center justify-center gap-2">
                                                {/* Previous Button */}
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                    className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm font-medium transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                    Trước
                                                </button>

                                                {/* Page Numbers */}
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                        .filter(page => {
                                                            // Show first, last, current, and adjacent pages
                                                            if (page === 1 || page === totalPages) return true;
                                                            if (Math.abs(page - currentPage) <= 1) return true;
                                                            return false;
                                                        })
                                                        .map((page, index, arr) => (
                                                            <span key={page} className="flex items-center">
                                                                {index > 0 && arr[index - 1] !== page - 1 && (
                                                                    <span className="px-2 text-slate-400">...</span>
                                                                )}
                                                                <button
                                                                    onClick={() => setCurrentPage(page)}
                                                                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                                                            ? "bg-blue-600 text-white shadow-sm"
                                                                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                                                        }`}
                                                                >
                                                                    {page}
                                                                </button>
                                                            </span>
                                                        ))}
                                                </div>

                                                {/* Next Button */}
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm font-medium transition-colors"
                                                >
                                                    Sau
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                                        <div className="text-6xl mb-4">📦</div>
                                        <h3 className="text-xl font-semibold text-slate-700 mb-2">Không tìm thấy sản phẩm</h3>
                                        <p className="text-slate-500 mb-4">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
                                        {hasFilters && (
                                            <button onClick={clearAllFilters} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">
                                                Xóa bộ lọc
                                            </button>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

// Product Card Component with TierPrice display
function ProductCard({ product }: { product: ProductDto }) {
    const inStock = product.stockQuantity === undefined || product.stockQuantity > 0;
    const hasTierPrices = product.tierPrices && product.tierPrices.length > 0;
    const lowestTierPrice = hasTierPrices
        ? Math.min(...product.tierPrices!.map(t => t.unitPrice))
        : null;

    return (
        <Link
            href={`/products/${product.id}`}
            className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all"
        >
            {/* Image */}
            <div className="aspect-square bg-slate-100 relative overflow-hidden">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                )}
                {!inStock && (
                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                        <span className="px-3 py-1 rounded-full bg-red-500 text-white text-sm font-medium">
                            Hết hàng
                        </span>
                    </div>
                )}
                {hasTierPrices && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-green-500 text-white text-xs font-medium">
                        Giá sỉ
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-4">
                {product.categoryName && (
                    <p className="text-xs text-blue-600 font-medium mb-1">{product.categoryName}</p>
                )}
                <h3 className="text-base font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {product.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-blue-600">
                        {formatPrice(product.basePrice)}
                    </span>
                    {product.unit && (
                        <span className="text-xs text-slate-500">/{product.unit}</span>
                    )}
                </div>

                {/* Tier Prices Preview */}
                {hasTierPrices && lowestTierPrice && (
                    <div className="mt-2 pt-2 border-t border-slate-100">
                        <p className="text-xs text-green-600 font-medium">
                            💰 Giá sỉ từ {formatPrice(lowestTierPrice)}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {product.tierPrices!.length} mức giá theo số lượng
                        </p>
                    </div>
                )}
            </div>
        </Link>
    );
}
