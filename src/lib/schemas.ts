import { z } from 'zod';

export const zoneSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
});

export const scanSchema = z.object({
  ean: z.string().regex(/^\d{8,13}$/, { message: "Enter a valid 8 to 13-digit EAN code." }),
  zoneId: z.string({ required_error: "Please select a zone." }).min(1, { message: "Please select a zone." }),
});
