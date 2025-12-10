import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AddProductFormV2 from "@/components/ecommerce/AddProductFormV2";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thêm sản phẩm | Quản trị cơ khí",
  description: "Thêm sản phẩm mới vào hệ thống",
};

export default function AddProductPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Thêm sản phẩm" />
      <AddProductFormV2 />
    </div>
  );
}

