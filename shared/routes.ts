import { z } from 'zod';
import { insertDischargeSummarySchema, dischargeSummaries } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  discharges: {
    list: {
      method: 'GET' as const,
      path: '/api/discharges' as const,
      responses: {
        200: z.array(z.custom<typeof dischargeSummaries.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/discharges/:id' as const,
      responses: {
        200: z.custom<typeof dischargeSummaries.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: { // This generates AND saves
      method: 'POST' as const,
      path: '/api/discharges' as const,
      input: insertDischargeSummarySchema,
      responses: {
        201: z.custom<typeof dischargeSummaries.$inferSelect>(),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
    // PDF/Word generation will be handled via standard links/blobs, 
    // but we can define the endpoints here for clarity, though they return binary data
    downloadPdf: {
      method: 'GET' as const,
      path: '/api/discharges/:id/pdf' as const,
      responses: {
        200: z.any(), // Binary
        404: errorSchemas.notFound,
      },
    },
    downloadDocx: {
      method: 'GET' as const,
      path: '/api/discharges/:id/docx' as const,
      responses: {
        200: z.any(), // Binary
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
