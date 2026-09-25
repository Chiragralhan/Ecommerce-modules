import React from 'react';
import { Link } from 'react-router-dom';
import { Order } from '../types/order';
import { StatusBadge } from './StatusBadge';

interface OrderTableProps {
  orders: Order[];
  compact?: boolean;
}

export const OrderTable: React.FC<OrderTableProps> = ({ orders, compact = false }) => {
  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Order Date</th>
            <th>Items</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const totalQty = order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
            const uniqueItems = order.items?.length || 0;

            return (
              <tr key={order._id}>
                <td>
                  <Link
                    to={`/orders/${order._id}`}
                    className="fw-bold font-monospace text-primary text-decoration-none"
                  >
                    {order.orderId}
                  </Link>
                </td>
                <td>
                  <div className="fw-semibold text-dark">{order.customerName}</div>
                  {!compact && (
                    <small className="text-muted d-block">{order.customerEmail}</small>
                  )}
                </td>
                <td>
                  <div>{new Date(order.orderDate).toLocaleDateString()}</div>
                  <small className="text-muted">{new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                </td>
                <td>
                  <span className="badge bg-light text-dark border">
                    {totalQty} {totalQty === 1 ? 'item' : 'items'}
                    {!compact && ` (${uniqueItems} SKU${uniqueItems > 1 ? 's' : ''})`}
                  </span>
                </td>
                <td className="fw-bold text-success">${order.totalAmount.toFixed(2)}</td>
                <td>
                  <StatusBadge status={order.orderStatus} />
                </td>
                <td className="text-end">
                  <Link
                    to={`/orders/${order._id}`}
                    className="btn btn-sm btn-outline-secondary"
                  >
                    View Details &rarr;
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
