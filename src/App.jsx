import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { POSProvider } from '@/contexts/POSContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';

// 📦 Páginas principales
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
        <title>Sistema POS - Dashboard</title>
        <meta
          name="description"
          content="Sistema POS moderno con dashboard, ventas, inventario, clientes y reportes."
        />
      </Helmet>

      <Router>
        <AuthProvider>
          <POSProvider>
            <Routes>
              {/* === Páginas públicas (sin layout) === */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/display" element={<CustomerDisplay />} />

              {/* === Rutas protegidas (con layout) === */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DashboardPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/pos"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <POSPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/inventory"
                element={
                  <ProtectedRoute roles={['manager', 'admin']}>
                    <Layout>
                      <InventoryPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/inventory/movements"
                element={
                  <ProtectedRoute roles={['manager', 'admin']}>
                    <Layout>
                      <StockMovementsView />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/customers"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <CustomersPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reports"
                element={
                  <ProtectedRoute roles={['manager', 'admin']}>
                    <Layout>
                      <ReportsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/cash"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <CashPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <Layout>
                      <AdminPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* === Redirección raíz === */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

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
