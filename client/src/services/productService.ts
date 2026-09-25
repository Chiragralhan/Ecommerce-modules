import api from './api';
import { Product, CreateProductDTO, UpdateProductDTO, ProductFilterParams } from '../types/product';

export const getProducts = async (params?: ProductFilterParams): Promise<Product[]> => {
  const response = await api.get<{ success: boolean; data: Product[] }>('/products', { params });
  return response.data.data;
};

export const getProductById = async (id: string): Promise<Product> => {
  const response = await api.get<{ success: boolean; data: Product }>(`/products/${id}`);
  return response.data.data;
};

export const createProduct = async (productData: CreateProductDTO): Promise<Product> => {
  const response = await api.post<{ success: boolean; data: Product }>('/products', productData);
  return response.data.data;
};

export const updateProduct = async (id: string, productData: UpdateProductDTO): Promise<Product> => {
  const response = await api.put<{ success: boolean; data: Product }>(`/products/${id}`, productData);
  return response.data.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};

export const getProductCategories = async (): Promise<string[]> => {
  const response = await api.get<{ success: boolean; data: string[] }>('/products/categories');
  return response.data.data;
};
