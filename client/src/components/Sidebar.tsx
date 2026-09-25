import React from 'react';
import { NavLink, Link } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className="sidebar-backdrop d-lg-none" onClick={onClose} />}

      <aside className={`erp-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="erp-sidebar-brand justify-content-between">
          <Link to="/dashboard" className="text-white text-decoration-none d-flex align-items-center gap-2" onClick={onClose}>
            <span style={{ fontSize: '1.4rem' }}>📦</span>
            <div>
              <div className="lh-sm">ERP Manager</div>
              <small style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 400 }}>E-Commerce Core</small>
            </div>
          </Link>
          <button
            className="btn btn-sm text-white d-lg-none p-0 border-0"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <ul className="erp-nav flex-grow-1">
          <li className="erp-nav-item">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `erp-nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="erp-nav-icon">📊</span>
              <span>Dashboard</span>
            </NavLink>
          </li>

          <li className="erp-nav-item">
            <NavLink
              to="/products"
              end={false}
              className={({ isActive }) => `erp-nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="erp-nav-icon">📦</span>
              <span>Products & Inventory</span>
            </NavLink>
          </li>

          <li className="erp-nav-item">
            <NavLink
              to="/orders"
              end={false}
              className={({ isActive }) => `erp-nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="erp-nav-icon">📑</span>
              <span>Orders</span>
            </NavLink>
          </li>
        </ul>

        {/* Footer info box in sidebar */}
        <div className="p-3 border-top border-secondary border-opacity-25 small text-muted">
          <div className="text-white small fw-semibold">Academic Project</div>
          <div style={{ fontSize: '0.75rem' }}>Modules: Inventory & Orders</div>
        </div>
      </aside>
    </>
  );
};
