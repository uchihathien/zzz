"use client";
import React, { useState, useEffect } from "react";
import { ApexOptions } from "apexcharts";
import ChartTab from "../common/ChartTab";
import dynamic from "next/dynamic";
import { dashboardService, MonthlyStatsData } from "@/lib/api/dashboard.service";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function StatisticsChart() {
  const [salesData, setSalesData] = useState<number[]>([]);
  const [revenueData, setRevenueData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await dashboardService.getChartStats();
        if (stats.monthlyStats && stats.monthlyStats.length > 0) {
          setSalesData(stats.monthlyStats.map((m: MonthlyStatsData) => m.sales));
          setRevenueData(stats.monthlyStats.map((m: MonthlyStatsData) => m.revenue));
        }
      } catch (error) {
        console.error("Failed to fetch monthly stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#465FFF", "#10B981"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: [2, 2],
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      shared: true,
      y: {
        formatter: function (val: number, opts) {
          if (opts.seriesIndex === 0) {
            return val + " đơn";
          }
          return val + " triệu đồng";
        },
      },
    },
    xaxis: {
      type: "category",
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: [
      {
        title: {
          text: "Đơn hàng",
          style: {
            fontSize: "12px",
            color: "#465FFF",
          },
        },
        labels: {
          style: {
            fontSize: "12px",
            colors: ["#465FFF"],
          },
        },
      },
      {
        opposite: true,
        title: {
          text: "Doanh thu (triệu đồng)",
          style: {
            fontSize: "12px",
            color: "#10B981",
          },
        },
        labels: {
          style: {
            fontSize: "12px",
            colors: ["#10B981"],
          },
        },
      },
    ],
  };

  const defaultData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  const series = [
    {
      name: "Đơn hàng",
      data: salesData.length > 0 ? salesData : defaultData,
    },
    {
      name: "Doanh thu (triệu đồng)",
      data: revenueData.length > 0 ? revenueData : defaultData,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Thống kê doanh thu
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Đơn hàng và doanh thu theo tháng
          </p>
        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end">
          <ChartTab />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          {loading ? (
            <div className="flex items-center justify-center h-[310px]">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent"></div>
            </div>
          ) : (
            <ReactApexChart
              options={options}
              series={series}
              type="area"
              height={310}
            />
          )}
        </div>
      </div>
    </div>
  );
}
