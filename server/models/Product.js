import mongoose from 'mongoose';
import { generateId } from '../utils/idGenerator.js';

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      unique: true,
      trim: true,
      default: () => generateId('PROD'),
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be greater than or equal to 0'],
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock quantity cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Stock quantity must be an integer',
      },
    },
    reorderLevel: {
      type: Number,
      required: [true, 'Reorder level is required'],
      min: [0, 'Reorder level cannot be negative'],
      default: 5,
      validate: {
        validator: Number.isInteger,
        message: 'Reorder level must be an integer',
      },
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property to calculate stock status dynamically based on stockQuantity and reorderLevel
productSchema.virtual('stockStatus').get(function () {
  if (this.stockQuantity <= 0) {
    return 'Out of Stock';
  }
  if (this.stockQuantity <= this.reorderLevel) {
    return 'Low Stock';
  }
  return 'In Stock';
});

// Indexes for high performance search and sorting
productSchema.index({ productName: 'text', description: 'text', category: 'text', productId: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ stockQuantity: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
