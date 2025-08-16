# CaterInvoice Pro

## Overview

CaterInvoice Pro is a comprehensive invoice management system designed specifically for catering businesses. The application provides a complete solution for creating, managing, and tracking invoices with features tailored to the catering industry, including event details, line item management, customer information, and PDF generation capabilities.

The system follows a modern full-stack architecture with a React-based frontend and Express.js backend, utilizing PostgreSQL for data persistence through Drizzle ORM. The application emphasizes user experience with a clean, responsive interface built using shadcn/ui components and Tailwind CSS.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built with React 18 and TypeScript, using Vite as the build tool for optimal development experience and performance. The UI framework is based on shadcn/ui components, providing a consistent design system with Tailwind CSS for styling. State management is handled through TanStack Query (React Query) for server state and React Hook Form for form validation.

The routing system uses Wouter for lightweight client-side navigation, with pages organized into distinct views for home (invoice creation), invoice listing, and individual invoice viewing. The component architecture follows a modular approach with reusable UI components and business logic components separated for maintainability.

### Backend Architecture
The server runs on Express.js with TypeScript, implementing a RESTful API architecture. The application uses an abstraction layer for data storage through an IStorage interface, currently implemented with an in-memory storage solution (MemStorage) but designed to easily integrate with database solutions.

The API endpoints follow REST conventions for CRUD operations on customers, invoices, and line items. Error handling is centralized through Express middleware, and the server includes request logging for API endpoints.

### Data Storage Solutions
The application is configured to use PostgreSQL as the primary database with Drizzle ORM for type-safe database interactions. The schema includes three main entities: customers, invoices, and line_items, with proper foreign key relationships and constraints.

Currently, the system includes both database configuration (for PostgreSQL via Neon Database) and an in-memory storage implementation, allowing for flexible deployment scenarios. The Drizzle configuration supports migrations and schema management through the drizzle-kit CLI.

### Authentication and Authorization
The current implementation does not include authentication mechanisms, suggesting the application is designed for single-user or internal use scenarios. Session management dependencies are included (connect-pg-simple) but not actively implemented, indicating future authentication features may be planned.

### External Service Integrations
The application integrates with Neon Database as the PostgreSQL hosting service, utilizing the @neondatabase/serverless driver for database connectivity. PDF generation is handled client-side using jsPDF library, allowing users to download professional invoice documents.

The build system includes Replit-specific configurations for development environment support, including error overlays and development banners for the Replit platform.

### Form Management and Validation
Form handling is implemented using React Hook Form with Zod for schema validation, ensuring type safety throughout the application. The system uses drizzle-zod for automatic schema generation from database models, maintaining consistency between database constraints and frontend validation.

### Development and Build Process
The development environment uses Vite for fast hot-reload development, with separate build processes for client and server code. The server builds using esbuild for optimal Node.js deployment, while the client builds through Vite for web optimization.

The application supports both development and production modes, with environment-specific configurations for database connections and asset serving.