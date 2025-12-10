// components/products/ProductCard.tsx
"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/products-api";
import type { ProductDto } from "@/lib/types";

interface ProductCardProps {
    product: ProductDto;
}

export function ProductCard({ product }: ProductCardProps) {
    const inStock = product.stockQuantity === undefined || product.stockQuantity > 0;

    return (
        <Link
            href={`/products/${product.id}`}
            className="group bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all"
        >
            {/* Image */}
            <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                )}
                {!inStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="px-3 py-1 rounded-full bg-red-500/80 text-white text-sm font-medium">
                            Hết hàng
                        </span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-4">
                <h3 className="text-lg font-semibold text-slate-50 mb-1 group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {product.name}
                </h3>
                {product.categoryName && (
                    <p className="text-xs text-slate-500 mb-2">{product.categoryName}</p>
                )}
                <div className="flex items-baseline justify-between">
                    <span className="text-xl font-bold text-indigo-400">
                        {formatPrice(product.basePrice)}
                    </span>
                    {product.unit && (
                        <span className="text-xs text-slate-500">/{product.unit}</span>
                    )}
                </div>
                {product.tierPrices && product.tierPrices.length > 0 && (
                    <p className="text-xs text-green-400 mt-2">
                        Giá sỉ từ {formatPrice(product.tierPrices[product.tierPrices.length - 1].unitPrice)}
                    </p>
                )}
            </div>
        </Link>
    );
}
