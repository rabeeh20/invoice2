import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import type { LineItem } from "@shared/schema";

interface LineItemTableProps {
  lineItems: Omit<LineItem, "id" | "invoiceId" | "order">[];
  onChange: (items: Omit<LineItem, "id" | "invoiceId" | "order">[]) => void;
}

export function LineItemTable({ lineItems, onChange }: LineItemTableProps) {
  const addLineItem = () => {
    onChange([
      ...lineItems,
      { description: "", quantity: 1, rate: "0", amount: "0" }
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      onChange(lineItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (index: number, field: keyof Omit<LineItem, "id" | "invoiceId" | "order">, value: string | number) => {
    const updated = lineItems.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate amount when quantity or rate changes
        if (field === "quantity" || field === "rate") {
          const quantity = field === "quantity" ? Number(value) : updatedItem.quantity;
          const rate = field === "rate" ? Number(value) : Number(updatedItem.rate);
          updatedItem.amount = (quantity * rate).toFixed(2);
        }
        
        return updatedItem;
      }
      return item;
    });
    onChange(updated);
  };

  return (
    <div data-testid="line-item-table">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Invoice Items</h3>
        <Button 
          type="button" 
          onClick={addLineItem} 
          className="bg-primary text-white px-3 py-2 hover:bg-blue-600"
          data-testid="button-add-line-item"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="overflow-hidden border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200" data-testid="table-line-items">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {lineItems.map((item, index) => (
              <tr key={index} data-testid={`line-item-row-${index}`}>
                <td className="px-4 py-3">
                  <Input
                    type="text"
                    placeholder="Menu item or service"
                    value={item.description}
                    onChange={(e) => updateLineItem(index, "description", e.target.value)}
                    className="w-full text-sm"
                    data-testid={`input-description-${index}`}
                  />
                </td>
                <td className="px-4 py-3">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, "quantity", parseInt(e.target.value) || 1)}
                    className="w-16 text-sm"
                    data-testid={`input-quantity-${index}`}
                  />
                </td>
                <td className="px-4 py-3">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.rate}
                    onChange={(e) => updateLineItem(index, "rate", e.target.value)}
                    className="w-20 text-sm"
                    data-testid={`input-rate-${index}`}
                  />
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900" data-testid={`text-amount-${index}`}>
                  ${parseFloat(item.amount).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLineItem(index)}
                    disabled={lineItems.length <= 1}
                    className="text-red-600 hover:text-red-800"
                    data-testid={`button-remove-${index}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
