// components/shared/AddressSelector.tsx - Vietnam Address Selector Component
"use client";

import { useState, useEffect } from "react";
import {
    getProvinces, getDistricts, getWards,
    type Province, type District, type Ward
} from "@/lib/vietnam-address-api";

interface AddressSelectorProps {
    value: {
        city?: string;
        district?: string;
        ward?: string;
        cityCode?: number;
        districtCode?: number;
        wardCode?: number;
    };
    onChange: (data: {
        city: string;
        district: string;
        ward: string;
        cityCode?: number;
        districtCode?: number;
        wardCode?: number;
    }) => void;
    disabled?: boolean;
}

export function AddressSelector({ value, onChange, disabled }: AddressSelectorProps) {
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);

    const [selectedProvince, setSelectedProvince] = useState<number | "">(value.cityCode || "");
    const [selectedDistrict, setSelectedDistrict] = useState<number | "">(value.districtCode || "");
    const [selectedWard, setSelectedWard] = useState<number | "">(value.wardCode || "");

    const [loading, setLoading] = useState(false);

    // Load provinces on mount
    useEffect(() => {
        getProvinces()
            .then(setProvinces)
            .catch(console.error);
    }, []);

    // Load districts when province changes
    useEffect(() => {
        if (selectedProvince) {
            setLoading(true);
            getDistricts(selectedProvince as number)
                .then((data) => {
                    setDistricts(data);
                    setWards([]);
                    setSelectedDistrict("");
                    setSelectedWard("");
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        } else {
            setDistricts([]);
            setWards([]);
        }
    }, [selectedProvince]);

    // Load wards when district changes
    useEffect(() => {
        if (selectedDistrict) {
            setLoading(true);
            getWards(selectedDistrict as number)
                .then(setWards)
                .catch(console.error)
                .finally(() => setLoading(false));
        } else {
            setWards([]);
        }
    }, [selectedDistrict]);

    function handleProvinceChange(code: number | "") {
        setSelectedProvince(code);
        setSelectedDistrict("");
        setSelectedWard("");

        const province = provinces.find(p => p.code === code);
        onChange({
            city: province?.name || "",
            district: "",
            ward: "",
            cityCode: code || undefined,
            districtCode: undefined,
            wardCode: undefined,
        });
    }

    function handleDistrictChange(code: number | "") {
        setSelectedDistrict(code);
        setSelectedWard("");

        const province = provinces.find(p => p.code === selectedProvince);
        const district = districts.find(d => d.code === code);
        onChange({
            city: province?.name || "",
            district: district?.name || "",
            ward: "",
            cityCode: selectedProvince || undefined,
            districtCode: code || undefined,
            wardCode: undefined,
        });
    }

    function handleWardChange(code: number | "") {
        setSelectedWard(code);

        const province = provinces.find(p => p.code === selectedProvince);
        const district = districts.find(d => d.code === selectedDistrict);
        const ward = wards.find(w => w.code === code);
        onChange({
            city: province?.name || "",
            district: district?.name || "",
            ward: ward?.name || "",
            cityCode: selectedProvince || undefined,
            districtCode: selectedDistrict || undefined,
            wardCode: code || undefined,
        });
    }

    const selectClass = "w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer";

    return (
        <div className="grid grid-cols-3 gap-4">
            {/* Province/City */}
            <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                    Tỉnh/Thành phố
                </label>
                <div className="relative">
                    <select
                        value={selectedProvince}
                        onChange={(e) => handleProvinceChange(e.target.value ? Number(e.target.value) : "")}
                        disabled={disabled}
                        className={selectClass}
                    >
                        <option value="">Chọn tỉnh/TP</option>
                        {provinces.map((p) => (
                            <option key={p.code} value={p.code}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* District */}
            <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                    Quận/Huyện
                </label>
                <div className="relative">
                    <select
                        value={selectedDistrict}
                        onChange={(e) => handleDistrictChange(e.target.value ? Number(e.target.value) : "")}
                        disabled={disabled || !selectedProvince || loading}
                        className={selectClass}
                    >
                        <option value="">Chọn quận/huyện</option>
                        {districts.map((d) => (
                            <option key={d.code} value={d.code}>
                                {d.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Ward */}
            <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                    Phường/Xã
                </label>
                <div className="relative">
                    <select
                        value={selectedWard}
                        onChange={(e) => handleWardChange(e.target.value ? Number(e.target.value) : "")}
                        disabled={disabled || !selectedDistrict || loading}
                        className={selectClass}
                    >
                        <option value="">Chọn phường/xã</option>
                        {wards.map((w) => (
                            <option key={w.code} value={w.code}>
                                {w.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
