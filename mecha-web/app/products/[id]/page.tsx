// app/products/[id]/page.tsx - Product Detail with White/Blue Theme
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getProductById, getProductPrice, getProducts, formatPrice } from "@/lib/products-api";
import { addToCart, dispatchCartUpdate } from "@/lib/cart-api";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import toast from "react-hot-toast";
import type { ProductDto } from "@/lib/types";

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const productId = parseInt(params.id as string);

    const [product, setProduct] = useState<ProductDto | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<ProductDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
    const [addingToCart, setAddingToCart] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);

    useEffect(() => {
        loadProduct();
    }, [productId]);

    useEffect(() => {
        if (product && product.tierPrices && product.tierPrices.length > 0) {
            calculatePrice();
        }
    }, [quantity, product]);

    async function loadProduct() {
        try {
            setLoading(true);
            setError(null);
            const data = await getProductById(productId);
            setProduct(data);

            // Load related products from the same category
            if (data.categoryId) {
                const allProducts = await getProducts(data.categoryId);
                // Filter out current product and get up to 3 related products
                const related = allProducts
                    .filter(p => p.id !== data.id)
                    .slice(0, 3);
                setRelatedProducts(related);
            } else {
                // If no category, get random products
                const allProducts = await getProducts();
                const related = allProducts
                    .filter(p => p.id !== data.id)
                    .slice(0, 3);
                setRelatedProducts(related);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Không thể tải thông tin sản phẩm");
        } finally {
            setLoading(false);
        }
    }

    async function calculatePrice() {
        if (!product) return;
        try {
            const price = await getProductPrice(product.id, quantity);
            setCalculatedPrice(price);
        } catch (err) {
            console.error("Failed to calculate price:", err);
            setCalculatedPrice(null);
        }
    }

    async function handleAddToCart() {
        if (!product) return;

        if (!isAuthenticated) {
            router.push("/login?redirect=/products/" + product.id);
            return;
        }

        try {
            setAddingToCart(true);
            const cart = await addToCart({
                itemType: "PRODUCT",
                productId: product.id,
                quantity: quantity,
            });
            dispatchCartUpdate(cart);
            setAddedToCart(true);
            toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
            setTimeout(() => setAddedToCart(false), 3000);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Thêm vào giỏ hàng thất bại");
        } finally {
            setAddingToCart(false);
        }
    }


    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin h-12 w-12 rounded-full border-4 border-slate-200 border-t-blue-600 mx-auto mb-4" />
                        <p className="text-slate-500">Đang tải...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white border border-red-200 rounded-xl p-6 text-center shadow-sm">
                        <div className="text-5xl mb-4">😕</div>
                        <p className="text-red-600 mb-4">{error || "Không tìm thấy sản phẩm"}</p>
                        <Link
                            href="/products"
                            className="inline-block px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
                        >
                            ← Quay lại danh sách sản phẩm
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const displayPrice = calculatedPrice !== null ? calculatedPrice : product.basePrice;
    const inStock = product.stockQuantity === undefined || product.stockQuantity > 0;
    const hasTierPrices = product.tierPrices && product.tierPrices.length > 0;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
                {/* Breadcrumb */}
                <nav className="mb-6">
                    <ol className="flex items-center gap-2 text-sm">
                        <li>
                            <Link href="/" className="text-slate-500 hover:text-blue-600">Trang chủ</Link>
                        </li>
                        <li className="text-slate-400">/</li>
                        <li>
                            <Link href="/products" className="text-slate-500 hover:text-blue-600">Sản phẩm</Link>
                        </li>
                        {product.categoryName && (
                            <>
                                <li className="text-slate-400">/</li>
                                <li>
                                    <Link
                                        href={`/products?category=${product.categoryId}`}
                                        className="text-slate-500 hover:text-blue-600"
                                    >
                                        {product.categoryName}
                                    </Link>
                                </li>
                            </>
                        )}
                        <li className="text-slate-400">/</li>
                        <li className="text-slate-700 font-medium truncate max-w-[200px]">{product.name}</li>
                    </ol>
                </nav>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Product Image */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full aspect-square object-cover"
                            />
                        ) : (
                            <div className="w-full aspect-square bg-slate-100 flex items-center justify-center">
                                <svg className="w-32 h-32 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            {product.categoryName && (
                                <Link
                                    href={`/products?category=${product.categoryId}`}
                                    className="inline-block text-sm text-blue-600 font-medium mb-2 hover:underline"
                                >
                                    {product.categoryName}
                                </Link>
                            )}
                            <h1 className="text-3xl font-bold text-slate-800 mb-2">{product.name}</h1>
                            {product.code && (
                                <p className="text-sm text-slate-500">Mã sản phẩm: <span className="font-medium">{product.code}</span></p>
                            )}
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <h3 className="text-sm font-semibold text-slate-700 mb-2">Mô tả</h3>
                                <p className="text-slate-600 leading-relaxed">{product.description}</p>
                            </div>
                        )}

                        {/* Price Section */}
                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                            <div className="flex items-baseline justify-between mb-2">
                                <span className="text-sm text-slate-600">Giá bán:</span>
                                <span className="text-3xl font-bold text-blue-600">
                                    {formatPrice(displayPrice)}
                                </span>
                            </div>
                            {product.unit && (
                                <p className="text-xs text-slate-500 text-right">Đơn vị: {product.unit}</p>
                            )}
                            {calculatedPrice !== null && calculatedPrice !== product.basePrice && (
                                <p className="text-sm text-green-600 font-medium mt-2 text-right">
                                    ✓ Đã áp dụng giá sỉ
                                </p>
                            )}
                        </div>

                        {/* Tier Prices Table */}
                        {hasTierPrices && (
                            <div className="bg-white rounded-xl p-4 border border-slate-200">
                                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                    <span className="text-lg">💰</span>
                                    Bảng giá theo số lượng
                                </h3>
                                <div className="overflow-hidden rounded-lg border border-slate-200">
                                    <table className="w-full">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Số lượng</th>
                                                <th className="px-4 py-2 text-right text-xs font-semibold text-slate-600">Đơn giá</th>
                                                <th className="px-4 py-2 text-right text-xs font-semibold text-slate-600">Tiết kiệm</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-t border-slate-100">
                                                <td className="px-4 py-3 text-sm text-slate-600">1+</td>
                                                <td className="px-4 py-3 text-sm text-right font-medium text-slate-800">
                                                    {formatPrice(product.basePrice)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right text-slate-400">—</td>
                                            </tr>
                                            {product.tierPrices!.map((tier, index) => {
                                                const savings = product.basePrice - tier.unitPrice;
                                                const savingsPercent = Math.round((savings / product.basePrice) * 100);
                                                return (
                                                    <tr key={index} className={`border-t border-slate-100 ${quantity >= tier.minQty ? 'bg-green-50' : ''}`}>
                                                        <td className="px-4 py-3 text-sm text-slate-600">
                                                            {tier.minQty}+ {product.unit || 'sản phẩm'}

                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-right font-medium text-blue-600">
                                                            {formatPrice(tier.unitPrice)}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
                                                            -{savingsPercent}%
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="bg-white rounded-xl p-4 border border-slate-200">
                            <label className="text-sm font-semibold text-slate-700 block mb-3">
                                Số lượng:
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold transition-colors"
                                >
                                    −
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-24 px-4 py-2 text-center rounded-lg bg-white border border-slate-300 text-slate-800 font-medium outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold transition-colors"
                                >
                                    +
                                </button>
                                <span className="text-sm text-slate-500 ml-2">{product.unit || 'sản phẩm'}</span>
                            </div>
                            {quantity > 1 && (
                                <p className="text-sm text-slate-600 mt-3">
                                    Tổng: <span className="font-bold text-blue-600">{formatPrice(displayPrice * quantity)}</span>
                                </p>
                            )}
                        </div>

                        {/* Stock Status */}
                        <div className={`p-4 rounded-xl border ${inStock ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center gap-2">
                                {inStock ? (
                                    <>
                                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm font-medium text-green-700">
                                            Còn hàng {product.stockQuantity !== undefined && `(${product.stockQuantity})`}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm font-medium text-red-700">Hết hàng</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <div className="space-y-3">
                            <button
                                disabled={!inStock || addingToCart}
                                onClick={handleAddToCart}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all shadow-lg shadow-blue-600/30"
                            >
                                {addingToCart ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        <span>Đang thêm...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span>{isAuthenticated ? "Thêm vào giỏ hàng" : "Đăng nhập để mua"}</span>
                                    </>
                                )}
                            </button>

                            {addedToCart && (
                                <div className="flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Đã thêm vào giỏ hàng!</span>
                                    <Link href="/cart" className="text-blue-600 hover:text-blue-700 underline font-medium">
                                        Xem giỏ hàng
                                    </Link>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <section className="mt-16">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">Sản phẩm đề xuất</h2>
                            <Link
                                href={product.categoryId ? `/products?category=${product.categoryId}` : "/products"}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            >
                                Xem thêm
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedProducts.map((relatedProduct) => (
                                <RelatedProductCard key={relatedProduct.id} product={relatedProduct} />
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
}

// Related Product Card Component
function RelatedProductCard({ product }: { product: ProductDto }) {
    const inStock = product.stockQuantity === undefined || product.stockQuantity > 0;
    const hasTierPrices = product.tierPrices && product.tierPrices.length > 0;

    return (
        <Link
            href={`/products/${product.id}`}
            className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all"
        >
            {/* Image */}
            <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
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
            </div>
        </Link>
    );
}
