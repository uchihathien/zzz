import AnalyticsMetricsV2 from "@/components/analytics/AnalyticsMetricsV2";
import SalesChartV2 from "@/components/analytics/SalesChartV2";
import OrdersAnalyticsChart from "@/components/analytics/OrdersAnalyticsChart";
import RevenueOverview from "@/components/analytics/RevenueOverview";
import DemographicCardV2 from "@/components/ecommerce/DemographicCardV2";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Phân tích kinh doanh | Getabec Admin",
  description: "Trang phân tích dữ liệu kinh doanh - Getabec Admin Dashboard",
};

export default function Analytics() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Phân tích kinh doanh
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Tổng quan dữ liệu và thống kê kinh doanh
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div>
        <AnalyticsMetricsV2 />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-8">
          <SalesChartV2 />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <DemographicCardV2 />
        </div>
      </div>

      {/* Charts Row 2 - Order & Payment Analysis */}
      <div>
        <OrdersAnalyticsChart />
      </div>

      {/* Revenue Overview */}
      <div>
        <RevenueOverview />
      </div>
    </div>
  );
}
