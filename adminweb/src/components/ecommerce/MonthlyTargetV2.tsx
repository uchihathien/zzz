"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ordersService } from "@/lib/api";
import type { Order } from "@/types";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
});

export default function MonthlyTargetV2() {
    const [data, setData] = useState({
        totalRevenue: 0,
        monthlyRevenue: 0,
        todayRevenue: 0,
        monthlyTarget: 200000000, // 100 triệu VNĐ mục tiêu
        percentage: 0,
        loading: true,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const orders = await ordersService.adminSearch({});

            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            let totalRevenue = 0;
            let monthlyRevenue = 0;
            let todayRevenue = 0;

            // Chỉ tính doanh thu từ đơn hàng ĐÃ THANH TOÁN (PAID)
            orders.forEach((order: Order) => {
                if (order.paymentStatus === "PAID") {
                    totalRevenue += order.totalAmount;

                    const orderDate = new Date(order.createdAt);
                    if (orderDate >= startOfMonth) {
                        monthlyRevenue += order.totalAmount;
                    }
                    if (orderDate >= startOfToday) {
                        todayRevenue += order.totalAmount;
                    }
                }
            });

            const monthlyTarget = 300000000; // 100 triệu
            const percentage = Math.min(100, Math.round((monthlyRevenue / monthlyTarget) * 100));

            setData({
                totalRevenue,
                monthlyRevenue,
                todayRevenue,
                monthlyTarget,
                percentage,
                loading: false,
            });
        } catch (error) {
            console.error("Failed to load monthly target:", error);
            setData((prev) => ({ ...prev, loading: false }));
        }
    };

    const formatCurrency = (amount: number): string => {
        if (amount >= 1000000000) {
            return `${(amount / 1000000000).toFixed(1)} tỷ`;
        }
        if (amount >= 1000000) {
            return `${(amount / 1000000).toFixed(1)} tr`;
        }
        if (amount >= 1000) {
            return `${(amount / 1000).toFixed(0)}k`;
        }
        return amount.toLocaleString("vi-VN");
    };

    const options: ApexOptions = {
        colors: ["#465FFF"],
        chart: {
            fontFamily: "Outfit, sans-serif",
            type: "radialBar",
            height: 330,
            sparkline: {
                enabled: true,
            },
        },
        plotOptions: {
            radialBar: {
                startAngle: -85,
                endAngle: 85,
                hollow: {
                    size: "80%",
                },
                track: {
                    background: "#E4E7EC",
                    strokeWidth: "100%",
                    margin: 5,
                },
                dataLabels: {
                    name: {
                        show: false,
                    },
                    value: {
                        fontSize: "36px",
                        fontWeight: "600",
                        offsetY: -40,
                        color: "#1D2939",
                        formatter: function (val) {
                            return val + "%";
                        },
                    },
                },
            },
        },
        fill: {
            type: "solid",
            colors: ["#465FFF"],
        },
        stroke: {
            lineCap: "round",
        },
        labels: ["Tiến độ"],
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
                <div className="flex justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Mục tiêu tháng
                        </h3>
                        <p className="mt-1 font-normal text-gray-500 text-theme-sm dark:text-gray-400">
                            Tiến độ doanh thu tháng này
                        </p>
                    </div>
                    <button
                        onClick={loadData}
                        className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        title="Làm mới"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>

                <div className="relative">
                    {data.loading ? (
                        <div className="flex items-center justify-center h-[330px]">
                            <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-500 border-t-transparent"></div>
                        </div>
                    ) : (
                        <>
                            <div className="max-h-[330px]" id="chartDarkStyle">
                                <ReactApexChart
                                    options={options}
                                    series={[data.percentage]}
                                    type="radialBar"
                                    height={330}
                                />
                            </div>

                            <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
                                {data.percentage}% hoàn thành
                            </span>
                        </>
                    )}
                </div>

                <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
                    {data.loading ? (
                        "Đang tải dữ liệu..."
                    ) : data.monthlyRevenue > 0 ? (
                        `Bạn đã đạt ${formatCurrency(data.monthlyRevenue)} VNĐ tháng này. Cố gắng để đạt mục tiêu ${formatCurrency(data.monthlyTarget)} VNĐ!`
                    ) : (
                        "Chưa có doanh thu trong tháng này. Hãy cố gắng lên!"
                    )}
                </p>
            </div>

            <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
                <div>
                    <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
                        Mục tiêu
                    </p>
                    <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
                        {formatCurrency(data.monthlyTarget)}
                    </p>
                </div>

                <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

                <div>
                    <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
                        Tháng này
                    </p>
                    <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
                        {formatCurrency(data.monthlyRevenue)}
                        {data.monthlyRevenue > 0 && (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M7.60141 2.33683C7.73885 2.18084 7.9401 2.08243 8.16435 2.08243C8.16475 2.08243 8.16516 2.08243 8.16556 2.08243C8.35773 2.08219 8.54998 2.15535 8.69664 2.30191L12.6968 6.29924C12.9898 6.59203 12.9899 7.0669 12.6971 7.3599C12.4044 7.6529 11.9295 7.65306 11.6365 7.36027L8.91435 4.64004L8.91435 13.5C8.91435 13.9142 8.57856 14.25 8.16435 14.25C7.75013 14.25 7.41435 13.9142 7.41435 13.5L7.41435 4.64442L4.69679 7.36025C4.4038 7.65305 3.92893 7.6529 3.63613 7.35992C3.34333 7.06693 3.34348 6.59206 3.63646 6.29926L7.60141 2.33683Z"
                                    fill="#039855"
                                />
                            </svg>
                        )}
                    </p>
                </div>

                <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

                <div>
                    <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
                        Hôm nay
                    </p>
                    <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
                        {formatCurrency(data.todayRevenue)}
                        {data.todayRevenue > 0 && (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M7.60141 2.33683C7.73885 2.18084 7.9401 2.08243 8.16435 2.08243C8.16475 2.08243 8.16516 2.08243 8.16556 2.08243C8.35773 2.08219 8.54998 2.15535 8.69664 2.30191L12.6968 6.29924C12.9898 6.59203 12.9899 7.0669 12.6971 7.3599C12.4044 7.6529 11.9295 7.65306 11.6365 7.36027L8.91435 4.64004L8.91435 13.5C8.91435 13.9142 8.57856 14.25 8.16435 14.25C7.75013 14.25 7.41435 13.9142 7.41435 13.5L7.41435 4.64442L4.69679 7.36025C4.4038 7.65305 3.92893 7.6529 3.63613 7.35992C3.34333 7.06693 3.34348 6.59206 3.63646 6.29926L7.60141 2.33683Z"
                                    fill="#039855"
                                />
                            </svg>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}
