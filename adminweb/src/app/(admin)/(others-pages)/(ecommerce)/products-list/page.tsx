import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ProductListTableV2 from "@/components/ecommerce/ProductListTableV2";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Danh sách sản phẩm | Quản trị cơ khí",
  description: "Quản lý danh sách sản phẩm cơ khí",
};

export default function ProductPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Danh sách sản phẩm" />
      <ProductListTableV2 />
    </div>
  );
}

