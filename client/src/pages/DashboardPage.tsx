import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardMetrics } from '../services/orderService';
import { getProducts } from '../services/productService';
import { DashboardMetrics } from '../types/order';
import { Product } from '../types/product';
import { StatCard } from '../components/StatCard';
import { OrderTable } from '../components/OrderTable';
import { ProductTable } from '../components/ProductTable';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const [metricData, allProducts] = await Promise.all([
        getDashboardMetrics(),
        getProducts(),
      ]);
      setMetrics(metricData);
      const alertItems = allProducts.filter((p) => p.stockQuantity <= p.reorderLevel);
      setLowStockProducts(alertItems);
    } catch (err: any) {
      console.error('Failed to load dashboard data', err);
      setError(err.response?.data?.message || 'Failed to load ERP metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading ERP metrics & inventory data..." />;
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
        <div>
          <strong>Error loading ERP Dashboard:</strong> {error}
        </div>
        <button className="btn btn-sm btn-outline-danger" onClick={loadDashboard}>
          Retry
        </button>
      </div>
    );
  }

  const { inventory, orders } = metrics || {
    inventory: {
      totalProducts: 0,
      inStockCount: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      inventoryValuation: 0,
    },
    orders: {
      totalOrders: 0,
      pendingOrders: 0,
      confirmedOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      totalRevenue: 0,
      recentOrders: [],
    },
  };

  // Use totalStockUnits from API metrics (computed on backend from product data)
  const totalStockUnits = inventory.totalStockUnits ?? 0;

  // Simple distribution percentages for Inventory
  const totalInvCount = inventory.totalProducts || 1;
  const inStockPct = Math.round((inventory.inStockCount / totalInvCount) * 100);
  const lowStockPct = Math.round((inventory.lowStockCount / totalInvCount) * 100);
  const outStockPct = Math.round((inventory.outOfStockCount / totalInvCount) * 100);

  // Simple distribution percentages for Orders
  const totalOrdersCount = orders.totalOrders || 1;
  const pendingPct = Math.round((orders.pendingOrders / totalOrdersCount) * 100);
  const deliveredPct = Math.round((orders.deliveredOrders / totalOrdersCount) * 100);
  const transitPct = Math.round(((orders.confirmedOrders + orders.shippedOrders) / totalOrdersCount) * 100);
  const cancelledPct = Math.round((orders.cancelledOrders / totalOrdersCount) * 100);

  return (
    <div>
      {/* Top Banner */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1 text-dark">ERP Operations Dashboard</h2>
          <p className="text-muted mb-0">Overview of Product Catalog, Inventory Health, and Order Fulfillment</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/products/add" className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1">
            <span>➕</span> Add Product
          </Link>
          <Link to="/orders/create" className="btn btn-primary btn-sm d-flex align-items-center gap-1">
            <span>🛒</span> Create Order
          </Link>
        </div>
      </div>

      {/* 7 Summary Cards as requested */}
      <div className="row g-3 mb-4">
        {/* Module 1 Stat Cards */}
        <div className="col-sm-6 col-md-4 col-xl">
          <StatCard
            title="Total Products"
            value={inventory.totalProducts}
            subtext={`Valuation: $${inventory.inventoryValuation.toLocaleString()}`}
            icon="📦"
            variant="primary"
          />
        </div>

        <div className="col-sm-6 col-md-4 col-xl">
          <StatCard
            title="Total Stock Units"
            value={totalStockUnits.toLocaleString()}
            subtext="Available units on hand"
            icon="📊"
            variant="info"
          />
        </div>

        <div className="col-sm-6 col-md-4 col-xl">
          <StatCard
            title="Low Stock"
            value={inventory.lowStockCount}
            subtext="≤ Reorder threshold"
            icon="⚠️"
            variant="warning"
          />
        </div>

        <div className="col-sm-6 col-md-4 col-xl">
          <StatCard
            title="Out of Stock"
            value={inventory.outOfStockCount}
            subtext="0 units available"
            icon="⛔"
            variant="danger"
          />
        </div>

        {/* Module 2 Stat Cards */}
        <div className="col-sm-6 col-md-4 col-xl">
          <StatCard
            title="Total Orders"
            value={orders.totalOrders}
            subtext={`Revenue: $${orders.totalRevenue.toLocaleString()}`}
            icon="📑"
            variant="secondary"
          />
        </div>

        <div className="col-sm-6 col-md-4 col-xl">
          <StatCard
            title="Pending Orders"
            value={orders.pendingOrders}
            subtext="Awaiting fulfillment"
            icon="🕒"
            variant="warning"
          />
        </div>

        <div className="col-sm-6 col-md-4 col-xl">
          <StatCard
            title="Delivered Orders"
            value={orders.deliveredOrders}
            subtext="Fulfilled orders"
            icon="✅"
            variant="success"
          />
        </div>
      </div>

      {/* Simple Status Visualizations */}
      <div className="row g-3 mb-4">
        {/* Inventory Status Distribution */}
        <div className="col-lg-6">
          <div className="card erp-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-semibold text-dark">Inventory Stock Health Breakdown</span>
              <span className="small text-muted">{inventory.totalProducts} SKUs</span>
            </div>
            <div className="progress" style={{ height: '14px' }}>
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{ width: `${inStockPct}%` }}
                title={`In Stock: ${inventory.inStockCount} (${inStockPct}%)`}
              />
              <div
                className="progress-bar bg-warning"
                role="progressbar"
                style={{ width: `${lowStockPct}%` }}
                title={`Low Stock: ${inventory.lowStockCount} (${lowStockPct}%)`}
              />
              <div
                className="progress-bar bg-danger"
                role="progressbar"
                style={{ width: `${outStockPct}%` }}
                title={`Out of Stock: ${inventory.outOfStockCount} (${outStockPct}%)`}
              />
            </div>
            <div className="d-flex justify-content-between small text-muted mt-2">
              <span><span className="text-success fw-bold">●</span> In Stock: {inventory.inStockCount} ({inStockPct}%)</span>
              <span><span className="text-warning-emphasis fw-bold">●</span> Low Stock: {inventory.lowStockCount} ({lowStockPct}%)</span>
              <span><span className="text-danger fw-bold">●</span> Out of Stock: {inventory.outOfStockCount} ({outStockPct}%)</span>
            </div>
          </div>
        </div>

        {/* Orders by Status Distribution */}
        <div className="col-lg-6">
          <div className="card erp-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-semibold text-dark">Orders by Status Distribution</span>
              <span className="small text-muted">{orders.totalOrders} Total Orders</span>
            </div>
            <div className="progress" style={{ height: '14px' }}>
              <div
                className="progress-bar bg-secondary"
                role="progressbar"
                style={{ width: `${pendingPct}%` }}
                title={`Pending: ${orders.pendingOrders}`}
              />
              <div
                className="progress-bar bg-info"
                role="progressbar"
                style={{ width: `${transitPct}%` }}
                title={`In Progress: ${orders.confirmedOrders + orders.shippedOrders}`}
              />
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{ width: `${deliveredPct}%` }}
                title={`Delivered: ${orders.deliveredOrders}`}
              />
              <div
                className="progress-bar bg-danger"
                role="progressbar"
                style={{ width: `${cancelledPct}%` }}
                title={`Cancelled: ${orders.cancelledOrders}`}
              />
            </div>
            <div className="d-flex justify-content-between small text-muted mt-2 flex-wrap gap-1">
              <span><span className="text-secondary fw-bold">●</span> Pending: {orders.pendingOrders}</span>
              <span><span className="text-info fw-bold">●</span> Confirmed/Shipped: {orders.confirmedOrders + orders.shippedOrders}</span>
              <span><span className="text-success fw-bold">●</span> Delivered: {orders.deliveredOrders}</span>
              <span><span className="text-danger fw-bold">●</span> Cancelled: {orders.cancelledOrders}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Core Tables: Recent Orders & Low Stock Alerts */}
      <div className="row g-4">
        {/* Table 1: Recent Orders */}
        <div className="col-lg-7">
          <div className="card erp-card h-100">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-bold mb-0">1. Recent Orders</h6>
                <small className="text-muted">Latest activity in order management</small>
              </div>
              <Link to="/orders" className="btn btn-sm btn-link text-decoration-none">
                View All ({orders.totalOrders}) &rarr;
              </Link>
            </div>
            {orders.recentOrders.length === 0 ? (
              <EmptyState
                icon="📑"
                title="No Orders Found"
                description="Create your first customer order to start tracking fulfillment."
                actionText="Create Order"
                actionLink="/orders/create"
              />
            ) : (
              <OrderTable orders={orders.recentOrders} compact={true} />
            )}
          </div>
        </div>

        {/* Table 2: Low Stock Products Alert */}
        <div className="col-lg-5">
          <div className="card erp-card h-100">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-bold mb-0 text-warning-emphasis">
                  2. Low Stock & Reorder Alerts
                </h6>
                <small className="text-muted">Products requiring stock replenishment</small>
              </div>
              <Link to="/products" className="btn btn-sm btn-link text-decoration-none">
                Inventory Catalog &rarr;
              </Link>
            </div>
            {lowStockProducts.length === 0 ? (
              <EmptyState
                icon="✅"
                title="Healthy Inventory"
                description="All products are currently stocked above their reorder threshold."
              />
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Stock / Reorder</th>
                      <th className="text-end">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.slice(0, 5).map((p) => (
                      <tr key={p._id}>
                        <td>
                          <Link
                            to={`/products/${p._id}`}
                            className="fw-semibold text-dark text-decoration-none"
                          >
                            {p.productName}
                          </Link>
                          <div className="text-muted small font-monospace">{p.productId}</div>
                        </td>
                        <td>
                          <span className="fw-bold">{p.stockQuantity}</span> / min {p.reorderLevel}
                        </td>
                        <td className="text-end">
                          <Link
                            to={`/products/edit/${p._id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            Restock
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
