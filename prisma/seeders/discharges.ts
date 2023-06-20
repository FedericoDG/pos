import { DateTime } from 'luxon';

const now = DateTime.now();

export const discharges = [
  {
    productId: 1,
    warehouseId: 1,
    reasonId: 2,
    quantity: 12,
    info: 'Entraron a Robar',
    createdAt: now.plus({ minutes: 1 }).toString(),
    updatedAt: now.plus({ minutes: 1 }).toString(),
  },
];
