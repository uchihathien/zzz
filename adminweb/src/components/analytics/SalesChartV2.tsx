"use client";
import React, { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { ordersService } from "@/lib/api/orders.service";
import { Order } from "@/types";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
});

type TimePeriod = "month" | "quarter" | "year";
type ViewMode = "orders" | "revenue";

export default function SalesChartV2() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>("orders");
    const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        try {
            setLoading(true);
            const data = await ordersService.adminSearch();
            setOrders(data || []);
        } catch (error) {
            console.error("Failed to load orders:", error);
        } finally {
            setLoading(false);
        }
    }

    const formatCurrency = (amount: number) => {
        if (amount >= 1000000000) return (amount / 1000000000).toFixed(1) + "B";
        if (amount >= 1000000) return (amount / 1000000).toFixed(1) + "M";
        if (amount >= 1000) return (amount / 1000).toFixed(0) + "K";
        return amount.toString();
    };

    // Process data based on time period
    const chartData = useMemo(() => {
        if (!orders.length) return { labels: [], orderCounts: [], revenues: [] };

        const groupedData: Record<string, { orders: number; revenue: number }> = {};

        orders.forEach((order) => {
            if (!order.createdAt) return;
            const date = new Date(order.createdAt);
            let key = "";

            switch (timePeriod) {
                case "month": {
                    key = `T${date.getMonth() + 1}/${date.getFullYear()}`;
                    break;
                }
                case "quarter": {
                    const quarter = Math.floor(date.getMonth() / 3) + 1;
                    key = `Q${quarter}/${date.getFullYear()}`;
                    break;
                }
                case "year": {
                    key = date.getFullYear().toString();
                    break;
                }
            }

            if (!groupedData[key]) {
                groupedData[key] = { orders: 0, revenue: 0 };
            }
            groupedData[key].orders++;
            if (order.paymentStatus === "PAID") {
                groupedData[key].revenue += order.totalAmount || 0;
            }
        });

        // Sort keys properly
        const sortedKeys = Object.keys(groupedData).sort((a, b) => {
            if (timePeriod === "month") {
                const [monthA, yearA] = a.substring(1).split("/").map(Number);
                const [monthB, yearB] = b.substring(1).split("/").map(Number);
                return yearA !== yearB ? yearA - yearB : monthA - monthB;
            }
            if (timePeriod === "quarter") {
                const [qA, yearA] = a.substring(1).split("/").map(Number);
                const [qB, yearB] = b.substring(1).split("/").map(Number);
                return yearA !== yearB ? yearA - yearB : qA - qB;
            }
            return parseInt(a) - parseInt(b);
        });

        // Limit data points based on period
        const limitedKeys = timePeriod === "month"
            ? sortedKeys.slice(-12)
            : sortedKeys.slice(-8);

        return {
            labels: limitedKeys,
            orderCounts: limitedKeys.map(k => groupedData[k].orders),
            revenues: limitedKeys.map(k => groupedData[k].revenue),
        };
    }, [orders, timePeriod]);

    const options: ApexOptions = {
        colors: viewMode === "orders" ? ["#465fff"] : ["#10b981"],
        chart: {
            fontFamily: "Outfit, sans-serif",
            type: "bar",
            height: 350,
            toolbar: {
                show: false,
            },
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: "55%",
                borderRadius: 6,
                borderRadiusApplication: "end",
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            show: true,
            width: 2,
            colors: ["transparent"],
        },
        xaxis: {
            categories: chartData.labels,
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            labels: {
                rotate: 0,
                style: {
                    colors: "#64748b",
                    fontSize: "12px",
                },
            },
        },
        yaxis: {
            labels: {
                formatter: (val: number) => viewMode === "revenue" ? formatCurrency(val) : val.toString(),
                style: {
                    colors: "#64748b",
                    fontSize: "12px",
                },
            },
        },
        legend: {
            show: false,
        },
        grid: {
            borderColor: "#e2e8f0",
            strokeDashArray: 4,
            yaxis: {
                lines: {
                    show: true,
                },
            },
        },
        fill: {
            type: "gradient",
            gradient: {
                shade: "light",
                type: "vertical",
                shadeIntensity: 0.25,
                gradientToColors: viewMode === "orders" ? ["#818cf8"] : ["#34d399"],
                inverseColors: false,
                opacityFrom: 1,
                opacityTo: 0.85,
            },
        },
        tooltip: {
            y: {
                formatter: (val: number) => viewMode === "revenue"
                    ? new Intl.NumberFormat("vi-VN").format(val) + " ₫"
                    : val + " đơn",
            },
        },
    };

    const series = [
        {
            name: viewMode === "orders" ? "Số đơn hàng" : "Doanh thu",
            data: viewMode === "orders" ? chartData.orderCounts : chartData.revenues,
        },
    ];

    // Calculate totals
    const totalOrders = chartData.orderCounts.reduce((a, b) => a + b, 0);
    const totalRevenue = chartData.revenues.reduce((a, b) => a + b, 0);

    const periodLabels: Record<TimePeriod, string> = {
        month: "Theo tháng (12 tháng)",
        quarter: "Theo quý",
        year: "Theo năm",
    };

    if (loading) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
                <div className="h-[350px] bg-gray-100 dark:bg-gray-800 rounded"></div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                    <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
                        📊 Thống kê bán hàng
                    </h3>
                    <span className="block text-gray-500 text-theme-sm dark:text-gray-400">
                        {periodLabels[timePeriod]}
                    </span>
                </div>

                {/* Summary badges */}
                <div className="flex gap-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalOrders}</p>
                        <p className="text-xs text-gray-500">Đơn hàng</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalRevenue)}</p>
                        <p className="text-xs text-gray-500">Doanh thu</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    {(["month", "quarter", "year"] as TimePeriod[]).map((period) => (
                        <button
                            key={period}
                            onClick={() => setTimePeriod(period)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${timePeriod === period
                                ? "bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                                }`}
                        >
                            {period === "month" ? "Tháng" : period === "quarter" ? "Quý" : "Năm"}
                        </button>
                    ))}
                </div>

                <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg ml-auto">
                    <button
                        onClick={() => setViewMode("orders")}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === "orders"
                            ? "bg-blue-500 text-white"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                            }`}
                    >
                        📦 Đơn hàng
                    </button>
                    <button
                        onClick={() => setViewMode("revenue")}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === "revenue"
                            ? "bg-green-500 text-white"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                            }`}
                    >
                        💰 Doanh thu
                    </button>
                </div>
            </div>

            <div className="max-w-full overflow-x-auto custom-scrollbar">
                <div className="-ml-5 min-w-[600px] xl:min-w-full pl-2">
                    <ReactApexChart
                        options={options}
                        series={series}
                        type="bar"
                        height={350}
                    />
                </div>
            </div>
        </div>
    );
}
