import express from 'express';
import {
  addOrderItems,
  getOrderById,
  updateOrderStatus,
  getMyOrders,
  getPharmacistOrders,
  getOrders
} from '../controllers/orderController.js';
import { protect, admin, pharmacist } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, admin, getOrders);

router.route('/myorders').get(protect, getMyOrders);
router.route('/pharmacist').get(protect, pharmacist, getPharmacistOrders);

router.route('/:id').get(protect, getOrderById);
router.route('/:id/status').put(protect, updateOrderStatus); // Should be pharmacist or admin in real world

export default router;
