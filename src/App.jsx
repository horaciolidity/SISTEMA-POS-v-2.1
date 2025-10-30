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
        <title>Sistema POS Moderno - Punto de Venta</title>
        <meta
          name="description"
          content="Sistema de punto de venta moderno con gestión de inventario, clientes, reportes y más"
        />
      </Helmet>

      {/* 🌐 Router envuelve todos los contextos */}
      <Router>
        <AuthProvider>
          <POSProvider>
            {/* 🖥️ Fondo global (sin min-h-screen para no tapar Layout) */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
              <Routes>
                {/* Login */}
                <Route path="/login" element={<LoginPage />} />

                {/* Pantalla pública del cliente */}
                <Route path="/display" element={<CustomerDisplay />} />

                {/* =========================
                    🧩 RUTAS PROTEGIDAS CON LAYOUT
                ============================ */}
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

                {/* Redirección raíz */}
                <Route path="/" element={<Navigate to="/pos" replace />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/pos" replace />} />
              </Routes>

              {/* Toasts globales */}
              <Toaster />
            </div>
          </POSProvider>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
