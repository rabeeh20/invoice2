import { 
  type Customer, 
  type InsertCustomer,
  type Invoice, 
  type InsertInvoice,
  type UpdateInvoice,
  type LineItem,
  type InsertLineItem,
  type InvoiceWithLineItems
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  
  // Invoices
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: string): Promise<InvoiceWithLineItems | undefined>;
  getInvoiceByNumber(number: string): Promise<InvoiceWithLineItems | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, invoice: UpdateInvoice): Promise<Invoice | undefined>;
  deleteInvoice(id: string): Promise<boolean>;
  
  // Line Items
  getLineItemsByInvoiceId(invoiceId: string): Promise<LineItem[]>;
  createLineItem(lineItem: InsertLineItem): Promise<LineItem>;
  updateLineItem(id: string, lineItem: Partial<InsertLineItem>): Promise<LineItem | undefined>;
  deleteLineItem(id: string): Promise<boolean>;
  deleteLineItemsByInvoiceId(invoiceId: string): Promise<void>;
  
  // Generate invoice number
  generateInvoiceNumber(): Promise<string>;
}

export class MemStorage implements IStorage {
  private customers: Map<string, Customer>;
  private invoices: Map<string, Invoice>;
  private lineItems: Map<string, LineItem>;
  private invoiceCounter: number;

  constructor() {
    this.customers = new Map();
    this.invoices = new Map();
    this.lineItems = new Map();
    this.invoiceCounter = 1;
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = {
      ...insertCustomer,
      id,
      createdAt: new Date(),
    };
    this.customers.set(id, customer);
    return customer;
  }

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getInvoice(id: string): Promise<InvoiceWithLineItems | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;
    
    const lineItems = await this.getLineItemsByInvoiceId(id);
    return { ...invoice, lineItems };
  }

  async getInvoiceByNumber(number: string): Promise<InvoiceWithLineItems | undefined> {
    const invoice = Array.from(this.invoices.values()).find(inv => inv.number === number);
    if (!invoice) return undefined;
    
    const lineItems = await this.getLineItemsByInvoiceId(invoice.id);
    return { ...invoice, lineItems };
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = randomUUID();
    const now = new Date();
    const invoice: Invoice = {
      ...insertInvoice,
      id,
      customerId: insertInvoice.customerId || null,
      eventDate: insertInvoice.eventDate || null,
      eventType: insertInvoice.eventType || null,
      notes: insertInvoice.notes || null,
      status: insertInvoice.status || "draft",
      createdAt: now,
      updatedAt: now,
    };
    this.invoices.set(id, invoice);
    return invoice;
  }

  async updateInvoice(id: string, updateInvoice: UpdateInvoice): Promise<Invoice | undefined> {
    const existing = this.invoices.get(id);
    if (!existing) return undefined;
    
    const updated: Invoice = {
      ...existing,
      ...updateInvoice,
      updatedAt: new Date(),
    };
    this.invoices.set(id, updated);
    return updated;
  }

  async deleteInvoice(id: string): Promise<boolean> {
    const deleted = this.invoices.delete(id);
    if (deleted) {
      await this.deleteLineItemsByInvoiceId(id);
    }
    return deleted;
  }

  // Line Items
  async getLineItemsByInvoiceId(invoiceId: string): Promise<LineItem[]> {
    return Array.from(this.lineItems.values())
      .filter(item => item.invoiceId === invoiceId)
      .sort((a, b) => a.order - b.order);
  }

  async createLineItem(insertLineItem: InsertLineItem): Promise<LineItem> {
    const id = randomUUID();
    const lineItem: LineItem = {
      ...insertLineItem,
      id,
      order: insertLineItem.order || 0,
    };
    this.lineItems.set(id, lineItem);
    return lineItem;
  }

  async updateLineItem(id: string, updateLineItem: Partial<InsertLineItem>): Promise<LineItem | undefined> {
    const existing = this.lineItems.get(id);
    if (!existing) return undefined;
    
    const updated: LineItem = {
      ...existing,
      ...updateLineItem,
    };
    this.lineItems.set(id, updated);
    return updated;
  }

  async deleteLineItem(id: string): Promise<boolean> {
    return this.lineItems.delete(id);
  }

  async deleteLineItemsByInvoiceId(invoiceId: string): Promise<void> {
    const items = Array.from(this.lineItems.entries());
    for (const [id, item] of items) {
      if (item.invoiceId === invoiceId) {
        this.lineItems.delete(id);
      }
    }
  }

  async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const number = String(this.invoiceCounter++).padStart(3, '0');
    return `INV-${year}-${number}`;
  }
}

export const storage = new MemStorage();
