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
        <title>Sistema POS Moderno - Dashboard</title>
        <meta
          name="description"
          content="Sistema de punto de venta moderno con dashboard, gestión de inventario, clientes, reportes y más."
        />
      </Helmet>

      <Router>
        <AuthProvider>
          <POSProvider>
            <Layout>
              <Routes>
                {/* 🟣 Login (sin layout) */}
                <Route path="/login" element={<LoginPage />} />

                {/* 🟢 Pantalla pública del cliente */}
                <Route path="/display" element={<CustomerDisplay />} />

                {/* =========================
                    🧩 RUTAS PROTEGIDAS
                ============================ */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/pos"
                  element={
                    <ProtectedRoute>
                      <POSPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/inventory"
                  element={
                    <ProtectedRoute roles={['manager', 'admin']}>
                      <InventoryPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/inventory/movements"
                  element={
                    <ProtectedRoute roles={['manager', 'admin']}>
                      <StockMovementsView />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/customers"
                  element={
                    <ProtectedRoute>
                      <CustomersPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute roles={['manager', 'admin']}>
                      <ReportsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/cash"
                  element={
                    <ProtectedRoute>
                      <CashPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />

                {/* 🏠 Redirección raíz */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* 🚫 Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>

              <Toaster />
            </Layout>
          </POSProvider>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
