import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createProduct } from '../services/productService';
import { ProductForm } from '../components/ProductForm';
import { CreateProductDTO } from '../types/product';

export const ProductAddPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: any) => {
    try {
      setLoading(true);
      setError(null);
      await createProduct(formData as CreateProductDTO);
      navigate('/products');
    } catch (err: any) {
      console.error('Failed to create product:', err);
      setError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '820px' }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Add New Product</h2>
          <p className="text-muted mb-0">Add product specifications, unit pricing, and initial stock quantities</p>
        </div>
        <Link to="/products" className="btn btn-outline-secondary btn-sm">
          &larr; Back to Catalog
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card erp-card p-4">
        <ProductForm
          onSubmit={handleSubmit}
          isLoading={loading}
          submitButtonText="Add Product to Inventory"
          cancelPath="/products"
        />
      </div>
    </div>
  );
};
