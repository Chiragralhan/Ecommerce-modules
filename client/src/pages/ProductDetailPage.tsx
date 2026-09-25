import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById, deleteProduct } from '../services/productService';
import { Product } from '../types/product';
import { StockBadge } from '../components/StockBadge';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (prodId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProductById(prodId);
      setProduct(data);
    } catch (err: any) {
      console.error('Failed to load product', err);
      setError(err.response?.data?.message || 'Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!product) return;
    try {
      setDeleting(true);
      await deleteProduct(product._id);
      setShowDeleteModal(false);
      navigate('/products');
    } catch (err: any) {
      console.error('Failed to delete product', err);
      alert(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading product information..." />;
  }

  if (error || !product) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          {error || 'Product not found'}
        </div>
        <Link to="/products" className="btn btn-outline-secondary">
          &larr; Back to Products Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '960px' }}>
      {/* Header & Actions */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h2 className="fw-bold mb-0 text-dark">{product.productName}</h2>
            <StockBadge
              stockQuantity={product.stockQuantity}
              reorderLevel={product.reorderLevel}
              status={product.stockStatus}
            />
          </div>
          <p className="text-muted mb-0 font-monospace">Product Code: {product.productId}</p>
        </div>

        <div className="d-flex gap-2">
          <Link to="/products" className="btn btn-outline-secondary btn-sm">
            &larr; Back to Products
          </Link>
          <Link to={`/products/edit/${product._id}`} className="btn btn-primary btn-sm">
            ✏️ Edit Product
          </Link>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={() => setShowDeleteModal(true)}
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Image & Status Card */}
        <div className="col-md-5">
          <div className="card erp-card p-3 text-center mb-4">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.productName}
                className="img-fluid rounded mb-3"
                style={{ maxHeight: '280px', objectFit: 'contain' }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div
                className="bg-light rounded d-flex align-items-center justify-content-center text-muted mx-auto mb-3"
                style={{ height: '220px', width: '100%', fontSize: '4rem' }}
              >
                📦
              </div>
            )}
            <h4 className="fw-bold text-success mb-1">${product.price.toFixed(2)}</h4>
            <div className="text-muted small">Standard ERP Selling Price</div>
          </div>

          {/* Quick Inventory Summary Box */}
          <div className="card erp-card p-3">
            <h6 className="fw-bold text-secondary mb-3">Inventory Status Overview</h6>
            <div className="d-flex justify-content-between py-2 border-bottom">
              <span className="text-muted">Current Stock:</span>
              <span className="fw-bold fs-6">{product.stockQuantity} units</span>
            </div>
            <div className="d-flex justify-content-between py-2 border-bottom">
              <span className="text-muted">Reorder Threshold:</span>
              <span className="fw-semibold">{product.reorderLevel} units</span>
            </div>
            <div className="d-flex justify-content-between py-2">
              <span className="text-muted">Status:</span>
              <StockBadge
                stockQuantity={product.stockQuantity}
                reorderLevel={product.reorderLevel}
                status={product.stockStatus}
                showDetails={true}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Full Specifications */}
        <div className="col-md-7">
          <div className="card erp-card p-4">
            <h5 className="fw-bold mb-3 border-bottom pb-2">Product Specifications</h5>

            <div className="mb-3">
              <label className="text-muted small text-uppercase fw-semibold d-block">Category</label>
              <span className="badge bg-secondary-subtle text-secondary border px-3 py-2 fs-6">
                {product.category}
              </span>
            </div>

            <div className="mb-3">
              <label className="text-muted small text-uppercase fw-semibold d-block">Description</label>
              <p className="text-dark bg-light p-3 rounded border">
                {product.description || 'No description provided for this product.'}
              </p>
            </div>

            <div className="row g-3 pt-2 border-top">
              <div className="col-sm-6">
                <label className="text-muted small text-uppercase fw-semibold d-block">System Mongo ID</label>
                <code className="text-muted small">{product._id}</code>
              </div>
              <div className="col-sm-6">
                <label className="text-muted small text-uppercase fw-semibold d-block">Created Date</label>
                <span className="small text-dark">
                  {new Date(product.createdAt).toLocaleDateString()} at{' '}
                  {new Date(product.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reusable Delete Confirmation Modal */}
      <ConfirmationModal
        show={showDeleteModal}
        title="Confirm Product Deletion"
        message={`Are you sure you want to delete "${product.productName}" (ID: ${product.productId})?`}
        warningText="This action will permanently remove the product from the catalog. Existing historical orders referencing this product will retain snapshot details."
        confirmLabel="Delete Product"
        confirmVariant="danger"
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};
