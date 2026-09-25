import { Product } from './product';

export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  product: string | Product;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  _id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderDate: string;
  items: OrderItem[];
  totalAmount: number;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItemDTO {
  product: string;
  productId?: string;
  quantity: number;
}

export interface CreateOrderDTO {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: CreateOrderItemDTO[];
}

export interface OrderFilterParams {
  q?: string;
  status?: string;
  sortBy?: 'orderDate' | 'totalAmount';
  order?: 'asc' | 'desc';
}

export interface DashboardMetrics {
  inventory: {
    totalProducts: number;
    totalStockUnits?: number;
    inStockCount: number;
    lowStockCount: number;
    outOfStockCount: number;
    inventoryValuation: number;
  };
  orders: {
    totalOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    recentOrders: Order[];
  };
}
