import { MovementType } from '@prisma/client';
import { DateTime } from 'luxon';

const now = DateTime.now();

export const movements = [
  {
    amount: 4103.5,
    type: MovementType.OUT,
    userId: 3,
    createdAt: now.plus({ minutes: 1 }).toString(),
    updatedAt: now.plus({ minutes: 1 }).toString(),
  },
];
