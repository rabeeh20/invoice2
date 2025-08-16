import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Edit, ArrowLeft, Printer } from "lucide-react";
import { Link } from "wouter";
import type { InvoiceWithLineItems } from "@shared/schema";
import { generatePDF } from "@/lib/pdf-generator";

export default function InvoiceView() {
  const [, params] = useRoute("/invoice/:id");
  const invoiceId = params?.id;

  const { data: invoice, isLoading } = useQuery<InvoiceWithLineItems>({
    queryKey: ["/api/invoices", invoiceId],
    enabled: !!invoiceId,
  });

  const handleDownloadPDF = async () => {
    if (invoice) {
      await generatePDF(invoice);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="page-invoice-loading">
        <div className="text-center">Loading invoice...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="page-invoice-not-found">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice not found</h2>
          <Link href="/invoices" data-testid="link-back-to-invoices">
            <Button>Back to Invoices</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="page-invoice-view">
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/invoices" data-testid="link-back">
          <Button variant="ghost" data-testid="button-back">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Button>
        </Link>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePrint} data-testid="button-print">
            <Printer className="mr-2 h-4 w-4" />
            Printer
          </Button>
          <Button onClick={handleDownloadPDF} data-testid="button-download-pdf">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <Card className="print:shadow-none print:border-none">
        <CardContent className="p-8">
          {/* Invoice Header */}
          <div className="mb-8">
            <div className="h-32 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg mb-6 flex items-center justify-center print:bg-gray-50">
              <div className="text-center">
                <div className="text-primary text-3xl mb-2">🍽️</div>
                <h3 className="text-xl font-bold text-gray-900">Elegant Catering Co.</h3>
                <p className="text-sm text-gray-600">Professional Catering Services</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">From:</h4>
                <div className="text-sm text-gray-600">
                  <p>Elegant Catering Co.</p>
                  <p>123 Culinary Drive</p>
                  <p>Foodtown, CA 90210</p>
                  <p>(555) 123-4567</p>
                  <p>info@elegantcatering.com</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Bill To:</h4>
                <div className="text-sm text-gray-600">
                  <p data-testid="text-customer-name">{invoice.customerName}</p>
                  <div className="whitespace-pre-line" data-testid="text-customer-address">
                    {invoice.customerAddress}
                  </div>
                  <p data-testid="text-customer-email">{invoice.customerEmail}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-600">
                  Invoice Number: <span className="font-medium text-gray-900" data-testid="text-invoice-number">{invoice.number}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Invoice Date: <span className="font-medium text-gray-900" data-testid="text-invoice-date">
                    {new Date(invoice.createdAt!).toLocaleDateString()}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Event Date: <span className="font-medium text-gray-900" data-testid="text-event-date">
                    {invoice.eventDate || "N/A"}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Event Type: <span className="font-medium text-gray-900" data-testid="text-event-type">
                    {invoice.eventType || "N/A"}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Status: <Badge className={getStatusColor(invoice.status)} data-testid="status-badge">
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Badge>
                </p>
              </div>
            </div>
          </div>

          {/* Invoice Items Table */}
          <div className="mb-8">
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full" data-testid="table-line-items">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Description</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Qty</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Rate</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.lineItems.map((item) => (
                    <tr key={item.id} data-testid={`row-line-item-${item.id}`}>
                      <td className="px-4 py-3 text-sm text-gray-900" data-testid={`text-description-${item.id}`}>
                        {item.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center" data-testid={`text-quantity-${item.id}`}>
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right" data-testid={`text-rate-${item.id}`}>
                        ${parseFloat(item.rate).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right" data-testid={`text-amount-${item.id}`}>
                        ${parseFloat(item.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Totals */}
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="text-sm font-medium text-gray-900" data-testid="text-subtotal">
                  ${parseFloat(invoice.subtotal).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">
                  Tax ({(parseFloat(invoice.taxRate) * 100).toFixed(2)}%):
                </span>
                <span className="text-sm font-medium text-gray-900" data-testid="text-tax">
                  ${parseFloat(invoice.taxAmount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-3 border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-gray-900" data-testid="text-total">
                  ${parseFloat(invoice.total).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          {invoice.notes && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
              <p className="text-sm text-gray-600 whitespace-pre-line" data-testid="text-notes">
                {invoice.notes}
              </p>
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Payment Terms</h4>
            <p className="text-sm text-gray-600 mb-2">Payment is due within 30 days of invoice date.</p>
            <p className="text-sm text-gray-600">Thank you for choosing Elegant Catering Co. for your special event!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
