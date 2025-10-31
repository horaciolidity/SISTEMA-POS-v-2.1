import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { POSProvider } from '@/contexts/POSContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';

// 📦 Páginas
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import POSPage from '@/pages/POSPage';
import InventoryPage from '@/pages/InventoryPage';
import CustomersPage from '@/pages/CustomersPage';
import ReportsPage from '@/pages/ReportsPage';
import CashPage from '@/pages/CashPage';
import AdminPage from '@/pages/AdminPage';
import CustomerDisplay from '@/pages/CustomerDisplay';
import StockMovementsView from '@/components/inventory/StockMovementsView';

function App() {
  return (
    <>
      <Helmet>
        <title>Sistema POS Moderno</title>
        <meta
          name="description"
          content="Sistema POS moderno con gestión de ventas, inventario, reportes y más."
        />
      </Helmet>

      <Router>
        <AuthProvider>
          <POSProvider>
            <Routes>
              {/* === Páginas públicas (sin layout) === */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/display" element={<CustomerDisplay />} />

              {/* === Grupo de rutas protegidas dentro del Layout === */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="pos" element={<POSPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="inventory/movements" element={<StockMovementsView />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="cash" element={<CashPage />} />
                <Route path="admin" element={<AdminPage />} />
              </Route>

              {/* === Fallback === */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>

            <Toaster />
          </POSProvider>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
