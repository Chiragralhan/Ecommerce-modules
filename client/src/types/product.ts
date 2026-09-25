export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface Product {
  _id: string;
  productId: string;
  productName: string;
  category: string;
  description?: string;
  price: number;
  stockQuantity: number;
  reorderLevel: number;
  imageUrl?: string;
  stockStatus: StockStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDTO {
  productId?: string;
  productName: string;
  category: string;
  description?: string;
  price: number;
  stockQuantity: number;
  reorderLevel: number;
  imageUrl?: string;
}

export interface UpdateProductDTO {
  productName?: string;
  category?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  reorderLevel?: number;
  imageUrl?: string;
}

export interface ProductFilterParams {
  q?: string;
  category?: string;
  stockStatus?: string;
  sortBy?: 'price' | 'productName' | 'stockQuantity' | 'createdAt';
  order?: 'asc' | 'desc';
}
