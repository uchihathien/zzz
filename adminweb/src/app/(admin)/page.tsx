import type { Metadata } from "next";
import EcommerceMetricsV2 from "@/components/ecommerce/EcommerceMetricsV2";
import React from "react";
import MonthlyTargetV2 from "@/components/ecommerce/MonthlyTargetV2";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrdersV2 from "@/components/ecommerce/RecentOrdersV2";
import DemographicCardV2 from "@/components/ecommerce/DemographicCardV2";

export const metadata: Metadata = {
  title: "Bảng điều khiển | Quản trị cơ khí",
  description: "Tổng quan hệ thống quản trị cơ khí",
};

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetricsV2 />

        <MonthlySalesChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTargetV2 />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DemographicCardV2 />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <RecentOrdersV2 />
      </div>
    </div>
  );
}

