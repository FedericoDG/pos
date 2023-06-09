import { Router } from 'express';

import auth from './auth.route';
import user from './user.route';
import role from './role.route';
import unit from './unit.route';
import category from './category.route';
import product from './product.route';
import warehouse from './warehouse.route';
import pricelist from './pricelist.route';
import supplier from './supplier.route';
import client from './client.route';
import price from './price.route';
import purchase from './purchase.route';
import stock from './stock.route';
import discharge from './discharge.route';
import reason from './reason.route';
import transfer from './transfer.route';
import cost from './cost.route';
import cashRegister from './cashRegister.route';
import cashMovement from './cashMovement.route';
import paymentMethods from './paymentMethod.route';

const router = Router();

router.use('/auth', auth);
router.use('/users', user);
router.use('/roles', role);
router.use('/units', unit);
router.use('/categories', category);
router.use('/products', product);
router.use('/warehouses', warehouse);
router.use('/pricelists', pricelist);
router.use('/suppliers', supplier);
router.use('/clients', client);
router.use('/prices', price);
router.use('/purchases', purchase);
router.use('/stocks', stock);
router.use('/discharges', discharge);
router.use('/reasons', reason);
router.use('/transfers', transfer);
router.use('/costs', cost);
router.use('/cashregisters', cashRegister);
router.use('/cashmovements', cashMovement);
router.use('/paymentmethods', paymentMethods);

export default router;
