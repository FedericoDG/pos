import { z } from 'zod';

const StatusType = ['ENABLED', 'DISABLED'] as const;

export const createProductSchema = z.object({
  code: z.string().nonempty(),
  barcode: z.string().nonempty(),
  name: z.string().nonempty(),
  description: z.string().optional(),
  status: z.enum(StatusType).optional(),
  allownegativestock: z.enum(StatusType).optional(),
  categoryId: z.number().nonnegative(),
  unitId: z.number().nonnegative(),
  alertlowstock: z.enum(StatusType).optional(),
  lowstock: z.number().nonnegative(),
});

export const updateProductSchema = z.object({
  code: z.string().nonempty(),
  barcode: z.string().nonempty(),
  name: z.string().nonempty().optional(),
  description: z.string().optional(),
  status: z.enum(StatusType).optional(),
  allownegativestock: z.enum(StatusType).optional(),
  categoryId: z.number().nonnegative().optional(),
  unitId: z.number().nonnegative().optional(),
  alertlowstock: z.enum(StatusType).optional(),
  lowstock: z.number().nonnegative(),
});

export type CreateProductType = z.infer<typeof createProductSchema>;

export type UpdateProductType = z.infer<typeof updateProductSchema>;
