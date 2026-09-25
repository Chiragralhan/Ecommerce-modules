import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById, updateOrderStatus, cancelOrder } from '../services/orderService';
import { Order, OrderStatus } from '../types/order';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal State for Cancellation
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      loadOrder(id);
    }
  }, [id]);

  const loadOrder = async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (err: any) {
      console.error('Failed to load order', err);
      setError(err.response?.data?.message || 'Failed to load order invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!id || !order) return;
    try {
      setActionLoading(true);
      setError(null);
      setSuccessMessage(null);
      const updated = await updateOrderStatus(id, newStatus);
      setOrder(updated);
      setSuccessMessage(`Order status successfully advanced to "${newStatus}"`);
    } catch (err: any) {
      console.error('Failed to update status', err);
      setError(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!id || !order) return;
    try {
      setActionLoading(true);
      setError(null);
      setSuccessMessage(null);
      const cancelled = await cancelOrder(id);
      setOrder(cancelled);
      setShowCancelModal(false);
      setSuccessMessage(
        'Order was cancelled successfully. All ordered items have been restored to inventory stock.'
      );
    } catch (err: any) {
      console.error('Failed to cancel order', err);
      setError(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Fetching order details..." />;
  }

  if (error && !order) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <Link to="/orders" className="btn btn-outline-secondary">
          &larr; Back to Orders List
        </Link>
      </div>
    );
  }

  if (!order) {
    return <div>Order not found.</div>;
  }

  const isCancelled = order.orderStatus === 'Cancelled';
  const isDelivered = order.orderStatus === 'Delivered';

  return (
    <div className="container" style={{ maxWidth: '980px' }}>
      {/* Header & Controls */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-2">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h2 className="fw-bold mb-0 text-dark">Order: {order.orderId}</h2>
            <StatusBadge status={order.orderStatus} />
          </div>
          <p className="text-muted mb-0 small">
            Created on {new Date(order.orderDate).toLocaleDateString()} at{' '}
            {new Date(order.orderDate).toLocaleTimeString()}
          </p>
        </div>

        <div className="d-flex gap-2">
          <Link to="/orders" className="btn btn-outline-secondary btn-sm">
            &larr; Back to Orders
          </Link>
          {!isCancelled && !isDelivered && (
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              disabled={actionLoading}
              onClick={() => setShowCancelModal(true)}
            >
              Cancel Order (Restore Inventory)
            </button>
          )}
        </div>
      </div>

      {/* Feedback Messages */}
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <strong>Success:</strong> {successMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccessMessage(null)}
          />
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>Error:</strong> {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
          />
        </div>
      )}

      <div className="row g-4">
        {/* Customer Information Card */}
        <div className="col-md-6">
          <div className="card erp-card p-4 h-100">
            <h5 className="fw-bold mb-3 border-bottom pb-2 text-secondary">
              Customer Information
            </h5>
            <table className="table table-sm table-borderless mb-0">
              <tbody>
                <tr>
                  <td className="text-muted" style={{ width: '130px' }}>
                    Customer Name:
                  </td>
                  <td className="fw-semibold text-dark">{order.customerName}</td>
                </tr>
                <tr>
                  <td className="text-muted">Email Address:</td>
                  <td className="text-dark">{order.customerEmail}</td>
                </tr>
                <tr>
                  <td className="text-muted">Phone Number:</td>
                  <td className="text-dark">{order.customerPhone}</td>
                </tr>
                <tr>
                  <td className="text-muted">Order ID:</td>
                  <td className="font-monospace text-primary fw-bold">{order.orderId}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Lifecycle Control Card */}
        <div className="col-md-6">
          <div className="card erp-card p-4 h-100">
            <h5 className="fw-bold mb-3 border-bottom pb-2 text-secondary">
              Fulfillment Status Control
            </h5>
            <p className="text-muted small mb-3">
              Manage the progression of this order through fulfillment stages:
            </p>

            <div className="d-flex flex-column gap-2">
              <div className="input-group">
                <span className="input-group-text bg-white fw-semibold">Status</span>
                <select
                  className="form-select"
                  value={order.orderStatus}
                  disabled={actionLoading || isCancelled}
                  onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled" disabled>
                    Cancelled (Use Cancel Button)
                  </option>
                </select>
              </div>

              {isCancelled && (
                <div className="alert alert-danger py-2 px-3 small mt-2 mb-0">
                  ⚠️ <strong>Order Cancelled:</strong> Ordered quantities were restored back to product inventory stock. Status changes are now locked.
                </div>
              )}

              {isDelivered && (
                <div className="alert alert-success py-2 px-3 small mt-2 mb-0">
                  ✅ <strong>Delivered:</strong> This order has been successfully completed and fulfilled.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Items Breakdown */}
        <div className="col-12">
          <div className="card erp-card">
            <div className="card-header bg-white py-3">
              <h5 className="fw-bold mb-0">
                Order Items ({order.items?.length || 0} Line Items)
              </h5>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Product Code</th>
                    <th className="text-center">Quantity</th>
                    <th className="text-end">Unit Price</th>
                    <th className="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="fw-semibold text-dark">{item.productName}</td>
                      <td>
                        <span className="badge bg-light text-dark font-monospace border">
                          {item.productId}
                        </span>
                      </td>
                      <td className="text-center fw-bold">{item.quantity}</td>
                      <td className="text-end">${item.price.toFixed(2)}</td>
                      <td className="text-end fw-bold text-dark">${item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="table-light">
                    <td colSpan={3} className="text-muted small">
                      {isCancelled
                        ? 'ℹ️ All item quantities were restored to product inventory upon cancellation.'
                        : 'ℹ️ Inventory stock was automatically deducted upon order placement.'}
                    </td>
                    <td className="text-end fw-bold fs-6">Grand Total:</td>
                    <td className="text-end fw-bold fs-5 text-success">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      <ConfirmationModal
        show={showCancelModal}
        title="Confirm Order Cancellation"
        message={`Are you sure you want to cancel order ${order.orderId}?`}
        warningText="Cancelling this order will automatically restore all ordered item quantities back into the product inventory."
        confirmLabel="Cancel Order & Restore Stock"
        confirmVariant="danger"
        isLoading={actionLoading}
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelModal(false)}
      />
    </div>
  );
};
