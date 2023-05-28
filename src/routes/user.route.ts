import { Router } from 'express';

const user = Router();

// Controller
import { create, getAll, getById, remove, update } from '../controllers/user.controller';

// Middlewares
import { accessLevel, validToken } from '../middlewares/auth.middleware';
import { isEmailAlreadyInUse } from '../middlewares/isEmailAlreadyInUse';
import { schemaValidator } from '../middlewares/schemaValidator.middleware';

// Schema
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';

// Routes
user.get('/', [validToken, accessLevel('ADMIN')], getAll);
user.get('/:id', [validToken, accessLevel('ADMIN')], getById);
user.post(
  '/',
  [validToken, accessLevel('ADMIN'), schemaValidator(createUserSchema), isEmailAlreadyInUse('user')],
  create,
);
user.put('/:id', [validToken, accessLevel('ADMIN'), schemaValidator(updateUserSchema)], update);
user.delete('/:id', [validToken, accessLevel('ADMIN')], remove);

export default user;
