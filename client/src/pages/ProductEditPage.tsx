import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById, updateProduct } from '../services/productService';
import { Product, UpdateProductDTO } from '../types/product';
import { ProductForm } from '../components/ProductForm';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const ProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (prodId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProductById(prodId);
      setProduct(data);
    } catch (err: any) {
      console.error('Failed to load product for editing', err);
      setError(err.response?.data?.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: UpdateProductDTO) => {
    if (!id) return;
    try {
      setSaving(true);
      setError(null);
      await updateProduct(id, formData);
      navigate(`/products/${id}`);
    } catch (err: any) {
      console.error('Failed to update product', err);
      setError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Fetching product information..." />;
  }

  if (error && !product) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <Link to="/products" className="btn btn-outline-secondary">
          &larr; Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '820px' }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-dark">
            Edit Product: <span className="font-monospace text-primary">{product?.productId}</span>
          </h2>
          <p className="text-muted mb-0">Update stock inventory levels, reorder threshold, or pricing</p>
        </div>
        <div className="d-flex gap-2">
          <Link to={`/products/${id}`} className="btn btn-outline-secondary btn-sm">
            View Details
          </Link>
          <Link to="/products" className="btn btn-outline-secondary btn-sm">
            &larr; All Products
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card erp-card p-4">
        {product && (
          <ProductForm
            initialData={product}
            onSubmit={handleSubmit}
            isLoading={saving}
            submitButtonText="Update Product & Stock"
            cancelPath={`/products/${id}`}
          />
        )}
      </div>
    </div>
  );
};
