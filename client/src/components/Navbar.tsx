import React from 'react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  return (
    <header className="erp-topbar">
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-outline-secondary btn-sm d-lg-none"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation"
        >
          ☰
        </button>
        <div className="d-none d-sm-block">
          <span className="fw-semibold text-secondary small text-uppercase">ERP System:</span>{' '}
          <span className="fw-bold text-dark">E-Commerce Management</span>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2">
        <span className="badge bg-success-subtle text-success border border-success-subtle d-none d-md-inline-block">
          ● System Online
        </span>
        <Link to="/products/add" className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1">
          <span>➕</span> <span className="d-none d-sm-inline">Add Product</span>
        </Link>
        <Link to="/orders/create" className="btn btn-primary btn-sm d-flex align-items-center gap-1">
          <span>🛒</span> <span className="d-none d-sm-inline">Create Order</span>
        </Link>
      </div>
    </header>
  );
};
