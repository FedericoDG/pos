import { DateTime } from 'luxon';

const now = DateTime.now();

export const clients = [
  {
    name: 'Consumidor',
    lastname: 'Final',
    document: '00000000',
    email: 'consumidorfinal@gmail.com',
    password: '$2a$10$ZM6gFPu6tMAU4wr79TFDn.2IZbon0i/iGeNygxtGxdnVqEz1jkr4q',
    phone: '',
    mobile: '',
    address: '',
    info: '',
    createdAt: now.plus({ minutes: 1 }).toString(),
    updatedAt: now.plus({ minutes: 1 }).toString(),
  },
];
