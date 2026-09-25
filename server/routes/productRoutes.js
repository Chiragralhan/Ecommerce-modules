import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getCategories,
} from '../controllers/productController.js';

const router = express.Router();

router.route('/')
  .get(getAllProducts)
  .post(createProduct);

router.route('/categories')
  .get(getCategories);

router.route('/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

export default router;
