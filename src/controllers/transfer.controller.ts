import { NextFunction, Response, Request } from 'express';
import { PrismaClient } from '@prisma/client';
import createHttpError from 'http-errors';

import { asyncHandler } from '../helpers/asyncHandler';
import { endpointResponse } from '../helpers/endpointResponse';

import { CreateTransferType } from '../schemas/transfer.schema';

const prisma = new PrismaClient();

export const getAll = asyncHandler(
  async (_req: Request<unknown, unknown, unknown>, res: Response, next: NextFunction) => {
    try {
      const transfers = await prisma.transfer.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              lastname: true,
              email: true,
              roleId: true,
              createdAt: true,
              updatedAt: true,
              role: true,
            },
          },
          warehouseOrigin: true,
          warehouseDestination: true,
          transferDetails: { include: { products: { include: { category: true, unit: true } } } },
        },
      });

      endpointResponse({
        res,
        code: 200,
        status: true,
        message: 'Transferencias entre depósitos recuperadas',
        body: {
          transfers,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        const httpError = createHttpError(500, `[Transfers - GET ALL]: ${error.message}`);
        next(httpError);
      }
    }
  },
);

export const getById = asyncHandler(
  async (req: Request<{ id?: number }, unknown, unknown>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const transfer = await prisma.transfer.findFirst({
        where: { id: Number(id) },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              lastname: true,
              email: true,
              roleId: true,
              createdAt: true,
              updatedAt: true,
              role: true,
            },
          },
          warehouseOrigin: true,
          warehouseDestination: true,
          transferDetails: { include: { products: { include: { category: true, unit: true } } } },
        },
      });

      endpointResponse({
        res,
        code: 200,
        status: true,
        message: 'Transferencia entre depósitos recuperada',
        body: {
          transfer,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        const httpError = createHttpError(500, `[Transfers - GET ONE]: ${error.message}`);
        next(httpError);
      }
    }
  },
);

export const create = asyncHandler(
  async (req: Request<unknown, unknown, CreateTransferType>, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const { id: userId } = req.user;

      const { cart, ...rest } = data;

      // Transfer
      const transfer = await prisma.transfer.create({ data: { ...rest, userId } });

      // Transfer Details
      const cartWithTransferId = cart.map((el) => ({ ...el, transferId: transfer.id }));
      await prisma.transferDetails.createMany({ data: cartWithTransferId });

      // Stock Origin
      const productsIds = cart.map((item) => item.productId);
      const stocksOrigin = await prisma.stocks.findMany({
        where: { productId: { in: productsIds }, warehouseId: rest.warehouseOriginId },
        orderBy: [{ createdAt: 'asc' }],
      });

      const uniqueStocksOrigin = stocksOrigin.reduce((acc: any[], current) => {
        const existingStock = acc.find((stock) => stock.productId === current.productId);

        if (!existingStock) {
          acc.push(current);
        }

        return acc;
      }, []);

      uniqueStocksOrigin.sort((a, b) => a.productId - b.productId);
      cart.sort((a, b) => a.productId - b.productId);

      const newStockOrigin = uniqueStocksOrigin.map((item, idx) => {
        return {
          id: item.id,
          productId: item.productId,
          warehouseId: rest.warehouseOriginId,
          stock: item.stock - cart[idx].quantity,
          prevstock: item.stock,
          prevdate: item.createdAt,
        };
      });

      await Promise.all(
        newStockOrigin.map(
          async (el) =>
            await prisma.stocks.update({
              where: { id: el.id },
              data: { ...el },
            }),
        ),
      );

      // Stock Destination
      const stocksDestination = await prisma.stocks.findMany({
        where: { productId: { in: productsIds }, warehouseId: rest.warehouseDestinationId },
        orderBy: [{ createdAt: 'asc' }],
      });

      const uniqueStocksDestination = stocksDestination.reduce((acc: any[], current) => {
        const existingStock = acc.find((stock) => stock.productId === current.productId);

        if (!existingStock) {
          acc.push(current);
        }

        return acc;
      }, []);

      uniqueStocksDestination.sort((a, b) => a.productId - b.productId);

      const newStockDestination = uniqueStocksDestination.map((item, idx) => {
        return {
          id: item.id,
          productId: item.productId,
          warehouseId: rest.warehouseDestinationId,
          stock: item.stock + cart[idx].quantity,
          prevstock: item.stock,
          prevdate: item.createdAt,
        };
      });

      await Promise.all(
        newStockDestination.map(
          async (el) =>
            await prisma.stocks.update({
              where: { id: el.id },
              data: { ...el },
            }),
        ),
      );

      endpointResponse({
        res,
        code: 200,
        status: true,
        message: 'Compra creada',
        body: {
          transfer,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        const httpError = createHttpError(500, `[Transfers - CREATE]: ${error.message}`);
        next(httpError);
      }
    }
  },
);
