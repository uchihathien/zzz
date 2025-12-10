"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { productsService, categoriesService } from "@/lib/api";
import type { Category, Product, ProductCreateRequest, ProductUpdateRequest } from "@/types";
import { vi } from "@/i18n";
import toast from "react-hot-toast";


const AddProductFormV2: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("id");
    const isEditMode = !!editId;

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditMode);
    const [categories, setCategories] = useState<Category[]>([]);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [productImages, setProductImages] = useState<{ id: number; url: string }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Pending images for new product (not yet uploaded)
    const [pendingImages, setPendingImages] = useState<{ file: File; preview: string }[]>([]);

    // Form state
    const [formData, setFormData] = useState<ProductCreateRequest>({
        name: "",
        sku: "",
        categoryId: undefined,
        description: "",
        basePrice: 0,
        stockQuantity: 0,
        unitOfMeasure: "",
        attributes: {},
        tierPrices: [],
        imageUrl: "",
    });

    // Fetch categories
    useEffect(() => {
        categoriesService.getAllCategories()
            .then(setCategories)
            .catch((err) => toast.error("Không thể tải danh mục: " + err.message));
    }, []);

    // Fetch product if edit mode
    useEffect(() => {
        if (editId) {
            setInitialLoading(true);
            productsService.getProduct(Number(editId))
                .then((product: Product) => {
                    setFormData({
                        name: product.name,
                        sku: product.sku || "",
                        categoryId: product.categoryId,
                        description: product.description || "",
                        basePrice: product.basePrice,
                        stockQuantity: product.stockQuantity,
                        unitOfMeasure: product.unitOfMeasure || "",
                        attributes: product.attributes || {},
                        tierPrices: (product.tierPrices || []).map(tp => ({
                            minQty: tp.minQty,
                            maxQty: tp.maxQty,
                            unitPrice: tp.unitPrice,
                        })),
                        imageUrl: product.imageUrl || "",
                    });
                    // Map images to the state format
                    if (product.images) {
                        setProductImages(product.images.map((img) => ({ id: img.id, url: img.imageUrl })));
                    }
                })

                .catch((err) => {
                    toast.error("Không thể tải thông tin sản phẩm: " + err.message);
                    router.push("/products-list");
                })
                .finally(() => setInitialLoading(false));
        }
    }, [editId, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value,
        }));
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setFormData((prev) => ({
            ...prev,
            categoryId: value ? Number(value) : undefined,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            toast.error("Vui lòng nhập tên sản phẩm");
            return;
        }
        if (formData.basePrice <= 0) {
            toast.error("Giá phải lớn hơn 0");
            return;
        }

        try {
            setLoading(true);

            if (isEditMode) {
                const updateData: ProductUpdateRequest = {
                    name: formData.name,
                    sku: formData.sku || undefined,
                    categoryId: formData.categoryId,
                    description: formData.description || undefined,
                    basePrice: formData.basePrice,
                    stockQuantity: formData.stockQuantity,
                    unitOfMeasure: formData.unitOfMeasure || undefined,
                    attributes: formData.attributes,
                    tierPrices: formData.tierPrices,
                    imageUrl: formData.imageUrl || undefined,
                };
                await productsService.updateProduct(Number(editId), updateData);

                toast.success("Cập nhật sản phẩm thành công!");

                setTimeout(() => {
                    router.push("/products-list");
                }, 1000);
            } else {
                // Create new product
                const newProduct = await productsService.createProduct(formData);

                // Upload pending images if any
                if (pendingImages.length > 0) {
                    toast.success(`Đang tải ${pendingImages.length} ảnh lên...`);

                    let uploadedCount = 0;
                    for (const img of pendingImages) {
                        try {
                            await productsService.addImage(newProduct.id, img.file);
                            uploadedCount++;
                        } catch (err) {
                            console.error("Failed to upload image:", err);
                        }
                    }

                    if (uploadedCount > 0) {
                        toast.success(`Đã tải ${uploadedCount}/${pendingImages.length} ảnh thành công!`);
                    }

                    // Clear pending images
                    pendingImages.forEach(img => URL.revokeObjectURL(img.preview));
                    setPendingImages([]);
                }

                toast.success("Thêm sản phẩm thành công!");

                setTimeout(() => {
                    router.push("/products-list");
                }, 1000);
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    // Handle image upload (for edit mode - direct upload)
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Vui lòng chọn file ảnh!");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Kích thước ảnh tối đa 5MB!");
            return;
        }

        if (isEditMode && editId) {
            // Edit mode: Upload directly
            try {
                setUploadingImage(true);
                const result = await productsService.addImage(Number(editId), file);
                if (result.images) {
                    setProductImages(result.images.map((img) => ({ id: img.id, url: img.imageUrl })));
                }
                // Tự động cập nhật URL ảnh chính nếu có
                if (result.imageUrl) {
                    setFormData(prev => ({ ...prev, imageUrl: result.imageUrl }));
                }
                toast.success("Tải ảnh lên thành công!");
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Tải ảnh thất bại");
            } finally {
                setUploadingImage(false);
            }
        }
        else {
            // New product mode: Add to pending images
            if (pendingImages.length >= 5) {
                toast.error("Tối đa 5 ảnh!");
                return;
            }
            const preview = URL.createObjectURL(file);
            setPendingImages(prev => [...prev, { file, preview }]);
            toast.success("Đã thêm ảnh vào danh sách!");
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Remove pending image (for new product mode)
    const handleRemovePendingImage = (index: number) => {
        setPendingImages(prev => {
            const newImages = [...prev];
            URL.revokeObjectURL(newImages[index].preview);
            newImages.splice(index, 1);
            return newImages;
        });
    };

    // Handle image delete (for edit mode)
    const handleDeleteImage = async (imageId: number) => {
        if (!editId) return;
        if (!confirm("Bạn có chắc muốn xóa ảnh này?")) return;

        try {
            const result = await productsService.deleteImage(Number(editId), imageId);
            if (result.images) {
                setProductImages(result.images.map((img) => ({ id: img.id, url: img.imageUrl })));
            } else {
                setProductImages((prev) => prev.filter((img) => img.id !== imageId));
            }
            toast.success("Đã xóa ảnh!");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Xóa ảnh thất bại");
        }
    };

    // Handle set primary image (for edit mode)
    const [settingPrimaryId, setSettingPrimaryId] = useState<number | null>(null);

    const handleSetPrimaryImage = async (imageId: number) => {
        if (!editId) return;

        // Tìm URL của ảnh được chọn
        const targetImage = productImages.find(img => img.id === imageId);

        try {
            setSettingPrimaryId(imageId);
            const result = await productsService.setPrimaryImage(Number(editId), imageId);
            if (result.images) {
                setProductImages(result.images.map((img) => ({ id: img.id, url: img.imageUrl })));
            }
            // Tự động cập nhật URL ảnh chính trong form
            if (result.imageUrl) {
                setFormData(prev => ({ ...prev, imageUrl: result.imageUrl }));
            } else if (targetImage) {
                setFormData(prev => ({ ...prev, imageUrl: targetImage.url }));
            }
            toast.success("Đã đặt làm ảnh chính!");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Đặt ảnh chính thất bại");
        } finally {
            setSettingPrimaryId(null);
        }
    };



    const inputClass = "h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30";
    const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

    if (initialLoading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Đang tải...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Basic Info Card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                    <h4 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
                        {vi.pages.productForm.basicInfo}
                    </h4>
                    <div className="space-y-5">
                        <div>
                            <label htmlFor="name" className={labelClass}>{vi.pages.productForm.fields.name} *</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                className={inputClass}
                                placeholder={vi.pages.productForm.fields.namePlaceholder}
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="sku" className={labelClass}>{vi.pages.productForm.fields.sku}</label>
                            <input
                                id="sku"
                                name="sku"
                                type="text"
                                className={inputClass}
                                placeholder={vi.pages.productForm.fields.skuPlaceholder}
                                value={formData.sku || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="categoryId" className={labelClass}>{vi.pages.productForm.fields.category}</label>
                            <select
                                id="categoryId"
                                name="categoryId"
                                className={inputClass}
                                value={formData.categoryId || ""}
                                onChange={handleCategoryChange}
                            >
                                <option value="">{vi.pages.productForm.fields.selectCategory}</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="description" className={labelClass}>{vi.pages.productForm.fields.description}</label>
                            <textarea
                                id="description"
                                name="description"
                                className={`${inputClass} h-auto`}
                                placeholder={vi.pages.productForm.fields.descriptionPlaceholder}
                                value={formData.description || ""}
                                onChange={handleChange}
                                rows={4}
                            />
                        </div>
                    </div>
                </div>

                {/* Pricing Card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                    <h4 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
                        {vi.pages.productForm.pricing}
                    </h4>
                    <div className="space-y-5">
                        <div>
                            <label htmlFor="basePrice" className={labelClass}>{vi.pages.productForm.fields.basePrice} *</label>
                            <input
                                id="basePrice"
                                name="basePrice"
                                type="number"
                                className={inputClass}
                                min={0}
                                step={1000}
                                value={formData.basePrice}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="stockQuantity" className={labelClass}>{vi.pages.productForm.fields.stockQuantity} *</label>
                            <input
                                id="stockQuantity"
                                name="stockQuantity"
                                type="number"
                                className={inputClass}
                                min={0}
                                value={formData.stockQuantity}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="unitOfMeasure" className={labelClass}>{vi.pages.productForm.fields.unitOfMeasure}</label>
                            <input
                                id="unitOfMeasure"
                                name="unitOfMeasure"
                                type="text"
                                className={inputClass}
                                placeholder={vi.pages.productForm.fields.unitPlaceholder}
                                value={formData.unitOfMeasure || ""}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Tier Prices */}
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                                <label className={labelClass}>Giá theo số lượng</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newTierPrices = [...(formData.tierPrices || [])];
                                        newTierPrices.push({ minQty: 1, unitPrice: formData.basePrice });
                                        setFormData(prev => ({ ...prev, tierPrices: newTierPrices }));
                                    }}
                                    className="text-sm text-brand-500 hover:text-brand-600 font-medium"
                                >
                                    + Thêm mức giá
                                </button>
                            </div>

                            {(formData.tierPrices && formData.tierPrices.length > 0) ? (
                                <div className="space-y-3">
                                    {formData.tierPrices.map((tier, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-500 dark:text-gray-400">Từ SL</label>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={tier.minQty}
                                                    onChange={(e) => {
                                                        const newTierPrices = [...(formData.tierPrices || [])];
                                                        newTierPrices[index] = { ...newTierPrices[index], minQty: Number(e.target.value) };
                                                        setFormData(prev => ({ ...prev, tierPrices: newTierPrices }));
                                                    }}
                                                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-500 dark:text-gray-400">Đến SL</label>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={tier.maxQty || ""}
                                                    placeholder="∞"
                                                    onChange={(e) => {
                                                        const newTierPrices = [...(formData.tierPrices || [])];
                                                        newTierPrices[index] = { ...newTierPrices[index], maxQty: e.target.value ? Number(e.target.value) : undefined };
                                                        setFormData(prev => ({ ...prev, tierPrices: newTierPrices }));
                                                    }}
                                                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-500 dark:text-gray-400">Đơn giá (VNĐ)</label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    step={1000}
                                                    value={tier.unitPrice}
                                                    onChange={(e) => {
                                                        const newTierPrices = [...(formData.tierPrices || [])];
                                                        newTierPrices[index] = { ...newTierPrices[index], unitPrice: Number(e.target.value) };
                                                        setFormData(prev => ({ ...prev, tierPrices: newTierPrices }));
                                                    }}
                                                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newTierPrices = (formData.tierPrices || []).filter((_, i) => i !== index);
                                                    setFormData(prev => ({ ...prev, tierPrices: newTierPrices }));
                                                }}
                                                className="mt-4 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                    Chưa có giá theo số lượng. Thêm để áp dụng giá sỉ.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Images Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <div className="flex items-center justify-between mb-5">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Hình ảnh sản phẩm
                    </h4>
                    <span className={`text-sm font-medium ${(isEditMode ? productImages.length : pendingImages.length) >= 5 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                        {isEditMode ? productImages.length : pendingImages.length}/5 ảnh
                    </span>
                </div>

                {/* Direct Image URL Input */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <label htmlFor="imageUrl" className={labelClass}>
                        URL Ảnh chính (nhập trực tiếp)
                    </label>
                    <div className="flex gap-3">
                        <input
                            id="imageUrl"
                            name="imageUrl"
                            type="url"
                            className={inputClass}
                            placeholder="https://example.com/image.jpg"
                            value={formData.imageUrl || ""}
                            onChange={handleChange}
                        />
                        {formData.imageUrl && (
                            <div className="flex-shrink-0 w-16 h-11 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                                <img
                                    src={formData.imageUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Nhập URL ảnh trực tiếp hoặc upload ảnh bên dưới
                    </p>
                </div>

                {!isEditMode ? (
                    // New product mode - show pending images
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                            {pendingImages.map((img, index) => (
                                <div key={index} className="relative group">
                                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                        <img
                                            src={img.preview}
                                            alt={`Pending image ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {/* Badge for main image */}
                                    {index === 0 && (
                                        <span className="absolute top-1 left-1 bg-brand-500 text-white text-xs px-1.5 py-0.5 rounded">
                                            Ảnh chính
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleRemovePendingImage(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                        title="Xóa ảnh"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}

                            {/* Upload button */}
                            {pendingImages.length < 5 && (
                                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-colors">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                    <div className="text-center">
                                        <svg className="w-8 h-8 mx-auto mb-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span className="text-xs text-gray-500">Thêm ảnh</span>
                                    </div>
                                </label>
                            )}
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Hỗ trợ JPG, PNG, GIF. Tối đa 5MB mỗi ảnh, tối đa 5 ảnh/sản phẩm. Ảnh đầu tiên sẽ là ảnh chính.
                            {pendingImages.length > 0 && (
                                <span className="text-brand-500 font-medium"> Ảnh sẽ được upload khi bạn nhấn Lưu.</span>
                            )}
                        </p>
                    </>
                ) : (
                    <>
                        {/* Image grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                            {productImages.filter(img => img.url).map((img, index) => (
                                <div key={img.id} className="relative group">
                                    <div className={`aspect-square rounded-lg overflow-hidden border-2 ${index === 0 ? 'border-brand-500' : 'border-gray-200 dark:border-gray-700'}`}>
                                        <img
                                            src={img.url}
                                            alt={`Product image ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Badge for main image */}
                                    {index === 0 && (
                                        <span className="absolute top-1 left-1 bg-brand-500 text-white text-xs px-1.5 py-0.5 rounded shadow">
                                            ⭐ Ảnh chính
                                        </span>
                                    )}
                                    {/* Action buttons overlay */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-2">
                                        {/* Set as primary button (only for non-primary images) */}
                                        {index !== 0 && (
                                            <button
                                                type="button"
                                                onClick={() => handleSetPrimaryImage(img.id)}
                                                disabled={settingPrimaryId === img.id}
                                                className="px-2 py-1 bg-brand-500 text-white text-xs rounded hover:bg-brand-600 disabled:opacity-50 flex items-center gap-1"
                                                title="Đặt làm ảnh chính"
                                            >
                                                {settingPrimaryId === img.id ? (
                                                    <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent" />
                                                ) : (
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                    </svg>
                                                )}
                                                Ảnh chính
                                            </button>
                                        )}
                                        {/* Delete button */}
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteImage(img.id)}
                                            className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 flex items-center gap-1"
                                            title="Xóa ảnh"
                                        >
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            ))}


                            {/* Upload button - only show if under limit */}
                            {productImages.length < 5 && (
                                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-colors">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                        disabled={uploadingImage}
                                    />
                                    {uploadingImage ? (
                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-500 border-t-transparent"></div>
                                    ) : (
                                        <div className="text-center">
                                            <svg className="w-8 h-8 mx-auto mb-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                            </svg>
                                            <span className="text-xs text-gray-500">Thêm ảnh</span>
                                        </div>
                                    )}
                                </label>
                            )}
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Hỗ trợ JPG, PNG, GIF. Tối đa 5MB mỗi ảnh, tối đa 5 ảnh/sản phẩm. Ảnh đầu tiên sẽ là ảnh chính.
                        </p>
                    </>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
                <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={() => router.back()}
                    disabled={loading}
                >
                    {vi.actions.cancel}
                </button>
                <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-brand-600 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? "Đang xử lý..." : (isEditMode ? "Cập nhật" : vi.actions.save)}
                </button>
            </div>
        </form>
    );
};

export default AddProductFormV2;
