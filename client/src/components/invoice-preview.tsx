import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import type { InvoiceWithLineItems } from "@shared/schema";

interface InvoicePreviewProps {
  invoice: InvoiceWithLineItems | null;
}

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
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

  return (
    <Card data-testid="card-invoice-preview">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold text-gray-900">Invoice Preview</CardTitle>
        <Button variant="ghost" onClick={handlePrint} data-testid="button-print-preview">
          <Printer className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent>
        {!invoice ? (
          <div className="text-center py-8 text-gray-500" data-testid="empty-preview">
            Fill out the form to see invoice preview
          </div>
        ) : (
          <div>
            {/* Invoice Header */}
            <div className="mb-8">
              <div className="h-32 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg mb-6 flex items-center justify-center">
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
                    <p data-testid="preview-customer-name">{invoice.customerName || "Customer Name"}</p>
                    <div className="whitespace-pre-line" data-testid="preview-customer-address">
                      {invoice.customerAddress || "Customer Address"}
                    </div>
                    <p data-testid="preview-customer-email">{invoice.customerEmail || "customer@email.com"}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">
                    Invoice Number: <span className="font-medium text-gray-900" data-testid="preview-invoice-number">{invoice.number}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Invoice Date: <span className="font-medium text-gray-900" data-testid="preview-invoice-date">
                      {new Date().toLocaleDateString()}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Event Date: <span className="font-medium text-gray-900" data-testid="preview-event-date">
                      {invoice.eventDate || "N/A"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Event Type: <span className="font-medium text-gray-900" data-testid="preview-event-type">
                      {invoice.eventType || "N/A"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: <Badge className={getStatusColor(invoice.status)} data-testid="preview-status">
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </p>
                </div>
              </div>
            </div>

            {/* Invoice Items Table */}
            <div className="mb-8">
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full" data-testid="preview-line-items-table">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Description</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Qty</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Rate</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoice.lineItems.filter(item => item.description).map((item, index) => (
                      <tr key={index} data-testid={`preview-line-item-${index}`}>
                        <td className="px-4 py-3 text-sm text-gray-900" data-testid={`preview-description-${index}`}>
                          {item.description}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-center" data-testid={`preview-quantity-${index}`}>
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right" data-testid={`preview-rate-${index}`}>
                          ${parseFloat(item.rate).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right" data-testid={`preview-amount-${index}`}>
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
                  <span className="text-sm font-medium text-gray-900" data-testid="preview-subtotal">
                    ${parseFloat(invoice.subtotal).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-600">
                    Tax ({(parseFloat(invoice.taxRate) * 100).toFixed(2)}%):
                  </span>
                  <span className="text-sm font-medium text-gray-900" data-testid="preview-tax">
                    ${parseFloat(invoice.taxAmount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-t border-gray-200">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-lg font-bold text-gray-900" data-testid="preview-total">
                    ${parseFloat(invoice.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            {invoice.notes && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line" data-testid="preview-notes">
                  {invoice.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
