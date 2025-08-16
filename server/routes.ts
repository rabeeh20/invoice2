import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInvoiceSchema, updateInvoiceSchema, insertLineItemSchema, insertCustomerSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Customers
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customer = insertCustomerSchema.parse(req.body);
      const created = await storage.createCustomer(customer);
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create customer" });
      }
    }
  });

  // Invoices
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        res.status(404).json({ message: "Invoice not found" });
        return;
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const { lineItems, ...invoiceData } = req.body;
      
      // Generate invoice number if not provided
      if (!invoiceData.number) {
        invoiceData.number = await storage.generateInvoiceNumber();
      }
      
      const invoice = insertInvoiceSchema.parse(invoiceData);
      const created = await storage.createInvoice(invoice);
      
      // Create line items if provided
      if (lineItems && Array.isArray(lineItems)) {
        for (let i = 0; i < lineItems.length; i++) {
          const lineItem = insertLineItemSchema.parse({
            ...lineItems[i],
            invoiceId: created.id,
            order: i,
          });
          await storage.createLineItem(lineItem);
        }
      }
      
      // Return the complete invoice with line items
      const completeInvoice = await storage.getInvoice(created.id);
      res.status(201).json(completeInvoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create invoice" });
      }
    }
  });

  app.put("/api/invoices/:id", async (req, res) => {
    try {
      const { lineItems, ...invoiceData } = req.body;
      
      const invoice = updateInvoiceSchema.parse(invoiceData);
      const updated = await storage.updateInvoice(req.params.id, invoice);
      
      if (!updated) {
        res.status(404).json({ message: "Invoice not found" });
        return;
      }
      
      // Update line items if provided
      if (lineItems && Array.isArray(lineItems)) {
        // Delete existing line items
        await storage.deleteLineItemsByInvoiceId(req.params.id);
        
        // Create new line items
        for (let i = 0; i < lineItems.length; i++) {
          const lineItem = insertLineItemSchema.parse({
            ...lineItems[i],
            invoiceId: req.params.id,
            order: i,
          });
          await storage.createLineItem(lineItem);
        }
      }
      
      // Return the complete invoice with line items
      const completeInvoice = await storage.getInvoice(req.params.id);
      res.json(completeInvoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update invoice" });
      }
    }
  });

  app.delete("/api/invoices/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteInvoice(req.params.id);
      if (!deleted) {
        res.status(404).json({ message: "Invoice not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });

  // Generate invoice number
  app.get("/api/invoices/generate/number", async (req, res) => {
    try {
      const number = await storage.generateInvoiceNumber();
      res.json({ number });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate invoice number" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
