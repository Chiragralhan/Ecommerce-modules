import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProducts } from '../services/productService';
import { createOrder } from '../services/orderService';
import { Product } from '../types/product';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface FormOrderItem {
  productId: string; // Mongo _id
  quantity: number;
}

export const OrderCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Customer Form State
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');

  // Line items state
  const [orderItems, setOrderItems] = useState<FormOrderItem[]>([
    { productId: '', quantity: 1 },
  ]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await getProducts();
      setProducts(data);
    } catch (err: any) {
      console.error('Failed to load products for order placement', err);
      setError('Failed to load products catalog for order processing');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddItemRow = () => {
    setOrderItems((prev) => [...prev, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (orderItems.length === 1) return;
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', value: any) => {
    setOrderItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: field === 'quantity' ? Math.max(1, Number(value) || 1) : value,
      };
      return copy;
    });
  };

  const getProductInfo = (mongoId: string): Product | undefined => {
    return products.find((p) => p._id === mongoId);
  };

  // Dynamic calculations & live stock verification
  const calculateLiveTotals = () => {
    let grandTotal = 0;
    const itemsSummary = orderItems.map((item) => {
      const prod = getProductInfo(item.productId);
      const unitPrice = prod ? prod.price : 0;
      const subtotal = unitPrice * item.quantity;
      grandTotal += subtotal;
      const availableStock = prod ? prod.stockQuantity : 0;
      const exceedsStock = prod ? item.quantity > availableStock : false;

      return {
        product: prod,
        unitPrice,
        subtotal,
        availableStock,
        exceedsStock,
      };
    });

    return { grandTotal, itemsSummary };
  };

  const { grandTotal, itemsSummary } = calculateLiveTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setError('Please provide customer name, email address, and phone number.');
      return;
    }

    if (orderItems.some((i) => !i.productId)) {
      setError('Please select a product for all order line items.');
      return;
    }

    // Verify stock availability
    for (const item of itemsSummary) {
      if (item.exceedsStock) {
        setError(
          `Insufficient stock for "${item.product?.productName}". Available: ${item.availableStock}, Requested: ${orderItems.find((i) => i.productId === item.product?._id)?.quantity}.`
        );
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        items: orderItems.map((i) => ({
          product: i.productId,
          quantity: i.quantity,
        })),
      };

      const createdOrder = await createOrder(payload);
      navigate(`/orders/${createdOrder._id}`);
    } catch (err: any) {
      console.error('Failed to create order', err);
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProducts) {
    return <LoadingSpinner message="Loading catalog for order entry..." />;
  }

  return (
    <div className="container" style={{ maxWidth: '980px' }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Create New Customer Order</h2>
          <p className="text-muted mb-0">
            Process incoming orders with automatic inventory stock checking and deduction
          </p>
        </div>
        <Link to="/orders" className="btn btn-outline-secondary btn-sm">
          &larr; Back to Orders
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <strong>Validation Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* Section 1: Customer Details */}
          <div className="col-12">
            <div className="card erp-card p-4">
              <h5 className="fw-bold mb-3 text-secondary border-bottom pb-2">
                1. Customer Information
              </h5>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Customer Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Alice Johnson"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="alice@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="e.g. +1 555-0199"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Order Items & Live Stock Checking */}
          <div className="col-12">
            <div className="card erp-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                <div>
                  <h5 className="fw-bold mb-0 text-secondary">
                    2. Select Products & Quantities
                  </h5>
                  <small className="text-muted">
                    Inventory is checked in real-time. Quantities will be deducted upon order placement.
                  </small>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={handleAddItemRow}
                >
                  ➕ Add Line Item
                </button>
              </div>

              {orderItems.map((item, index) => {
                const summary = itemsSummary[index];
                return (
                  <div
                    key={index}
                    className={`row g-2 align-items-center mb-3 p-3 rounded border ${
                      summary?.exceedsStock ? 'border-danger bg-danger-subtle bg-opacity-25' : 'bg-light'
                    }`}
                  >
                    {/* Product Selector with current stock display */}
                    <div className="col-md-5">
                      <label className="form-label small fw-semibold text-muted">
                        Select Product <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        required
                      >
                        <option value="">-- Choose from Catalog --</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id} disabled={p.stockQuantity === 0}>
                            {p.productName} ({p.productId}) &bull; Stock: {p.stockQuantity} &bull; ${p.price.toFixed(2)}
                            {p.stockQuantity === 0 ? ' [OUT OF STOCK]' : ''}
                          </option>
                        ))}
                      </select>
                      {summary?.product && (
                        <div className="mt-1 small">
                          <span className="text-muted">Available Stock: </span>
                          <span
                            className={`fw-bold ${
                              summary.availableStock === 0
                                ? 'text-danger'
                                : summary.availableStock <= summary.product.reorderLevel
                                ? 'text-warning-emphasis'
                                : 'text-success'
                            }`}
                          >
                            {summary.availableStock} units
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quantity input */}
                    <div className="col-md-2">
                      <label className="form-label small fw-semibold text-muted">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        max={summary?.availableStock || 9999}
                        className={`form-control ${summary?.exceedsStock ? 'is-invalid' : ''}`}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        required
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="col-md-2">
                      <label className="form-label small fw-semibold text-muted">Unit Price</label>
                      <div className="form-control-plaintext fw-semibold">
                        ${summary?.unitPrice.toFixed(2) || '0.00'}
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="col-md-2">
                      <label className="form-label small fw-semibold text-muted">Subtotal</label>
                      <div className="form-control-plaintext fw-bold text-primary">
                        ${summary?.subtotal.toFixed(2) || '0.00'}
                      </div>
                    </div>

                    {/* Remove button */}
                    <div className="col-md-1 text-end">
                      <label className="form-label small d-block">&nbsp;</label>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        disabled={orderItems.length === 1}
                        title="Remove Item"
                        onClick={() => handleRemoveItemRow(index)}
                      >
                        ✕
                      </button>
                    </div>

                    {/* Stock Alert Warning if requested quantity > available */}
                    {summary?.exceedsStock && (
                      <div className="col-12 mt-1 text-danger small fw-semibold">
                        ⚠️ Requested quantity ({item.quantity}) exceeds available inventory ({summary.availableStock}). Please reduce quantity.
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Order Grand Total Summary */}
              <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                <span className="text-muted">
                  Total Items: {orderItems.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0)} units
                </span>
                <div className="text-end">
                  <span className="text-muted me-2 fs-6">Grand Total:</span>
                  <span className="fs-3 fw-bold text-success">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submission and Action Buttons */}
          <div className="col-12 d-flex justify-content-end gap-2 mb-4">
            <Link to="/orders" className="btn btn-outline-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary px-4 fw-semibold"
              disabled={submitting || itemsSummary.some((s) => s.exceedsStock)}
            >
              {submitting ? 'Placing Order & Deducting Stock...' : 'Confirm & Place Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
