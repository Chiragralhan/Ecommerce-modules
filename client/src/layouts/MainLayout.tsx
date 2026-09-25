import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  return (
    <div className="erp-wrapper">
      {/* Reusable Left Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="erp-main-content">
        {/* Top Navbar */}
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Dynamic Route Pages */}
        <main className="p-3 p-md-4 flex-grow-1">
          <Outlet />
        </main>

        {/* Clean ERP Footer */}
        <footer className="bg-white border-top py-3 px-4 text-muted small d-flex flex-wrap justify-content-between align-items-center">
          <span>ERP-Based E-Commerce Management System &bull; College Project</span>
          <span>Core Modules: Product & Inventory | Order Management</span>
        </footer>
      </div>
    </div>
  );
};
