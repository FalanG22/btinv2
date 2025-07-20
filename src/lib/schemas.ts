import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  password: z.string().optional(),
  companyId: z.string().min(1, { message: "Por favor, selecciona una empresa." }),
  role: z.enum(['admin', 'user'], { required_error: "Por favor, selecciona un rol." }),
});

export const zoneSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres." }),
});

export const zoneBuilderSchema = z.object({
    streetPrefix: z.string().min(1, { message: "El prefijo es obligatorio."}).max(3, { message: "El prefijo es demasiado largo."}),
    streetFrom: z.number().min(1, { message: "Debe ser al menos 1."}),
    streetTo: z.number().min(1, { message: "Debe ser al menos 1."}),
    rackPrefix: z.string().min(1, { message: "El prefijo es obligatorio."}).max(3, { message: "El prefijo es demasiado largo."}),
    rackFrom: z.number().min(1, { message: "Debe ser al menos 1."}),
    rackTo: z.number().min(1, { message: "Debe ser al menos 1."}),
}).refine(data => data.streetTo >= data.streetFrom, {
    message: "El valor 'Hasta' de la calle debe ser mayor o igual que 'Desde'.",
    path: ["streetTo"],
}).refine(data => data.rackTo >= data.rackFrom, {
    message: "El valor 'Hasta' de la estantería debe ser mayor o igual que 'Desde'.",
    path: ["rackTo"],
});

export const scanSchema = z.object({
  ean: z.string().min(1, { message: "El código no puede estar vacío." }), // Used for EAN or Serial
  zoneId: z.string({ required_error: "Por favor, selecciona una zona." }).min(1, { message: "Por favor, selecciona una zona." }),
  countNumber: z.number({ required_error: "Por favor, selecciona un conteo." }).min(1).max(3),
});

export const serialScanSchema = z.object({
    serial: z.string().min(1, { message: "El número de serie no puede estar vacío." }),
    zoneId: z.string({ required_error: "Por favor, selecciona una zona." }).min(1, { message: "Por favor, selecciona una zona." }),
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

const productCsvSchema = z.object({
    code: z.string().min(1),
    sku: z.string().min(1),
    description: z.string().min(1),
});

export const productsCsvSchema = z.array(productCsvSchema);
