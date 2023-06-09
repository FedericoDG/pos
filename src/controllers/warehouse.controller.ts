import { NextFunction, Response, Request } from 'express';
import { PrismaClient } from '@prisma/client';
import createHttpError from 'http-errors';

import { asyncHandler } from '../helpers/asyncHandler';
import { endpointResponse } from '../helpers/endpointResponse';

import { CreateWarehouseType, UpdateWarehouseType } from '../schemas/warehouse.schema';

const prisma = new PrismaClient();

export const getAll = asyncHandler(
  async (req: Request<unknown, unknown, unknown, { nostock?: string }>, res: Response, next: NextFunction) => {
    try {
      const { nostock } = req.query;

      if (nostock) {
        const warehouses = await prisma.warehouses.findMany({
          orderBy: [
            {
              id: 'asc', // OJO
            },
          ],
        });

        return endpointResponse({
          res,
          code: 200,
          status: true,
          message: 'Depósitos/Almacenes recuperados',
          body: {
            warehouses,
          },
        });
      }
      const warehouses = await prisma.warehouses.findMany({
        orderBy: [
          {
            id: 'asc',
          },
        ],
        include: {
          stocks: {
            include: {
              products: true,
            },
          },
        },
      });

      endpointResponse({
        res,
        code: 200,
        status: true,
        message: 'Depósitos/Almacenes recuperados',
        body: {
          warehouses,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        const httpError = createHttpError(500, `[Warehouse - GET ALL]: ${error.message}`);
        next(httpError);
      }
    }
  },
);

export const getById = asyncHandler(
  async (req: Request<{ id?: number }, unknown, unknown>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const warehouse = await prisma.warehouses.findFirst({
        where: { id: Number(id) },
        include: {
          stocks: {
            include: {
              products: true,
            },
          },
        },
      });

      endpointResponse({
        res,
        code: 200,
        status: true,
        message: 'Depósito/Almacén recuperado',
        body: {
          warehouse,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        const httpError = createHttpError(500, `[Warehouse - GET ONE]: ${error.message}`);
        next(httpError);
      }
    }
  },
);

export const create = asyncHandler(
  async (req: Request<unknown, unknown, CreateWarehouseType>, res: Response, next: NextFunction) => {
    try {
      const data = req.body;

      const warehouse = await prisma.warehouses.create({ data });

      const productsIds = await prisma.products.findMany({ select: { id: true } });

      const stocks = productsIds.map((el) => ({
        productId: el.id,
        warehouseId: 3,
        stock: 0,
        prevstock: 0,
        prevdate: new Date(),
      }));

      await prisma.stocks.createMany({ data: stocks });

      endpointResponse({
        res,
        code: 200,
        status: true,
        message: 'Depósito/Almacén creado',
        body: {
          warehouse,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        const httpError = createHttpError(500, `[Warehouse - CREATE]: ${error.message}`);
        next(httpError);
      }
    }
  },
);

export const update = asyncHandler(
  async (req: Request<{ id?: number }, unknown, UpdateWarehouseType>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { address, description } = req.body;

      const warehouse = await prisma.warehouses.update({
        where: { id: Number(id) },
        data: { address, description },
      });

      endpointResponse({
        res,
        code: 200,
        status: true,
        message: 'Depósito/Almacén actualizado',
        body: {
          warehouse,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        const httpError = createHttpError(500, `[Warehouse - UPDATE]: ${error.message}`);
        next(httpError);
      }
    }
  },
);

export const remove = asyncHandler(
  async (req: Request<{ id?: number }, unknown, unknown>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const warehouse = await prisma.warehouses.delete({
        where: { id: Number(id) },
      });

      endpointResponse({
        res,
        code: 200,
        status: true,
        message: 'Depósito/Almacén eliminado',
        body: {
          warehouse,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        const httpError = createHttpError(500, `[Warehouse - DELETE]: ${error.message}`);
        next(httpError);
      }
    }
  },
);
