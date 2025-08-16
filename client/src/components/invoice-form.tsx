import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LineItemTable } from "./line-item-table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertInvoiceSchema } from "@shared/schema";
import type { InvoiceWithLineItems, LineItem } from "@shared/schema";
import { z } from "zod";
import { Save, Eye, Download } from "lucide-react";
import { generatePDF } from "@/lib/pdf-generator";

const formSchema = insertInvoiceSchema.extend({
  lineItems: z.array(z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    rate: z.number().min(0, "Rate must be positive"),
    amount: z.number().min(0, "Amount must be positive"),
  })).min(1, "At least one line item is required"),
});

type FormData = z.infer<typeof formSchema>;

interface InvoiceFormProps {
  onPreview: (invoice: InvoiceWithLineItems | null) => void;
}

export function InvoiceForm({ onPreview }: InvoiceFormProps) {
  const [lineItems, setLineItems] = useState<Omit<LineItem, "id" | "invoiceId" | "order">[]>([
    { description: "", quantity: 1, rate: "0", amount: "0" }
  ]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get next invoice number
  const { data: invoiceNumberData } = useQuery<{ number: string }>({
    queryKey: ["/api/invoices/generate/number"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      number: "",
      customerName: "",
      customerEmail: "",
      customerAddress: "",
      eventDate: "",
      eventType: "Corporate Event",
      subtotal: "0",
      taxRate: "0.0825",
      taxAmount: "0",
      total: "0",
      status: "draft",
      notes: "Payment is due within 30 days of invoice date.\nThank you for choosing Elegant Catering Co. for your special event!",
      lineItems: [],
    },
  });

  // Update invoice number when data is loaded
  useEffect(() => {
    if (invoiceNumberData?.number) {
      form.setValue("number", invoiceNumberData.number);
    }
  }, [invoiceNumberData, form]);

  // Calculate totals when line items change
  useEffect(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const taxRate = parseFloat(form.getValues("taxRate") || "0");
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    form.setValue("subtotal", subtotal.toFixed(2));
    form.setValue("taxAmount", taxAmount.toFixed(2));
    form.setValue("total", total.toFixed(2));
    form.setValue("lineItems", lineItems.map(item => ({
      description: item.description,
      quantity: item.quantity,
      rate: parseFloat(item.rate),
      amount: parseFloat(item.amount)
    })));

    // Update preview
    const formData = form.getValues();
    const previewInvoice: InvoiceWithLineItems = {
      id: "preview",
      ...formData,
      customerId: formData.customerId || null,
      status: formData.status || "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
      lineItems: lineItems.map((item, index) => ({
        id: `preview-${index}`,
        invoiceId: "preview",
        order: index,
        ...item,
      })),
    };
    onPreview(previewInvoice);
  }, [lineItems, form, onPreview]);

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/invoices", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      // Reset form
      form.reset();
      setLineItems([{ description: "", quantity: 1, rate: "0", amount: "0" }]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createInvoiceMutation.mutate(data);
  };

  const handleExportPDF = async () => {
    const formData = form.getValues();
    const invoiceData: InvoiceWithLineItems = {
      id: "export",
      ...formData,
      customerId: formData.customerId || null,
      status: formData.status || "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
      lineItems: lineItems.map((item, index) => ({
        id: `export-${index}`,
        invoiceId: "export",
        order: index,
        ...item,
      })),
    };
    await generatePDF(invoiceData);
  };

  return (
    <Card data-testid="card-invoice-form">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold text-gray-900">Create Invoice</CardTitle>
        <span className="text-sm text-gray-500" data-testid="text-invoice-number">
          Invoice #{form.watch("number")}
        </span>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter customer name" 
                          {...field} 
                          data-testid="input-customer-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="customer@email.com" 
                          {...field} 
                          data-testid="input-customer-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="customerAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing Address</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter billing address" 
                            rows={3} 
                            {...field} 
                            data-testid="textarea-customer-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="eventDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={field.value || ""}
                          data-testid="input-event-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || "Corporate Event"}>
                        <FormControl>
                          <SelectTrigger data-testid="select-event-type">
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Corporate Event">Corporate Event</SelectItem>
                          <SelectItem value="Wedding">Wedding</SelectItem>
                          <SelectItem value="Birthday Party">Birthday Party</SelectItem>
                          <SelectItem value="Conference">Conference</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Line Items */}
            <LineItemTable 
              lineItems={lineItems} 
              onChange={setLineItems} 
              data-testid="line-item-table"
            />

            {/* Totals */}
            <div className="p-4 bg-gray-50 rounded-lg" data-testid="totals-section">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="text-sm font-medium" data-testid="text-subtotal-amount">
                  ${form.watch("subtotal")}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  Tax ({(parseFloat(form.watch("taxRate") || "0") * 100).toFixed(2)}%):
                </span>
                <span className="text-sm font-medium" data-testid="text-tax-amount">
                  ${form.watch("taxAmount")}
                </span>
              </div>
              <div className="flex justify-between items-center text-lg font-semibold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span data-testid="text-total-amount">${form.watch("total")}</span>
              </div>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes..." 
                      rows={4} 
                      {...field} 
                      value={field.value || ""}
                      data-testid="textarea-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                type="submit" 
                className="flex-1 bg-primary text-white hover:bg-blue-600"
                disabled={createInvoiceMutation.isPending}
                data-testid="button-save-invoice"
              >
                <Save className="mr-2 h-4 w-4" />
                {createInvoiceMutation.isPending ? "Saving..." : "Save Invoice"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={handleExportPDF}
                data-testid="button-export-pdf"
              >
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
