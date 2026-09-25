import Order from '../models/Order.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

/**
 * @desc    Create a new order with stock validation and inventory deduction
 * @route   POST /api/orders
 */
export const createOrder = async (req, res, next) => {
  const deductedProducts = []; // Used for rollback if order creation fails

  try {
    const { customerName, customerEmail, customerPhone, items } = req.body;

    // Validate customer inputs
    if (!customerName || !customerEmail || !customerPhone) {
      res.status(400);
      throw new Error('Customer name, email, and phone number are required');
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400);
      throw new Error('Order must contain at least one product item');
    }

    // 1. Check whether every requested product exists and has sufficient stock
    const validatedItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      const { product: prodRef, productId, quantity } = item;
      const requestedQty = Number(quantity);

      if (!requestedQty || isNaN(requestedQty) || requestedQty <= 0 || !Number.isInteger(requestedQty)) {
        res.status(400);
        throw new Error(`Quantity for item must be a positive integer`);
      }

      // Lookup product by Mongo _id or productId string
      let product = null;
      if (prodRef && mongoose.Types.ObjectId.isValid(prodRef)) {
        product = await Product.findById(prodRef);
      }
      if (!product && (productId || prodRef)) {
        product = await Product.findOne({ productId: productId || prodRef });
      }

      if (!product) {
        res.status(404);
        throw new Error(`Product not found: "${productId || prodRef}"`);
      }

      // Check stock availability
      if (product.stockQuantity < requestedQty) {
        res.status(400);
        throw new Error(
          `Insufficient stock for product "${product.productName}" (ID: ${product.productId}). Available: ${product.stockQuantity}, Requested: ${requestedQty}`
        );
      }

      const itemPrice = product.price;
      const subtotal = Number((itemPrice * requestedQty).toFixed(2));
      calculatedTotal = Number((calculatedTotal + subtotal).toFixed(2));

      validatedItems.push({
        productDoc: product,
        orderItemData: {
          product: product._id,
          productId: product.productId,
          productName: product.productName,
          quantity: requestedQty,
          price: itemPrice,
          subtotal,
        },
      });
    }

    // 2. Reduce the corresponding product stock atomically
    for (const { productDoc, orderItemData } of validatedItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: productDoc._id,
          stockQuantity: { $gte: orderItemData.quantity },
        },
        {
          $inc: { stockQuantity: -orderItemData.quantity },
        },
        { new: true }
      );

      if (!updatedProduct) {
        // Stock changed concurrently between validation and decrement; trigger rollback
        throw new Error(
          `Inventory deduction failed for "${orderItemData.productName}". Stock may have been modified concurrently.`
        );
      }

      deductedProducts.push({
        productId: productDoc._id,
        quantity: orderItemData.quantity,
      });
    }

    // 3. Create and save the order
    const newOrder = new Order({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone.trim(),
      items: validatedItems.map((vi) => vi.orderItemData),
      totalAmount: calculatedTotal,
      orderStatus: 'Pending',
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully and inventory deducted',
      data: savedOrder,
    });
  } catch (error) {
    // If order creation failed after some products had stock deducted, roll back the deductions
    if (deductedProducts.length > 0) {
      console.warn('[Order] Rolling back deducted inventory due to order creation failure...');
      for (const item of deductedProducts) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stockQuantity: item.quantity },
        }).catch((err) => {
          console.error(`[Order Rollback Error] Failed to restore stock for ${item.productId}:`, err);
        });
      }
    }
    next(error);
  }
};

/**
 * @desc    Get all orders with optional search and status filter
 * @route   GET /api/orders
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const { q, search, status, sortBy = 'orderDate', order = 'desc' } = req.query;

    const queryConditions = {};

    const searchTerm = q || search;
    if (searchTerm && searchTerm.trim() !== '') {
      const regex = new RegExp(searchTerm.trim(), 'i');
      queryConditions.$or = [
        { customerName: regex },
        { customerEmail: regex },
        { customerPhone: regex },
        { orderId: regex },
      ];
    }

    if (status && status !== 'All') {
      queryConditions.orderStatus = status;
    }

    const sortDirection = order.toLowerCase() === 'asc' ? 1 : -1;
    const sortField = sortBy === 'totalAmount' ? 'totalAmount' : 'orderDate';

    const orders = await Order.find(queryConditions)
      .populate('items.product', 'productId productName category imageUrl')
      .sort({ [sortField]: sortDirection });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get individual order details by Mongo ID or orderId
 * @route   GET /api/orders/:id
 */
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let order = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id).populate('items.product', 'productId productName category imageUrl');
    }

    if (!order) {
      order = await Order.findOne({ orderId: id }).populate('items.product', 'productId productName category imageUrl');
    }

    if (!order) {
      res.status(404);
      throw new Error(`Order not found with identifier: ${id}`);
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status
 * @route   PATCH /api/orders/:id/status
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400);
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    let order = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    }
    if (!order) {
      order = await Order.findOne({ orderId: id });
    }

    if (!order) {
      res.status(404);
      throw new Error(`Order not found with identifier: ${id}`);
    }

    // If order is already Cancelled, forbid changing status
    if (order.orderStatus === 'Cancelled') {
      res.status(400);
      throw new Error('Cancelled orders cannot be updated to another status');
    }

    // If changing to Cancelled, invoke cancellation logic to restore inventory
    if (status === 'Cancelled') {
      return await cancelOrderLogic(order, res);
    }

    order.orderStatus = status;
    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel an order and restore stock into inventory
 * @route   POST /api/orders/:id/cancel
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    let order = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    }
    if (!order) {
      order = await Order.findOne({ orderId: id });
    }

    if (!order) {
      res.status(404);
      throw new Error(`Order not found with identifier: ${id}`);
    }

    if (order.orderStatus === 'Cancelled') {
      res.status(400);
      throw new Error('This order has already been cancelled');
    }

    if (order.orderStatus === 'Delivered') {
      res.status(400);
      throw new Error('Delivered orders cannot be cancelled');
    }

    await cancelOrderLogic(order, res);
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to handle cancellation and stock restoration safely
 */
const cancelOrderLogic = async (order, res) => {
  order.orderStatus = 'Cancelled';
  const savedOrder = await order.save();

  // Restore inventory for each item
  const restorationResults = [];
  for (const item of order.items) {
    const restoredProduct = await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stockQuantity: item.quantity } },
      { new: true }
    );
    restorationResults.push({
      productId: item.productId,
      restoredQuantity: item.quantity,
      newStock: restoredProduct ? restoredProduct.stockQuantity : 'N/A',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully and stock restored to inventory',
    data: savedOrder,
    restoration: restorationResults,
  });
};

/**
 * @desc    Get dashboard metrics for ERP modules
 * @route   GET /api/orders/metrics
 */
export const getDashboardMetrics = async (req, res, next) => {
  try {
    const [
      totalProducts,
      allProducts,
      totalOrders,
      pendingOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      recentOrders,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.find().select('stockQuantity reorderLevel price'),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'Pending' }),
      Order.countDocuments({ orderStatus: 'Confirmed' }),
      Order.countDocuments({ orderStatus: 'Shipped' }),
      Order.countDocuments({ orderStatus: 'Delivered' }),
      Order.countDocuments({ orderStatus: 'Cancelled' }),
      Order.find().sort({ orderDate: -1 }).limit(5),
    ]);

    let totalStockUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let inStockCount = 0;
    let inventoryValuation = 0;

    for (const p of allProducts) {
      totalStockUnits += p.stockQuantity || 0;
      inventoryValuation += p.price * p.stockQuantity;
      if (p.stockQuantity === 0) {
        outOfStockCount++;
      } else if (p.stockQuantity <= p.reorderLevel) {
        lowStockCount++;
      } else {
        inStockCount++;
      }
    }

    // Calculate revenue from non-cancelled orders
    const nonCancelledOrders = await Order.find({ orderStatus: { $ne: 'Cancelled' } }).select('totalAmount');
    const totalRevenue = nonCancelledOrders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        inventory: {
          totalProducts,
          totalStockUnits,
          inStockCount,
          lowStockCount,
          outOfStockCount,
          inventoryValuation: Number(inventoryValuation.toFixed(2)),
        },
        orders: {
          totalOrders,
          pendingOrders,
          confirmedOrders,
          shippedOrders,
          deliveredOrders,
          cancelledOrders,
          totalRevenue: Number(totalRevenue.toFixed(2)),
          recentOrders,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
