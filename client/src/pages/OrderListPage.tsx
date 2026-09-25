import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../services/orderService';
import { Order, OrderFilterParams } from '../types/order';
import { OrderTable } from '../components/OrderTable';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const OrderListPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'orderDate' | 'totalAmount'>('orderDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, sortBy, sortOrder]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: OrderFilterParams = {
        q: searchTerm || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        sortBy,
        order: sortOrder,
      };
      const data = await getOrders(params);
      setOrders(data);
    } catch (err: any) {
      console.error('Failed to load orders', err);
      setError(err.response?.data?.message || 'Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  return (
    <div>
      {/* Top Banner */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Order Management</h2>
          <p className="text-muted mb-0">Track customer orders, status transitions, and fulfillment</p>
        </div>
        <Link to="/orders/create" className="btn btn-primary d-flex align-items-center gap-1">
          <span>🛒</span> Create New Order
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="card erp-card p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-white">🔍</span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by customer name, email, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-outline-secondary" type="submit">
                Search
              </button>
            </div>
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="col-md-2">
            <select
              className="form-select"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-') as [any, any];
                setSortBy(sb);
                setSortOrder(so);
              }}
            >
              <option value="orderDate-desc">Date (Newest)</option>
              <option value="orderDate-asc">Date (Oldest)</option>
              <option value="totalAmount-desc">Total ($ High &rarr; Low)</option>
              <option value="totalAmount-asc">Total ($ Low &rarr; High)</option>
            </select>
          </div>

          <div className="col-md-2 text-end">
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All');
                setSortBy('orderDate');
                setSortOrder('desc');
              }}
            >
              Reset Filters
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Orders Table Card */}
      <div className="card erp-card">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <span className="fw-semibold">
            Orders ({orders.length} {orders.length === 1 ? 'Order' : 'Orders'})
          </span>
        </div>

        {loading ? (
          <LoadingSpinner message="Fetching orders..." />
        ) : orders.length === 0 ? (
          <EmptyState
            icon="📑"
            title="No Orders Found"
            description={
              searchTerm || statusFilter !== 'All'
                ? 'No orders match your filter criteria. Try resetting your search.'
                : 'There are no customer orders recorded in the ERP system yet.'
            }
            actionText={
              searchTerm || statusFilter !== 'All' ? 'Reset Filters' : 'Create First Order'
            }
            onActionClick={
              searchTerm || statusFilter !== 'All'
                ? () => {
                    setSearchTerm('');
                    setStatusFilter('All');
                  }
                : undefined
            }
            actionLink={!(searchTerm || statusFilter !== 'All') ? '/orders/create' : undefined}
          />
        ) : (
          <OrderTable orders={orders} />
        )}
      </div>
    </div>
  );
};
