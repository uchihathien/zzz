import InvoiceMain from "@/components/invoice/InvoiceMain";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title:
    "Next.js E-commerce Single Invoice | Getabec - Next.js Dashboard Template",
  description:
    "This is Next.js E-commerce  Single Invoice Getabec Dashboard Template",
};

export default function SingleInvoicePage() {
  return (
    <div>
      <InvoiceMain />
    </div>
  );
}
