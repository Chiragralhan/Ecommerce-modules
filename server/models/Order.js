import mongoose from 'mongoose';
import { generateId } from '../utils/idGenerator.js';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    productId: {
      type: String,
      required: [true, 'Product ID is required'],
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be an integer',
      },
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative'],
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      trim: true,
      default: () => generateId('ORD'),
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, 'Customer email is required'],
      trim: true,
      lowercase: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: 'An order must contain at least one item',
      },
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    orderStatus: {
      type: String,
      enum: {
        values: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
        message: '{VALUE} is not a valid order status',
      },
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for searching and sorting orders
orderSchema.index({ customerName: 'text', customerEmail: 'text', customerPhone: 'text', orderId: 'text' });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ orderDate: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
