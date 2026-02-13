# ESIC Pediatrics Discharge Summary System

## Overview

This is a medical discharge summary management system built for ESIC (Employee State Insurance Corporation) Medical College's Pediatrics department. The application allows doctors/residents to create patient discharge summaries by filling in clinical details, which are then processed through OpenAI to generate professional formatted summaries. Summaries can be viewed, listed, and downloaded as PDF or DOCX documents.

The core workflow is: fill in patient form → AI generates professional discharge summary → save to database → view/download as PDF or Word document.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (React + Vite)
- **Framework**: React with TypeScript, bundled by Vite
- **Routing**: `wouter` (lightweight client-side router)
- **State Management**: `@tanstack/react-query` for server state (fetching, caching, mutations)
- **Forms**: `react-hook-form` with `@hookform/resolvers` (Zod validation)
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives with Tailwind CSS
- **Animations**: `framer-motion` for tab transitions and page animations
- **Styling**: Tailwind CSS with CSS variables for theming (ESIC blue brand colors)
- **Fonts**: DM Sans (body) and Playfair Display (serif accents)

The frontend lives in `client/src/` with pages at `client/src/pages/`, reusable components at `client/src/components/`, and hooks at `client/src/hooks/`. Path aliases: `@/` maps to `client/src/`, `@shared/` maps to `shared/`.

Key pages:
- `Home.tsx` — Dashboard with stats and discharge summary list
- `NewDischarge.tsx` — Multi-tab form for creating new discharge summaries
- `DischargeDetails.tsx` — View a single summary with download options

### Backend (Express + Node.js)
- **Framework**: Express.js running on Node.js
- **Language**: TypeScript, executed via `tsx` in development
- **Entry point**: `server/index.ts` → creates HTTP server, registers routes, serves static files
- **Routes**: Defined in `server/routes.ts` — REST API for discharge CRUD operations
- **Storage layer**: `server/storage.ts` — `DatabaseStorage` class implementing `IStorage` interface for discharge summaries
- **Build**: Custom build script (`script/build.ts`) using esbuild for server and Vite for client

### Shared Code (`shared/`)
- `shared/schema.ts` — Drizzle ORM table definitions and Zod insert schemas (source of truth for data types)
- `shared/routes.ts` — API route definitions with paths, methods, input/output schemas (used by both client and server)
- `shared/models/chat.ts` — Additional Drizzle tables for conversations/messages (used by Replit integrations)

### Database
- **Database**: PostgreSQL (required, accessed via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-validation bridge
- **Schema management**: `drizzle-kit push` for applying schema changes (no migration files workflow — uses `db:push`)
- **Connection**: `pg` Pool in `server/db.ts`
- **Main table**: `discharge_summaries` — stores all patient details, clinical data, and AI-generated summary text

### AI Integration
- **Provider**: OpenAI API (via Replit AI Integrations environment variables)
- **Environment variables**: `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL`
- **Usage**: When creating a discharge summary, the server sends patient details to OpenAI to generate a professionally formatted medical discharge summary, which is saved alongside the raw input data

### Document Generation
- **PDF**: Generated server-side using `pdfkit` at endpoint `/api/discharges/:id/pdf`
- **DOCX**: Generated server-side using `docx` library at endpoint `/api/discharges/:id/docx`

### API Structure
All API endpoints are prefixed with `/api/`:
- `GET /api/discharges` — List all discharge summaries
- `POST /api/discharges` — Create new summary (triggers AI generation)
- `GET /api/discharges/:id` — Get single summary
- `GET /api/discharges/:id/pdf` — Download PDF
- `GET /api/discharges/:id/docx` — Download DOCX

### Replit Integrations (pre-built utilities)
Located in `server/replit_integrations/` and `client/replit_integrations/`:
- **Chat**: Conversation storage and chat routes
- **Audio**: Voice recording, playback, and streaming utilities
- **Image**: Image generation via OpenAI
- **Batch**: Batch processing with rate limiting and retries

These are available but not all are actively used by the main application.

### Development vs Production
- **Dev**: `tsx server/index.ts` with Vite dev server middleware (HMR enabled)
- **Prod**: Vite builds client to `dist/public/`, esbuild bundles server to `dist/index.cjs`, Express serves static files

## External Dependencies

### Required Services
- **PostgreSQL Database**: Must be provisioned and `DATABASE_URL` environment variable set
- **OpenAI API**: Required for AI-powered summary generation. Uses Replit AI Integrations env vars:
  - `AI_INTEGRATIONS_OPENAI_API_KEY`
  - `AI_INTEGRATIONS_OPENAI_BASE_URL`

### Key NPM Packages
- **Server**: express, drizzle-orm, pg, openai, pdfkit, docx
- **Client**: react, wouter, @tanstack/react-query, react-hook-form, framer-motion, date-fns
- **UI**: shadcn/ui components (Radix UI + Tailwind CSS + class-variance-authority)
- **Shared**: zod, drizzle-zod