import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Utensils, List, Users, Plus } from "lucide-react";

export function Header() {
  const [location] = useLocation();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200" data-testid="header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Utensils className="text-primary text-2xl mr-3" data-testid="logo-icon" />
            <Link href="/" data-testid="link-home">
              <h1 className="text-2xl font-bold text-gray-900">CaterInvoice Pro</h1>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/invoices" data-testid="link-invoices">
              <Button 
                variant={location === "/invoices" ? "default" : "ghost"} 
                className="text-gray-500 hover:text-gray-700 px-3 py-2"
                data-testid="button-all-invoices"
              >
                <List className="mr-2 h-4 w-4" />
                All Invoices
              </Button>
            </Link>
            <Link href="/" data-testid="link-new-invoice">
              <Button 
                className="bg-primary text-white px-4 py-2 hover:bg-blue-600"
                data-testid="button-new-invoice"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Invoice
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
