"use client";
import React, { useEffect, useState, useCallback } from "react";
import { servicesService, ServiceItem, ServiceType, ServiceStatus, ServiceCreateRequest } from "@/lib/api/services.service";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { showSuccess, showError } from "@/components/ui/Toaster";
import { useConfirm } from "@/components/ui/ConfirmModal";

const serviceTypeLabels: Record<ServiceType, string> = {
    [ServiceType.CLEANING]: "Vệ sinh",
    [ServiceType.MAINTENANCE]: "Bảo trì",
    [ServiceType.REPAIR]: "Sửa chữa",
    [ServiceType.OTHER]: "Khác",
};

const serviceTypeColors: Record<ServiceType, string> = {
    [ServiceType.CLEANING]: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    [ServiceType.MAINTENANCE]: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    [ServiceType.REPAIR]: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    [ServiceType.OTHER]: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

export default function ServicesPage() {
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<ServiceStatus | "">("");
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState<ServiceItem | null>(null);
    const [formData, setFormData] = useState<ServiceCreateRequest>({
        name: "",
        code: "",
        description: "",
        type: ServiceType.CLEANING,
        basePrice: 0,
        durationMinutes: 60,
    });

    const confirm = useConfirm();

    const fetchServices = useCallback(async () => {
        try {
            setLoading(true);
            const data = await servicesService.getServices(statusFilter || undefined);
            setServices(data);
        } catch (err) {
            showError(err instanceof Error ? err.message : "Lỗi tải dịch vụ");
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            showError("Vui lòng nhập tên dịch vụ");
            return;
        }
        if (formData.basePrice <= 0) {
            showError("Giá phải lớn hơn 0");
            return;
        }

        try {
            if (editingService) {
                await servicesService.updateService(editingService.id, formData);
                showSuccess("Cập nhật dịch vụ thành công!");
            } else {
                await servicesService.createService(formData);
                showSuccess("Thêm dịch vụ thành công!");
            }
            setShowModal(false);
            setEditingService(null);
            resetForm();
            fetchServices();
        } catch (err) {
            showError(err instanceof Error ? err.message : "Lỗi lưu dịch vụ");
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            code: "",
            description: "",
            type: ServiceType.CLEANING,
            basePrice: 0,
            durationMinutes: 60,
        });
    };

    const handleEdit = (service: ServiceItem) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            code: service.code || "",
            description: service.description || "",
            type: service.type,
            basePrice: service.basePrice,
            durationMinutes: service.durationMinutes || 60,
        });
        setShowModal(true);
    };

    const handleToggleStatus = async (service: ServiceItem) => {
        const newStatus = service.status === ServiceStatus.ACTIVE ? ServiceStatus.INACTIVE : ServiceStatus.ACTIVE;
        const action = newStatus === ServiceStatus.ACTIVE ? "kích hoạt" : "vô hiệu hóa";
        const actionDesc = newStatus === ServiceStatus.ACTIVE
            ? "Dịch vụ sẽ được kích hoạt và hiển thị cho khách hàng."
            : "Dịch vụ sẽ bị vô hiệu và không hiển thị cho khách hàng.";

        const confirmed = await confirm({
            title: `${newStatus === ServiceStatus.ACTIVE ? "Kích hoạt" : "Vô hiệu hóa"} dịch vụ`,
            message: `Bạn có chắc muốn ${action} dịch vụ "${service.name}"?\n\n${actionDesc}`,
            confirmText: newStatus === ServiceStatus.ACTIVE ? "Kích hoạt" : "Vô hiệu",
            cancelText: "Hủy",
            type: newStatus === ServiceStatus.ACTIVE ? "info" : "warning",
        });

        if (!confirmed) return;

        try {
            await servicesService.changeStatus(service.id, newStatus);
            showSuccess(`Đã ${action} dịch vụ "${service.name}"!`);
            fetchServices();
        } catch (err) {
            showError(err instanceof Error ? err.message : `${action} thất bại`);
        }
    };

    const openAddModal = () => {
        setEditingService(null);
        resetForm();
        setShowModal(true);
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Quản lý dịch vụ" />

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Danh sách dịch vụ
                        </h3>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as ServiceStatus | "")}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value={ServiceStatus.ACTIVE}>Đang hoạt động</option>
                            <option value={ServiceStatus.INACTIVE}>Đã vô hiệu</option>
                        </select>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600"
                    >
                        + Thêm dịch vụ
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
                                        Tên dịch vụ
                                    </th>
                                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Mã
                                    </th>
                                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Loại
                                    </th>
                                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Giá
                                    </th>
                                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Thời gian
                                    </th>
                                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Trạng thái
                                    </th>
                                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {services.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-12 text-center text-gray-500">
                                            Chưa có dịch vụ nào
                                        </td>
                                    </tr>
                                ) : (
                                    services.map((service) => (
                                        <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-5 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-800 dark:text-white">{service.name}</p>
                                                    {service.description && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                                            {service.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                                                {service.code || "—"}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${serviceTypeColors[service.type]}`}>
                                                    {serviceTypeLabels[service.type]}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white">
                                                {formatCurrency(service.basePrice)}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {service.durationMinutes ? `${service.durationMinutes} phút` : "—"}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${service.status === ServiceStatus.ACTIVE
                                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                    }`}>
                                                    {service.status === ServiceStatus.ACTIVE ? "Hoạt động" : "Đã vô hiệu"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(service)}
                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm"
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(service)}
                                                        className={`text-sm ${service.status === ServiceStatus.ACTIVE
                                                            ? "text-amber-600 hover:text-amber-800 dark:text-amber-400"
                                                            : "text-green-600 hover:text-green-800 dark:text-green-400"
                                                            }`}
                                                    >
                                                        {service.status === ServiceStatus.ACTIVE ? "Vô hiệu" : "Kích hoạt"}
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
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                {editingService ? "Sửa dịch vụ" : "Thêm dịch vụ mới"}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Tên dịch vụ *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                        placeholder="VD: Vệ sinh máy lạnh"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Mã dịch vụ
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code || ""}
                                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                        placeholder="VD: CLEANING_AC"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Loại dịch vụ *
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ServiceType }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                    >
                                        {Object.values(ServiceType).map(type => (
                                            <option key={type} value={type}>{serviceTypeLabels[type]}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Giá cơ bản (VNĐ) *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.basePrice}
                                        onChange={(e) => setFormData(prev => ({ ...prev, basePrice: Number(e.target.value) }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                        placeholder="500000"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Thời gian (phút)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.durationMinutes || ""}
                                        onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: Number(e.target.value) || undefined }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                        placeholder="60"
                                        min="0"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Mô tả
                                    </label>
                                    <textarea
                                        value={formData.description || ""}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                        placeholder="Mô tả chi tiết về dịch vụ"
                                        rows={3}
                                    />
                                </div>
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
                                    {editingService ? "Cập nhật" : "Thêm mới"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
