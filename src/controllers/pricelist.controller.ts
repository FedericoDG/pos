import { NextFunction, Response, Request } from 'express';
import { Categories, PrismaClient, Products, Units } from '@prisma/client';
import createHttpError from 'http-errors';

import { asyncHandler } from '../helpers/asyncHandler';
import { endpointResponse } from '../helpers/endpointResponse';

import { CreatePriceListType, UpdatePriceListType } from 'src/schemas/pricelist.schema';

type ProductExtended = Products & Categories & Units;

const prisma = new PrismaClient();

export const getAll = asyncHandler(
  async (_req: Request<unknown, unknown, unknown>, res: Response, next: NextFunction) => {
    try {
      const pricelists = await prisma.pricelists.findMany({
        orderBy: [
          {
            updatedAt: 'desc',
          },
        ],
      });

      endpointResponse({
        res,
        code: 200,
        status: true,
        message: 'Listas de precio recuperadas',
        body: {
          pricelists,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        const httpError = createHttpError(500, `[PriceLists - GET ALL]: ${error.message}`);
        next(httpError);
      }
    }
  },
);

export const getByIdAndWarehouseId = asyncHandler(
  async (req: Request<{ id?: number; warehouseId?: number }, unknown, unknown>, res: Response, next: NextFunction) => {
    try {
      const { id, warehouseId } = req.params;

      const pricelist = await prisma.pricelists.findFirst({
        where: { id: Number(id) },
        include: {
          prices: {
            include: { products: { include: { units: true, category: true } } },
            orderBy: [{ createdAt: 'desc' }],
          },
        },
      });

      const stocks = await prisma.stocks.findMany({
        where: { warehouseId: Number(warehouseId) },
        include: {
          warehouses: true,
        },
      });

      const reducedObject = pricelist?.prices.reduce((acc, price) => {
        const productId = price.productId;
        if (!acc[productId]) {
          acc[productId] = {
            id: price.products.id,
            code: price.products.code,
            barcode: price.products.barcode,
            name: price.products.name,
            status: price.products.status,
            allownegativestock: price.products.allownegativestock,
            description: price.products.description,
            price: price.price,
            category: {
              id: price.products.category.id,
              name: price.products.category.name,
              description: price.products.category.description,
            },
            units: {
              id: price.products.units.id,
              code: price.products.units.code,
              name: price.products.units.name,
            },
          };
        }
        return acc;
      }, {});

      const products: ProductExtended[] = Object.values(reducedObject!);

      const mergedArray = stocks
        .map((stock) => {
          const productId = stock.productId;
          const existingObj = products.find((obj) => obj.id === productId);

          if (existingObj) {
            return {
              ...existingObj,
              stock: stock.stock,
              warehouses: {
                id: stock.warehouses.id,
                code: stock.warehouses.code,
                description: stock.warehouses.description,
                address: stock.warehouses.address,
              },
            };
          }

          return null;
        })
        .filter((obj) => obj !== null);

      const list = {
        id: pricelist?.id,
        code: pricelist?.code,
        description: pricelist?.description,
        createdAt: pricelist?.createdAt,
        updatedAt: pricelist?.updatedAt,
        products: mergedArray,
      };

      endpointResponse({
        res,
        code: 200,
        status: true,
        message: 'Lista de precio recuperada',
        body: {
          pricelist: list,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        const httpError = createHttpError(500, `[PriceLists - GET ONEdfg]: ${error.message}`);
        next(httpError);
      }
    }
  },
);

export const getByIdWarehouseIdAndProductId = asyncHandler(
  async (
    req: Request<{ id?: number; warehouseId?: number; productId?: number }, unknown, unknown>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id, warehouseId, productId } = req.params;

      const pricelist = await prisma.pricelists.findFirst({
        where: { id: Number(id) },
        include: {
          prices: {
            where: {
              productId: Number(productId),
            },
            include: { products: { include: { units: true, category: true } } },
            orderBy: [{ createdAt: 'desc' }],
          },
        },
      });

      const stocks = await prisma.stocks.findMany({
        where: { warehouseId: Number(warehouseId) },
        include: {
          warehouses: true,
        },
      });

      const reducedObject = pricelist?.prices.reduce((acc, price) => {
        const productId = price.productId;
        if (!acc[productId]) {
          acc[productId] = {
            id: price.products.id,
            code: price.products.code,
            barcode: price.products.barcode,
            name: price.products.name,
            status: price.products.status,
            allownegativestock: price.products.allownegativestock,
            description: price.products.description,
            price: price.price,
            category: {
              id: price.products.category.id,
              name: price.products.category.name,
              description: price.products.category.description,
            },
            units: {
              id: price.products.units.id,
              code: price.products.units.code,
              name: price.products.units.name,
            },
          };
        }
        return acc;
      }, {});

      const products: ProductExtended[] = Object.values(reducedObject!);

      const mergedArray = stocks
        .map((stock) => {
          const productId = stock.productId;
          const existingObj = products.find((obj) => obj.id === productId);

          if (existingObj) {
            return {
              ...existingObj,
              stock: stock.stock,
              warehouses: {
                id: stock.warehouses.id,
                code: stock.warehouses.code,
                description: stock.warehouses.description,
                address: stock.warehouses.address,
              },
            };
          }

          return null;
        })
        .filter((obj) => obj !== null);

      const list = {
        id: pricelist?.id,
        code: pricelist?.code,
        description: pricelist?.description,
        createdAt: pricelist?.createdAt,
        updatedAt: pricelist?.updatedAt,
        product: mergedArray[0],
      };

      endpointResponse({
        res,
        code: 200,
        status: true,
        message: 'Lista de precio recuperada',
        body: {
          pricelist: list,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        const httpError = createHttpError(500, `[PriceLists - GET ONEdfg]: ${error.message}`);
        next(httpError);
      }
    }
  },
);

export const create = asyncHandler(
  async (req: Request<unknown, unknown, CreatePriceListType>, res: Response, next: NextFunction) => {
    try {
      const data = req.body;

      const pricelist = await prisma.pricelists.create({ data });

      endpointResponse({
        res,
        code: 200,
        status: true,
        message: 'Lista de precio creada',
        body: {
          pricelist,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        const httpError = createHttpError(500, `[PriceLists - CREATE]: ${error.message}`);
        next(httpError);
      }
    }
  },
);

export const update = asyncHandler(
  async (req: Request<{ id?: number }, unknown, UpdatePriceListType>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { description } = req.body;

      const pricelist = await prisma.warehouses.update({
        where: { id: Number(id) },
        data: { description },
      });

      endpointResponse({
        res,
        code: 200,
        status: true,
        message: 'Lista de precio actualizada',
        body: {
          pricelist,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        const httpError = createHttpError(500, `[PriceLists - UPDATE]: ${error.message}`);
        next(httpError);
      }
    }
  },
);

export const remove = asyncHandler(
  async (req: Request<{ id?: number }, unknown, unknown>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const pricelist = await prisma.pricelists.delete({
        where: { id: Number(id) },
      });

      endpointResponse({
        res,
        code: 200,
        status: true,
        message: 'Lista de precio eliminada',
        body: {
          pricelist,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        const httpError = createHttpError(500, `[PriceLists - DELETE]: ${error.message}`);
        next(httpError);
      }
    }
  },
);
