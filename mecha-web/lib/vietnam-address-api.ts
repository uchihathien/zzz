// lib/vietnam-address-api.ts - Vietnam Provinces/Districts/Wards API
// Using: https://provinces.open-api.vn

const API_BASE = "https://provinces.open-api.vn/api";

export interface Province {
    code: number;
    name: string;
    codename: string;
    division_type: string;
    phone_code: number;
}

export interface District {
    code: number;
    name: string;
    codename: string;
    division_type: string;
    province_code: number;
}

export interface Ward {
    code: number;
    name: string;
    codename: string;
    division_type: string;
    district_code: number;
}

export interface ProvinceWithDistricts extends Province {
    districts: District[];
}

export interface DistrictWithWards extends District {
    wards: Ward[];
}

// Get all provinces
export async function getProvinces(): Promise<Province[]> {
    const res = await fetch(`${API_BASE}/p/`);
    if (!res.ok) throw new Error("Không thể tải danh sách tỉnh/thành phố");
    return res.json();
}

// Get districts by province code
export async function getDistricts(provinceCode: number): Promise<District[]> {
    const res = await fetch(`${API_BASE}/p/${provinceCode}?depth=2`);
    if (!res.ok) throw new Error("Không thể tải danh sách quận/huyện");
    const data: ProvinceWithDistricts = await res.json();
    return data.districts || [];
}

// Get wards by district code  
export async function getWards(districtCode: number): Promise<Ward[]> {
    const res = await fetch(`${API_BASE}/d/${districtCode}?depth=2`);
    if (!res.ok) throw new Error("Không thể tải danh sách phường/xã");
    const data: DistrictWithWards = await res.json();
    return data.wards || [];
}

// Get province by code
export async function getProvinceByCode(code: number): Promise<Province> {
    const res = await fetch(`${API_BASE}/p/${code}`);
    if (!res.ok) throw new Error("Không tìm thấy tỉnh/thành phố");
    return res.json();
}

// Get district by code
export async function getDistrictByCode(code: number): Promise<District> {
    const res = await fetch(`${API_BASE}/d/${code}`);
    if (!res.ok) throw new Error("Không tìm thấy quận/huyện");
    return res.json();
}

// Get ward by code
export async function getWardByCode(code: number): Promise<Ward> {
    const res = await fetch(`${API_BASE}/w/${code}`);
    if (!res.ok) throw new Error("Không tìm thấy phường/xã");
    return res.json();
}

// Search provinces by name
export async function searchProvinces(query: string): Promise<Province[]> {
    const res = await fetch(`${API_BASE}/p/search/?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    return res.json();
}

// Search districts by name
export async function searchDistricts(query: string): Promise<District[]> {
    const res = await fetch(`${API_BASE}/d/search/?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    return res.json();
}

// Search wards by name
export async function searchWards(query: string): Promise<Ward[]> {
    const res = await fetch(`${API_BASE}/w/search/?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    return res.json();
}
