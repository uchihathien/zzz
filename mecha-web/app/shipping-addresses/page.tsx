// app/shipping-addresses/page.tsx - Manage Shipping Addresses
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/lib/protected-route";
import {
    getMyAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress,
    formatFullAddress, type ShippingAddressDto, type ShippingAddressCreateRequest
} from "@/lib/shipping-api";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { AddressSelector } from "@/components/shared/AddressSelector";

const MAX_ADDRESSES = 3;

function AddressesContent() {
    const [addresses, setAddresses] = useState<ShippingAddressDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<ShippingAddressDto | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState<ShippingAddressCreateRequest>({
        label: "",
        recipientName: "",
        phone: "",
        addressLine: "",
        city: "",
        district: "",
        ward: "",
        defaultAddress: false,
    });

    useEffect(() => {
        loadAddresses();
    }, []);

    async function loadAddresses() {
        try {
            setLoading(true);
            setError(null);
            const data = await getMyAddresses();
            setAddresses(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Không thể tải địa chỉ");
        } finally {
            setLoading(false);
        }
    }

    function openCreateForm() {
        setEditing(null);
        setFormData({
            label: "",
            recipientName: "",
            phone: "",
            addressLine: "",
            city: "",
            district: "",
            ward: "",
            defaultAddress: addresses.length === 0, // Default if first address
        });
        setShowForm(true);
    }

    function openEditForm(addr: ShippingAddressDto) {
        setEditing(addr);
        setFormData({
            label: addr.label || "",
            recipientName: addr.recipientName,
            phone: addr.phone,
            addressLine: addr.addressLine,
            city: addr.city || "",
            district: addr.district || "",
            ward: addr.ward || "",
            defaultAddress: addr.defaultAddress,
        });
        setShowForm(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!formData.recipientName || !formData.phone || !formData.addressLine) {
            setError("Vui lòng điền đầy đủ thông tin bắt buộc");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            if (editing) {
                await updateAddress(editing.id, formData);
            } else {
                await createAddress(formData);
            }
            await loadAddresses();
            setShowForm(false);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Thao tác thất bại");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
        try {
            await deleteAddress(id);
            await loadAddresses();
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Xóa thất bại");
        }
    }

    async function handleSetDefault(id: number) {
        try {
            await setDefaultAddress(id);
            await loadAddresses();
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Đặt mặc định thất bại");
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 rounded-full border-4 border-slate-200 border-t-blue-600 mx-auto mb-4" />
                    <p className="text-slate-500">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Địa chỉ giao hàng</h1>
                        <p className="text-slate-500 text-sm">Tối đa {MAX_ADDRESSES} địa chỉ</p>
                    </div>
                    {addresses.length < MAX_ADDRESSES && !showForm && (
                        <button
                            onClick={openCreateForm}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Thêm địa chỉ
                        </button>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
                        {error}
                    </div>
                )}

                {/* Address Form Modal */}
                {showForm && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4">
                            {editing ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">
                                        Nhãn địa chỉ
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.label}
                                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                        placeholder="VD: Nhà, Cơ quan..."
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">
                                        Tên người nhận <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.recipientName}
                                        onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                                        required
                                        placeholder="Nguyễn Văn A"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">
                                    Số điện thoại <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                    placeholder="0901234567"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">
                                    Địa chỉ chi tiết <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.addressLine}
                                    onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                                    required
                                    rows={2}
                                    placeholder="Số nhà, tên đường, tòa nhà..."
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>

                            <AddressSelector
                                value={{
                                    city: formData.city,
                                    district: formData.district,
                                    ward: formData.ward,
                                }}
                                onChange={(data) => setFormData({
                                    ...formData,
                                    city: data.city,
                                    district: data.district,
                                    ward: data.ward,
                                })}
                                disabled={submitting}
                            />

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.defaultAddress}
                                    onChange={(e) => setFormData({ ...formData, defaultAddress: e.target.checked })}
                                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-700">Đặt làm địa chỉ mặc định</span>
                            </label>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium transition-colors"
                                >
                                    {submitting ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm địa chỉ"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Address List */}
                {addresses.length === 0 && !showForm ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                        <div className="text-5xl mb-4">📍</div>
                        <h2 className="text-xl font-semibold text-slate-700 mb-2">Chưa có địa chỉ nào</h2>
                        <p className="text-slate-500 mb-6">Thêm địa chỉ giao hàng để đặt hàng nhanh hơn</p>
                        <button
                            onClick={openCreateForm}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Thêm địa chỉ đầu tiên
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {addresses.map((addr) => (
                            <div
                                key={addr.id}
                                className={`bg-white border-2 rounded-2xl p-5 transition-all ${addr.defaultAddress
                                    ? "border-blue-500 shadow-sm"
                                    : "border-slate-200 hover:border-blue-200"
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {addr.label && (
                                                <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-medium">
                                                    {addr.label}
                                                </span>
                                            )}
                                            {addr.defaultAddress && (
                                                <span className="px-2 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-medium">
                                                    Mặc định
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-semibold text-slate-800">{addr.recipientName}</p>
                                        <p className="text-slate-600 text-sm">{addr.phone}</p>
                                        <p className="text-slate-500 text-sm mt-1">{formatFullAddress(addr)}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {!addr.defaultAddress && (
                                            <button
                                                onClick={() => handleSetDefault(addr.id)}
                                                className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                                title="Đặt mặc định"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => openEditForm(addr)}
                                            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                            title="Chỉnh sửa"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(addr.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                            title="Xóa"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Back link */}
                <div className="mt-8 text-center">
                    <Link href="/dashboard" className="text-sm text-slate-500 hover:text-blue-600">
                        ← Quay lại Dashboard
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function ShippingAddressesPage() {
    return (
        <ProtectedRoute>
            <AddressesContent />
        </ProtectedRoute>
    );
}
