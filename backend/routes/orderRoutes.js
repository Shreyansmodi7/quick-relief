import express from 'express';
import {
  addOrderItems,
  getOrderById,
  updateOrderStatus,
  getMyOrders,
  getPharmacistOrders,
  getOrders,
  getAvailableDeliveries,
  getMyDeliveries,
  acceptDelivery,
  markAsDelivered,
  cancelOrder
} from '../controllers/orderController.js';
import { protect, admin, pharmacist, delivery } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, admin, getOrders);

router.route('/myorders').get(protect, getMyOrders);
router.route('/pharmacist').get(protect, pharmacist, getPharmacistOrders);

// Delivery routes must come before /:id
router.route('/deliveries/available').get(protect, delivery, getAvailableDeliveries);
router.route('/deliveries/my-deliveries').get(protect, delivery, getMyDeliveries);

router.route('/:id').get(protect, getOrderById);
router.route('/:id/status').put(protect, updateOrderStatus); // Should be pharmacist or admin in real world
router.route('/:id/cancel').put(protect, cancelOrder);

router.route('/:id/accept-delivery').put(protect, delivery, acceptDelivery);
router.route('/:id/deliver').put(protect, delivery, markAsDelivered);

export default router;
