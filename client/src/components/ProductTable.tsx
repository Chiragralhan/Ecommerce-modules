import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types/product';
import { StockBadge } from './StockBadge';

interface ProductTableProps {
  products: Product[];
  onDeleteClick?: (product: Product) => void;
  compact?: boolean;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onDeleteClick,
  compact = false,
}) => {
  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Reorder Level</th>
            <th>Inventory Status</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>
                <div className="d-flex align-items-center gap-3">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.productName}
                      className="product-img-thumb"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="product-img-thumb d-flex align-items-center justify-content-center text-muted">
                      📦
                    </div>
                  )}
                  <div>
                    <Link
                      to={`/products/${p._id}`}
                      className="fw-semibold text-dark text-decoration-none"
                    >
                      {p.productName}
                    </Link>
                    <div className="text-muted small font-monospace">{p.productId}</div>
                  </div>
                </div>
              </td>
              <td>
                <span className="badge bg-light text-dark border">{p.category}</span>
              </td>
              <td className="fw-bold">${p.price.toFixed(2)}</td>
              <td>
                <span className="fw-semibold">{p.stockQuantity}</span> units
              </td>
              <td className="text-muted">{p.reorderLevel} units</td>
              <td>
                <StockBadge
                  stockQuantity={p.stockQuantity}
                  reorderLevel={p.reorderLevel}
                  status={p.stockStatus}
                />
              </td>
              <td className="text-end">
                <div className="btn-group btn-group-sm">
                  <Link
                    to={`/products/${p._id}`}
                    className="btn btn-outline-secondary"
                    title="View Product Details"
                  >
                    👁️ View
                  </Link>
                  <Link
                    to={`/products/edit/${p._id}`}
                    className="btn btn-outline-secondary"
                    title="Edit Product"
                  >
                    ✏️ Edit
                  </Link>
                  {onDeleteClick && (
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => onDeleteClick(p)}
                      title="Delete Product"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
