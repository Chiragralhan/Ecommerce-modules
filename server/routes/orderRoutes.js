import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getDashboardMetrics,
} from '../controllers/orderController.js';

const router = express.Router();

router.route('/')
  .get(getAllOrders)
  .post(createOrder);

router.route('/metrics')
  .get(getDashboardMetrics);

router.route('/:id')
  .get(getOrderById);

router.route('/:id/status')
  .patch(updateOrderStatus);

router.route('/:id/cancel')
  .post(cancelOrder);

export default router;
