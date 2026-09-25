import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ProductListPage } from './pages/ProductListPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ProductAddPage } from './pages/ProductAddPage';
import { ProductEditPage } from './pages/ProductEditPage';
import { OrderListPage } from './pages/OrderListPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { OrderCreatePage } from './pages/OrderCreatePage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Products - specific routes BEFORE dynamic :id */}
          <Route path="products" element={<ProductListPage />} />
          <Route path="products/add" element={<ProductAddPage />} />
          <Route path="products/edit/:id" element={<ProductEditPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />

          {/* Orders - specific routes BEFORE dynamic :id */}
          <Route path="orders" element={<OrderListPage />} />
          <Route path="orders/create" element={<OrderCreatePage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
