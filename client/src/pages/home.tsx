import { InvoiceForm } from "@/components/invoice-form";
import { InvoicePreview } from "@/components/invoice-preview";
import { RecentInvoices } from "@/components/recent-invoices";
import { useState } from "react";
import type { InvoiceWithLineItems } from "@shared/schema";

export default function Home() {
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceWithLineItems | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="page-home">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <InvoiceForm onPreview={setPreviewInvoice} data-testid="invoice-form" />
        <InvoicePreview invoice={previewInvoice} data-testid="invoice-preview" />
      </div>
      <RecentInvoices data-testid="recent-invoices" />
    </div>
  );
}
