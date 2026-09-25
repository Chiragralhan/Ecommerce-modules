import React from 'react';
import { StockStatus } from '../types/product';

interface StockBadgeProps {
  stockQuantity: number;
  reorderLevel: number;
  status?: StockStatus;
  showDetails?: boolean;
}

export const StockBadge: React.FC<StockBadgeProps> = ({
  stockQuantity,
  reorderLevel,
  status,
  showDetails = false,
}) => {
  let computedStatus: StockStatus = status || 'In Stock';

  if (!status) {
    if (stockQuantity <= 0) {
      computedStatus = 'Out of Stock';
    } else if (stockQuantity <= reorderLevel) {
      computedStatus = 'Low Stock';
    } else {
      computedStatus = 'In Stock';
    }
  }

  if (computedStatus === 'Out of Stock') {
    return (
      <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">
        ● Out of Stock {showDetails && `(0 / min ${reorderLevel})`}
      </span>
    );
  }

  if (computedStatus === 'Low Stock') {
    return (
      <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1">
        ▲ Low Stock {showDetails && `(${stockQuantity} / min ${reorderLevel})`}
      </span>
    );
  }

  return (
    <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
      ✓ In Stock {showDetails && `(${stockQuantity})`}
    </span>
  );
};
