/**
 * Dashboard Service - Thống kê tổng quan cho admin
 * Dữ liệu tính từ ngày 1 của tháng hiện tại đến ngày hiện tại
 */
import { httpClient } from "./httpClient";
import type { Order, User, Product } from "@/types";

export interface DashboardStats {
    // Thống kê tháng này (từ ngày 1 đến hiện tại)
    monthlyCustomers: number; // Khách hàng đăng ký mới trong tháng
    monthlyOrders: number;
    monthlyRevenue: number;
    monthlyPendingOrders: number;

    // Thống kê tổng
    totalCustomers: number;
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;

    // Thống kê hôm nay
    todayOrders: number;
    todayRevenue: number;
    todayNewCustomers: number; // Khách hàng đăng ký mới hôm nay

    // Đơn hàng gần nhất
    recentOrders: Order[];

    // Thông tin thời gian
    periodStart: string;
    periodEnd: string;
}

export interface CityDemographic {
    city: string;
    count: number;
    percentage: number;
}

export interface MonthlySalesData {
    month: string;
    orderCount: number;
}

export interface MonthlyStatsData {
    month: string;
    sales: number;
    revenue: number;
}

export interface BackendDashboardStats {
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    totalRevenue: number;
    monthlyRevenue: number;
    monthlySales: MonthlySalesData[];
    monthlyStats: MonthlyStatsData[];
}

export const dashboardService = {
    /**
     * Lấy thống kê tổng quan cho dashboard
     * Dữ liệu trong tháng: từ ngày 1 đến ngày hiện tại
     */
    async getStats(): Promise<DashboardStats> {
        try {
            // Tính ngày đầu tháng và ngày hiện tại
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfToday = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            );

            console.log("[Dashboard] Fetching stats...");

            // Gọi song song các API
            const [ordersResult, customersResult, productsResult] = await Promise.allSettled([
                httpClient.get<Order[]>("/api/admin/orders"),
                httpClient.get<User[]>("/api/admin/users"),
                httpClient.get<Product[]>("/api/products", { skipAuth: true }),
            ]);

            // Extract data from results
            const orders = ordersResult.status === 'fulfilled' ? ordersResult.value : [];
            const customers = customersResult.status === 'fulfilled' ? customersResult.value : [];
            const products = productsResult.status === 'fulfilled' ? productsResult.value : [];

            // Log results for debugging
            console.log("[Dashboard] Orders fetched:", Array.isArray(orders) ? orders.length : "not array", orders);
            console.log("[Dashboard] Customers fetched:", Array.isArray(customers) ? customers.length : "not array");
            console.log("[Dashboard] Products fetched:", Array.isArray(products) ? products.length : "not array");

            if (ordersResult.status === 'rejected') {
                console.error("[Dashboard] Orders API error:", ordersResult.reason);
            }
            if (customersResult.status === 'rejected') {
                console.error("[Dashboard] Customers API error:", customersResult.reason);
            }

            // Đảm bảo orders là array
            const orderList = Array.isArray(orders) ? orders : [];
            const customerList = Array.isArray(customers) ? customers : [];
            const productList = Array.isArray(products) ? products : [];

            // ------- THỐNG KÊ TỔNG -------
            // Chỉ tính doanh thu từ đơn hàng ĐÃ THANH TOÁN (PAID)
            let totalRevenue = 0;
            orderList.forEach((order: Order) => {
                if (order.paymentStatus === "PAID") {
                    totalRevenue += order.totalAmount || 0;
                }
            });

            // ------- THỐNG KÊ THÁNG NÀY (từ ngày 1 đến hiện tại) -------
            let monthlyRevenue = 0;
            let monthlyOrders = 0;
            let monthlyPendingOrders = 0;

            // ------- THỐNG KÊ HÔM NAY -------
            let todayRevenue = 0;
            let todayOrders = 0;

            orderList.forEach((order: Order) => {
                if (!order.createdAt) return;

                const orderDate = new Date(order.createdAt);

                // Kiểm tra đơn hàng trong tháng này
                if (orderDate >= startOfMonth && orderDate <= now) {
                    monthlyOrders++;

                    // Chỉ tính doanh thu từ đơn đã thanh toán (PAID)
                    if (order.paymentStatus === "PAID") {
                        monthlyRevenue += order.totalAmount || 0;
                    }

                    // Đếm đơn chờ xử lý (PENDING)
                    if (order.status === "PENDING") {
                        monthlyPendingOrders++;
                    }

                    // Kiểm tra đơn hàng hôm nay
                    if (orderDate >= startOfToday) {
                        todayOrders++;
                        // Chỉ tính doanh thu từ đơn đã thanh toán (PAID)
                        if (order.paymentStatus === "PAID") {
                            todayRevenue += order.totalAmount || 0;
                        }
                    }
                }
            });

            // Lấy 10 đơn hàng gần nhất
            const recentOrders = orderList
                .filter((o) => o && o.createdAt)
                .sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
                .slice(0, 10);

            // Đếm tổng khách hàng (role = USER)
            const totalCustomers = customerList.filter(
                (u) => u.role === "USER"
            ).length;

            // Đếm khách hàng MỚI ĐĂNG KÝ trong tháng này (dựa trên createdAt)
            const monthlyNewCustomers = customerList.filter((u) => {
                if (u.role !== "USER" || !u.createdAt) return false;
                const createdDate = new Date(u.createdAt);
                return createdDate >= startOfMonth && createdDate <= now;
            }).length;

            // Đếm khách hàng MỚI ĐĂNG KÝ hôm nay
            const todayNewCustomers = customerList.filter((u) => {
                if (u.role !== "USER" || !u.createdAt) return false;
                const createdDate = new Date(u.createdAt);
                return createdDate >= startOfToday && createdDate <= now;
            }).length;

            const stats = {
                // Tháng này
                monthlyCustomers: monthlyNewCustomers,
                monthlyOrders,
                monthlyRevenue,
                monthlyPendingOrders,

                // Tổng
                totalCustomers,
                totalOrders: orderList.length,
                totalRevenue,
                totalProducts: productList.length,

                // Hôm nay
                todayOrders,
                todayRevenue,
                todayNewCustomers,

                // Đơn hàng gần nhất
                recentOrders,

                // Thời gian
                periodStart: startOfMonth.toISOString(),
                periodEnd: now.toISOString(),
            };

            console.log("[Dashboard] Stats computed:", {
                monthlyOrders: stats.monthlyOrders,
                totalOrders: stats.totalOrders,
                monthlyRevenue: stats.monthlyRevenue,
                recentOrdersCount: stats.recentOrders.length,
            });

            return stats;
        } catch (error) {
            console.error("[Dashboard] Failed to get dashboard stats:", error);
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            return {
                monthlyCustomers: 0,
                monthlyOrders: 0,
                monthlyRevenue: 0,
                monthlyPendingOrders: 0,
                totalCustomers: 0,
                totalOrders: 0,
                totalRevenue: 0,
                totalProducts: 0,
                todayOrders: 0,
                todayRevenue: 0,
                todayNewCustomers: 0,
                recentOrders: [],
                periodStart: startOfMonth.toISOString(),
                periodEnd: now.toISOString(),
            };
        }
    },

    /**
     * Lấy phân bố đơn hàng theo thành phố - TOP 5 city có nhiều đơn nhất
     */
    async getCityDemographics(): Promise<CityDemographic[]> {
        try {
            console.log("[Dashboard] Fetching city demographics...");
            const orders = await httpClient.get<Order[]>("/api/admin/orders");

            console.log("[Dashboard] Demographics orders:", Array.isArray(orders) ? orders.length : "not array");

            if (!Array.isArray(orders) || orders.length === 0) return [];

            // Đếm số lượng ĐƠN HÀNG theo thành phố từ shipping address
            const cityOrderCount = new Map<string, number>(); // city -> order count

            orders.forEach((order: Order) => {
                if (order && order.shippingAddress) {
                    const city = this.extractCityFromAddress(order.shippingAddress);
                    if (city) {
                        cityOrderCount.set(city, (cityOrderCount.get(city) || 0) + 1);
                    }
                }
            });

            // Tổng số đơn hàng
            const totalOrders = orders.length;

            // Convert to array, tính percentage và lấy TOP 5
            const demographics: CityDemographic[] = Array.from(cityOrderCount.entries())
                .map(([city, count]) => ({
                    city,
                    count,
                    percentage:
                        totalOrders > 0
                            ? Math.round((count / totalOrders) * 100)
                            : 0,
                }))
                .sort((a, b) => b.count - a.count) // Sort theo count giảm dần
                .slice(0, 5); // Chỉ lấy TOP 5

            console.log("[Dashboard] Demographics result (TOP 5):", demographics);

            return demographics;
        } catch (error) {
            console.error("[Dashboard] Failed to get city demographics:", error);
            return [];
        }
    },

    /**
     * Extract province/city from address (format Việt Nam)
     * Ví dụ: "123 Nguyễn Văn A, Q1, HCM" -> "HCM"
     * Ví dụ: "456 Đường XYZ, Phường ABC, Quận 1, TP. Hồ Chí Minh" -> "TP. Hồ Chí Minh"
     */
    extractCityFromAddress(address: string): string {
        if (!address) return "Không xác định";

        // Chuẩn hóa địa chỉ
        const normalizedAddress = address.trim();

        // Split theo dấu phẩy
        const parts = normalizedAddress.split(",").map(p => p.trim()).filter(p => p.length > 0);

        if (parts.length >= 1) {
            // Lấy phần cuối cùng (thường là tỉnh/thành phố)
            const lastPart = parts[parts.length - 1];

            // Chuẩn hóa tên thành phố phổ biến
            const cityMappings: Record<string, string> = {
                'HCM': 'TP. Hồ Chí Minh',
                'TPHCM': 'TP. Hồ Chí Minh',
                'Ho Chi Minh': 'TP. Hồ Chí Minh',
                'Hồ Chí Minh': 'TP. Hồ Chí Minh',
                'HN': 'Hà Nội',
                'Ha Noi': 'Hà Nội',
            };

            // Kiểm tra mapping
            for (const [key, value] of Object.entries(cityMappings)) {
                if (lastPart.toLowerCase().includes(key.toLowerCase())) {
                    return value;
                }
            }

            // Nếu phần cuối quá ngắn hoặc là quận, thử phần trước đó
            if (lastPart.length <= 3 || lastPart.match(/^Q\d+$/i) || lastPart.match(/^Quận/i)) {
                if (parts.length >= 2) {
                    const secondLast = parts[parts.length - 2];
                    if (secondLast.length > 3 && !secondLast.match(/^Q\d+$/i) && !secondLast.match(/^Quận/i)) {
                        return secondLast;
                    }
                }
            }

            return lastPart;
        }

        return "Khác";
    },

    /**
     * Lấy dữ liệu chart từ backend API
     */
    async getChartStats(): Promise<BackendDashboardStats> {
        try {
            console.log("[Dashboard] Fetching chart stats from backend...");
            const response = await httpClient.get<BackendDashboardStats>("/api/dashboard/stats");
            console.log("[Dashboard] Chart stats:", response);
            return response;
        } catch (error) {
            console.error("[Dashboard] Failed to get chart stats:", error);
            // Return default empty data
            return {
                totalOrders: 0,
                totalCustomers: 0,
                totalProducts: 0,
                totalRevenue: 0,
                monthlyRevenue: 0,
                monthlySales: [],
                monthlyStats: [],
            };
        }
    },

    /**
     * Alias for getChartStats - backwards compatibility
     */
    async getChartData(): Promise<BackendDashboardStats> {
        return this.getChartStats();
    },
};

export default dashboardService;
