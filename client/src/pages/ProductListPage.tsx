import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, deleteProduct, getProductCategories } from '../services/productService';
import { Product, ProductFilterParams } from '../types/product';
import { ProductTable } from '../components/ProductTable';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockStatusFilter, setStockStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'createdAt' | 'price' | 'productName' | 'stockQuantity'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal State for Delete
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, stockStatusFilter, sortBy, sortOrder]);

  const fetchCategories = async () => {
    try {
      const cats = await getProductCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: ProductFilterParams = {
        q: searchTerm || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        stockStatus: stockStatusFilter !== 'All' ? stockStatusFilter : undefined,
        sortBy,
        order: sortOrder,
      };
      const data = await getProducts(params);
      setProducts(data);
    } catch (err: any) {
      console.error('Failed to load products', err);
      setError(err.response?.data?.message || 'Error loading product catalog');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      setDeleting(true);
      await deleteProduct(productToDelete._id);
      setProducts((prev) => prev.filter((p) => p._id !== productToDelete._id));
      setProductToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete product', err);
      alert(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Top Section */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Product & Inventory Management</h2>
          <p className="text-muted mb-0">Maintain stock availability, reorder thresholds, and catalog data</p>
        </div>
        <Link to="/products/add" className="btn btn-primary d-flex align-items-center gap-1">
          <span>➕</span> Add New Product
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="card erp-card p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-white">🔍</span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, description, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-outline-secondary" type="submit">
                Search
              </button>
            </div>
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <select
              className="form-select"
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
            >
              <option value="All">All Stock Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          <div className="col-md-2">
            <select
              className="form-select"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-') as [any, any];
                setSortBy(sb);
                setSortOrder(so);
              }}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="productName-asc">Name (A-Z)</option>
              <option value="productName-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low &rarr; High)</option>
              <option value="price-desc">Price (High &rarr; Low)</option>
              <option value="stockQuantity-asc">Stock (Low &rarr; High)</option>
              <option value="stockQuantity-desc">Stock (High &rarr; Low)</option>
            </select>
          </div>

          <div className="col-md-1 text-end">
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              title="Reset Filters"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setStockStatusFilter('All');
                setSortBy('createdAt');
                setSortOrder('desc');
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Product Table Card */}
      <div className="card erp-card">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <span className="fw-semibold">
            Catalog Products ({products.length} {products.length === 1 ? 'Product' : 'Products'})
          </span>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading catalog..." />
        ) : products.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No Products Found"
            description={
              searchTerm || selectedCategory !== 'All' || stockStatusFilter !== 'All'
                ? 'Try adjusting your search keywords or filter settings.'
                : 'Your ERP product catalog is currently empty.'
            }
            actionText={
              searchTerm || selectedCategory !== 'All' || stockStatusFilter !== 'All'
                ? 'Clear Filters'
                : 'Add First Product'
            }
            onActionClick={
              searchTerm || selectedCategory !== 'All' || stockStatusFilter !== 'All'
                ? () => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                    setStockStatusFilter('All');
                  }
                : undefined
            }
            actionLink={
              !(searchTerm || selectedCategory !== 'All' || stockStatusFilter !== 'All')
                ? '/products/add'
                : undefined
            }
          />
        ) : (
          <ProductTable
            products={products}
            onDeleteClick={(p) => setProductToDelete(p)}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        show={!!productToDelete}
        title="Confirm Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.productName}" (${productToDelete?.productId})?`}
        warningText="This will permanently delete the item from current inventory."
        confirmLabel="Delete Product"
        confirmVariant="danger"
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
};
