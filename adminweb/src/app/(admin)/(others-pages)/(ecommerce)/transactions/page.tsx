import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TransactionList from "@/components/ecommerce/TransactionList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Next.js E-commerce Transaction | Getabec - Next.js Dashboard Template",
  description:
    "This is E-commerce  Next.js Transaction Getabec Dashboard Template",
};

export default function TransactionsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Transactions" />
      <TransactionList />
    </div>
  );
}
