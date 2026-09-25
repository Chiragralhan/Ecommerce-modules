import React from 'react';
import { OrderStatus } from '../types/order';

interface StatusBadgeProps {
  status: OrderStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'Pending':
      return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1">🕒 Pending</span>;
    case 'Confirmed':
      return <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">📋 Confirmed</span>;
    case 'Shipped':
      return <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle px-2 py-1">🚚 Shipped</span>;
    case 'Delivered':
      return <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">✅ Delivered</span>;
    case 'Cancelled':
      return <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">❌ Cancelled</span>;
    default:
      return <span className="badge bg-light text-dark border px-2 py-1">{status}</span>;
  }
};
