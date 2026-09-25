import Product from '../models/Product.js';
import mongoose from 'mongoose';

/**
 * @desc    Create a new product
 * @route   POST /api/products
 */
export const createProduct = async (req, res, next) => {
  try {
    const {
      productId,
      productName,
      category,
      description,
      price,
      stockQuantity,
      reorderLevel,
      imageUrl,
    } = req.body;

    // Validation checks
    if (!productName || !category || price === undefined || stockQuantity === undefined) {
      res.status(400);
      throw new Error('Please provide all required fields: productName, category, price, stockQuantity');
    }

    const numPrice = Number(price);
    const numStock = Number(stockQuantity);
    const numReorder = reorderLevel !== undefined ? Number(reorderLevel) : 5;

    if (isNaN(numPrice) || numPrice < 0) {
      res.status(400);
      throw new Error('Price must be a valid number greater than or equal to 0');
    }

    if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
      res.status(400);
      throw new Error('Stock quantity must be a non-negative integer');
    }

    if (isNaN(numReorder) || numReorder < 0 || !Number.isInteger(numReorder)) {
      res.status(400);
      throw new Error('Reorder level must be a non-negative integer');
    }

    const product = new Product({
      productId,
      productName: productName.trim(),
      category: category.trim(),
      description: description ? description.trim() : '',
      price: numPrice,
      stockQuantity: numStock,
      reorderLevel: numReorder,
      imageUrl: imageUrl ? imageUrl.trim() : '',
    });

    const savedProduct = await product.save();
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: savedProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all products with search, filter, and sorting
 * @route   GET /api/products
 */
export const getAllProducts = async (req, res, next) => {
  try {
    const { q, search, category, sortBy = 'createdAt', order = 'desc', stockStatus } = req.query;

    const queryConditions = {};

    // Search filter across productName, description, category, and productId
    const searchTerm = q || search;
    if (searchTerm && searchTerm.trim() !== '') {
      const regex = new RegExp(searchTerm.trim(), 'i');
      queryConditions.$or = [
        { productName: regex },
        { description: regex },
        { category: regex },
        { productId: regex },
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      queryConditions.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
    }

    // Build sort object
    const sortFieldMap = {
      price: 'price',
      name: 'productName',
      productName: 'productName',
      stock: 'stockQuantity',
      stockQuantity: 'stockQuantity',
      createdAt: 'createdAt',
    };

    const sortField = sortFieldMap[sortBy] || 'createdAt';
    const sortDirection = order.toLowerCase() === 'asc' ? 1 : -1;
    const sortObject = { [sortField]: sortDirection };

    let products = await Product.find(queryConditions).sort(sortObject);

    // Optional stockStatus filter
    if (stockStatus && ['In Stock', 'Low Stock', 'Out of Stock'].includes(stockStatus)) {
      products = products.filter((p) => p.stockStatus === stockStatus);
    }

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by Mongo ID or productId
 * @route   GET /api/products/:id
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let product = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    }

    if (!product) {
      product = await Product.findOne({ productId: id });
    }

    if (!product) {
      res.status(404);
      throw new Error(`Product not found with identifier: ${id}`);
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing product
 * @route   PUT /api/products/:id
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      productName,
      category,
      description,
      price,
      stockQuantity,
      reorderLevel,
      imageUrl,
    } = req.body;

    let product = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    }
    if (!product) {
      product = await Product.findOne({ productId: id });
    }

    if (!product) {
      res.status(404);
      throw new Error(`Product not found with identifier: ${id}`);
    }

    // Validate update fields if provided
    if (productName !== undefined) {
      if (!productName.trim()) {
        res.status(400);
        throw new Error('Product name cannot be empty');
      }
      product.productName = productName.trim();
    }

    if (category !== undefined) {
      if (!category.trim()) {
        res.status(400);
        throw new Error('Category cannot be empty');
      }
      product.category = category.trim();
    }

    if (description !== undefined) {
      product.description = description.trim();
    }

    if (imageUrl !== undefined) {
      product.imageUrl = imageUrl.trim();
    }

    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) {
        res.status(400);
        throw new Error('Price must be greater than or equal to 0');
      }
      product.price = numPrice;
    }

    if (stockQuantity !== undefined) {
      const numStock = Number(stockQuantity);
      if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
        res.status(400);
        throw new Error('Stock quantity must be a non-negative integer');
      }
      product.stockQuantity = numStock;
    }

    if (reorderLevel !== undefined) {
      const numReorder = Number(reorderLevel);
      if (isNaN(numReorder) || numReorder < 0 || !Number.isInteger(numReorder)) {
        res.status(400);
        throw new Error('Reorder level must be a non-negative integer');
      }
      product.reorderLevel = numReorder;
    }

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    let product = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    }
    if (!product) {
      product = await Product.findOne({ productId: id });
    }

    if (!product) {
      res.status(404);
      throw new Error(`Product not found with identifier: ${id}`);
    }

    await Product.deleteOne({ _id: product._id });

    res.status(200).json({
      success: true,
      message: `Product ${product.productId} deleted successfully`,
      data: { productId: product.productId, _id: product._id },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all distinct product categories
 * @route   GET /api/products/categories
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category');
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};
