import { z } from 'zod';

export const zoneSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
});

export const scanSchema = z.object({
  ean: z.string().min(1, { message: "El código no puede estar vacío." }), // Used for EAN or Serial
  zoneId: z.string({ required_error: "Please select a zone." }).min(1, { message: "Please select a zone." }),
  countNumber: z.number({ required_error: "Please select a count." }).min(1).max(3),
});

export const serialScanSchema = z.object({
    serial: z.string().min(1, { message: "El número de serie no puede estar vacío." }),
    zoneId: z.string({ required_error: "Please select a zone." }).min(1, { message: "Please select a zone." }),
});

const singleScanForBatchSchema = z.object({
  ean: z.string(),
  zoneId: z.string(),
  countNumber: z.number(),
  scannedAt: z.string().datetime(),
});

export const scanBatchSchema = z.array(singleScanForBatchSchema);

export const serialBatchSchema = z.object({
  serials: z.array(z.string().min(1)),
  zoneId: z.string().min(1),
  countNumber: z.number().min(1).max(3),
});
