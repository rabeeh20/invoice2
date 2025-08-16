import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Edit, Download, Trash2, ArrowRight } from "lucide-react";
import type { Invoice } from "@shared/schema";
import { generatePDF } from "@/lib/pdf-generator";

export function RecentInvoices() {
  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const recentInvoices = invoices?.slice(0, 5) || [];

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
      <div className="mt-8" data-testid="recent-invoices-loading">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading recent invoices...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-8" data-testid="recent-invoices">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900">Recent Invoices</CardTitle>
          <Link href="/invoices" data-testid="link-view-all">
            <Button variant="ghost" className="text-primary hover:text-blue-600 text-sm font-medium">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentInvoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500" data-testid="empty-recent-invoices">
              No invoices found. Create your first invoice to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200" data-testid="table-recent-invoices">
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
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50" data-testid={`recent-invoice-row-${invoice.id}`}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900" data-testid={`recent-number-${invoice.id}`}>
                        {invoice.number}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`recent-customer-${invoice.id}`}>
                        {invoice.customerName}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900" data-testid={`recent-event-date-${invoice.id}`}>
                        {invoice.eventDate || "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900" data-testid={`recent-total-${invoice.id}`}>
                        ${parseFloat(invoice.total).toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap" data-testid={`recent-status-${invoice.id}`}>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link href={`/invoice/${invoice.id}`} data-testid={`recent-link-edit-${invoice.id}`}>
                            <Button variant="ghost" size="sm" data-testid={`recent-button-edit-${invoice.id}`}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDownloadPDF(invoice)}
                            data-testid={`recent-button-download-${invoice.id}`}
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
