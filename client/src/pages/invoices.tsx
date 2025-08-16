import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Edit, Download, Trash2, Eye } from "lucide-react";
import type { Invoice } from "@shared/schema";
import { generatePDF } from "@/lib/pdf-generator";

export default function Invoices() {
  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      // Fetch full invoice with line items
      const response = await fetch(`/api/invoices/${invoice.id}`);
      const fullInvoice = await response.json();
      await generatePDF(fullInvoice);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="page-invoices-loading">
        <div className="text-center">Loading invoices...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="page-invoices">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900">All Invoices</CardTitle>
          <Link href="/" data-testid="link-create-invoice">
            <Button className="bg-primary text-white hover:bg-blue-600" data-testid="button-create-invoice">
              Create New Invoice
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {!invoices || invoices.length === 0 ? (
            <div className="text-center py-8" data-testid="empty-state">
              <p className="text-gray-500">No invoices found. Create your first invoice to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200" data-testid="table-invoices">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50" data-testid={`row-invoice-${invoice.id}`}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900" data-testid={`text-number-${invoice.id}`}>
                        {invoice.number}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`text-customer-${invoice.id}`}>
                        {invoice.customerName}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`text-event-date-${invoice.id}`}>
                        {invoice.eventDate || "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900" data-testid={`text-total-${invoice.id}`}>
                        ${parseFloat(invoice.total).toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap" data-testid={`status-${invoice.id}`}>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link href={`/invoice/${invoice.id}`} data-testid={`link-view-${invoice.id}`}>
                            <Button variant="ghost" size="sm" data-testid={`button-view-${invoice.id}`}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDownloadPDF(invoice)}
                            data-testid={`button-download-${invoice.id}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
