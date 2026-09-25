import api from './api';
import { Order, CreateOrderDTO, OrderFilterParams, OrderStatus, DashboardMetrics } from '../types/order';

export const getOrders = async (params?: OrderFilterParams): Promise<Order[]> => {
  const response = await api.get<{ success: boolean; data: Order[] }>('/orders', { params });
  return response.data.data;
};

export const getOrderById = async (id: string): Promise<Order> => {
  const response = await api.get<{ success: boolean; data: Order }>(`/orders/${id}`);
  return response.data.data;
};

export const createOrder = async (orderData: CreateOrderDTO): Promise<Order> => {
  const response = await api.post<{ success: boolean; data: Order }>('/orders', orderData);
  return response.data.data;
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<Order> => {
  const response = await api.patch<{ success: boolean; data: Order }>(`/orders/${id}/status`, { status });
  return response.data.data;
};

export const cancelOrder = async (id: string): Promise<Order> => {
  const response = await api.post<{ success: boolean; data: Order }>(`/orders/${id}/cancel`);
  return response.data.data;
};

export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const response = await api.get<{ success: boolean; data: DashboardMetrics }>('/orders/metrics');
  return response.data.data;
};
