import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreateProductDTO, UpdateProductDTO, Product } from '../types/product';

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  submitButtonText?: string;
  cancelPath?: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  submitButtonText = 'Save Product',
  cancelPath = '/products',
}) => {
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    reorderLevel: 5,
    imageUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        productName: initialData.productName || '',
        category: initialData.category || '',
        description: initialData.description || '',
        price: initialData.price || 0,
        stockQuantity: initialData.stockQuantity || 0,
        reorderLevel: initialData.reorderLevel !== undefined ? initialData.reorderLevel : 5,
        imageUrl: initialData.imageUrl || '',
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (formData.price === undefined || formData.price === null || isNaN(formData.price)) {
      newErrors.price = 'Price is required';
    } else if (Number(formData.price) < 0) {
      newErrors.price = 'Price cannot be negative';
    }

    if (
      formData.stockQuantity === undefined ||
      formData.stockQuantity === null ||
      isNaN(formData.stockQuantity)
    ) {
      newErrors.stockQuantity = 'Stock quantity is required';
    } else if (Number(formData.stockQuantity) < 0) {
      newErrors.stockQuantity = 'Stock quantity cannot be negative';
    } else if (!Number.isInteger(Number(formData.stockQuantity))) {
      newErrors.stockQuantity = 'Stock quantity must be a whole integer';
    }

    if (
      formData.reorderLevel === undefined ||
      formData.reorderLevel === null ||
      isNaN(formData.reorderLevel)
    ) {
      newErrors.reorderLevel = 'Reorder level is required';
    } else if (Number(formData.reorderLevel) < 0) {
      newErrors.reorderLevel = 'Reorder level cannot be negative';
    } else if (!Number.isInteger(Number(formData.reorderLevel))) {
      newErrors.reorderLevel = 'Reorder level must be a whole integer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'price' || name === 'stockQuantity' || name === 'reorderLevel'
          ? value === '' ? '' : Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      productName: formData.productName.trim(),
      category: formData.category.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      stockQuantity: Number(formData.stockQuantity),
      reorderLevel: Number(formData.reorderLevel),
      imageUrl: formData.imageUrl.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="row g-3">
        <div className="col-md-8">
          <label className="form-label fw-semibold">
            Product Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="productName"
            className={`form-control ${touched.productName && errors.productName ? 'is-invalid' : ''}`}
            placeholder="e.g. Wireless Ergonomic Mouse"
            value={formData.productName}
            onChange={handleChange}
            onBlur={() => handleBlur('productName')}
            required
          />
          {touched.productName && errors.productName && (
            <div className="invalid-feedback">{errors.productName}</div>
          )}
        </div>

        <div className="col-md-4">
          <label className="form-label fw-semibold">
            Category <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="category"
            className={`form-control ${touched.category && errors.category ? 'is-invalid' : ''}`}
            placeholder="e.g. Electronics, Office, etc."
            value={formData.category}
            onChange={handleChange}
            onBlur={() => handleBlur('category')}
            required
          />
          {touched.category && errors.category && (
            <div className="invalid-feedback">{errors.category}</div>
          )}
        </div>

        <div className="col-12">
          <label className="form-label fw-semibold">Description</label>
          <textarea
            name="description"
            rows={3}
            className="form-control"
            placeholder="Provide specifications or inventory notes..."
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label fw-semibold">
            Unit Price ($) <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            name="price"
            className={`form-control ${touched.price && errors.price ? 'is-invalid' : ''}`}
            value={formData.price}
            onChange={handleChange}
            onBlur={() => handleBlur('price')}
            required
          />
          {touched.price && errors.price ? (
            <div className="invalid-feedback">{errors.price}</div>
          ) : (
            <small className="text-muted">Must be greater than or equal to 0</small>
          )}
        </div>

        <div className="col-md-4">
          <label className="form-label fw-semibold">
            Stock Quantity <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            step="1"
            min="0"
            name="stockQuantity"
            className={`form-control ${touched.stockQuantity && errors.stockQuantity ? 'is-invalid' : ''}`}
            value={formData.stockQuantity}
            onChange={handleChange}
            onBlur={() => handleBlur('stockQuantity')}
            required
          />
          {touched.stockQuantity && errors.stockQuantity ? (
            <div className="invalid-feedback">{errors.stockQuantity}</div>
          ) : (
            <small className="text-muted">Available inventory on hand</small>
          )}
        </div>

        <div className="col-md-4">
          <label className="form-label fw-semibold">
            Reorder Level <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            step="1"
            min="0"
            name="reorderLevel"
            className={`form-control ${touched.reorderLevel && errors.reorderLevel ? 'is-invalid' : ''}`}
            value={formData.reorderLevel}
            onChange={handleChange}
            onBlur={() => handleBlur('reorderLevel')}
            required
          />
          {touched.reorderLevel && errors.reorderLevel ? (
            <div className="invalid-feedback">{errors.reorderLevel}</div>
          ) : (
            <small className="text-muted">Triggers Low Stock warning when stock &le; level</small>
          )}
        </div>

        <div className="col-12">
          <label className="form-label fw-semibold">Image URL (Optional)</label>
          <input
            type="url"
            name="imageUrl"
            className="form-control"
            placeholder="https://images.example.com/product.png"
            value={formData.imageUrl}
            onChange={handleChange}
          />
        </div>

        <div className="col-12 mt-4 pt-3 border-top d-flex justify-content-end gap-2">
          <Link to={cancelPath} className="btn btn-outline-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary px-4 fw-semibold" disabled={isLoading}>
            {isLoading ? 'Saving...' : submitButtonText}
          </button>
        </div>
      </div>
    </form>
  );
};
