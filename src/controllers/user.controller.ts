import { NextFunction, Response, Request } from 'express';
import { PrismaClient } from '@prisma/client';
import createHttpError from 'http-errors';

import { asyncHandler } from '../helpers/asyncHandler';
import { bcHash } from '../helpers/bcrypt';
import { endpointResponse } from '../helpers/endpointResponse';

import { CreateUserType, UpdateUserType, ResetPasswordUserType } from '../schemas/user.schema';

const prisma = new PrismaClient();

export const getAll = asyncHandler(
  async (_req: Request<unknown, unknown, unknown>, res: Response, next: NextFunction) => {
    try {
      const users = await prisma.users.findMany({
        select: { id: true, name: true, lastname: true, email: true, role: true, createdAt: true, updatedAt: true },
      });

      endpointResponse({
        res,
        code: 200,
        status: true,
        message: 'Usuarios recuperados',
        body: {
          users,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        const httpError = createHttpError(500, `[Users - GET ALL]: ${error.message}`);
        next(httpError);
      }
    }
  },
);

export const getById = asyncHandler(
  async (req: Request<{ id?: number }, unknown, unknown>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await prisma.users.findFirst({
        where: { id: Number(id) },
        select: { id: true, name: true, lastname: true, email: true, role: true, createdAt: true, updatedAt: true },
      });

      endpointResponse({
        res,
        code: 200,
        status: true,
        message: 'Usuario recuperado',
        body: {
          user,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        const httpError = createHttpError(500, `[Users - GET ONE]: ${error.message}`);
        next(httpError);
      }
    }
  },
);

export const create = asyncHandler(
  async (req: Request<unknown, unknown, CreateUserType>, res: Response, next: NextFunction) => {
    try {
      const { password, roleId, ...rest } = req.body;
      const hashedPassword = await bcHash(password);

      const data: CreateUserType = {
        ...rest,
        password: hashedPassword,
      };

      if (roleId) {
        data.roleId = Number(roleId);
      }

      const user = await prisma.users.create({
        data,
      });

      endpointResponse({
        res,
        code: 200,
        status: true,
        message: 'Usuario creado',
        body: {
          user,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        const httpError = createHttpError(500, `[Users - CREATE]: ${error.message}`);
        next(httpError);
      }
    }
  },
);

export const update = asyncHandler(
  async (req: Request<{ id?: number }, unknown, UpdateUserType>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { password, roleId, ...rest } = req.body;
      delete rest.email;

      const data: UpdateUserType = {
        ...rest,
      };

      if (password) {
        const hashedPassword = await bcHash(password);
        data.password = hashedPassword;
      }

      if (roleId) {
        data.roleId = Number(roleId);
      }

      const user = await prisma.users.update({
        where: { id: Number(id) },
        data,
      });

      endpointResponse({
        res,
        code: 200,
        status: true,
        message: 'Usuario actualizado',
        body: {
          user,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        const httpError = createHttpError(500, `[Users - UPDATE]: ${error.message}`);
        next(httpError);
      }
    }
  },
);

export const resetPassword = asyncHandler(
  async (req: Request<{ id?: number }, unknown, ResetPasswordUserType>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { password } = req.body;

      const hashedPassword = await bcHash(password);

      const user = await prisma.users.update({
        where: { id: Number(id) },
        data: { password: hashedPassword },
      });

      endpointResponse({
        res,
        code: 200,
        status: true,
        message: 'Usuario actualizado',
        body: {
          user,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        const httpError = createHttpError(500, `[Users - UPDATE]: ${error.message}`);
        next(httpError);
      }
    }
  },
);

export const remove = asyncHandler(
  async (req: Request<{ id?: number }, unknown, unknown>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await prisma.users.delete({
        where: { id: Number(id) },
      });

      endpointResponse({
        res,
        code: 200,
        status: true,
        message: 'Usuario eliminado',
        body: {
          user,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        const httpError = createHttpError(500, `[Users - DELETE]: ${error.message}`);
        next(httpError);
      }
    }
  },
);
