import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { POSProvider } from '@/contexts/POSContext';
import ProtectedRoute from '@/components/ProtectedRoute';

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

      {/* 🧠 Router DEBE envolver a los contextos */}
      <Router>
        <AuthProvider>
          <POSProvider>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
              <Routes>
                {/* Login */}
                <Route path="/login" element={<LoginPage />} />

                {/* Redirección raíz */}
                <Route path="/" element={<Navigate to="/pos" replace />} />

                {/* Punto de venta */}
                <Route
                  path="/pos"
                  element={
                    <ProtectedRoute>
                      <POSPage />
                    </ProtectedRoute>
                  }
                />

                {/* Inventario */}
                <Route
                  path="/inventory"
                  element={
                    <ProtectedRoute roles={['manager', 'admin']}>
                      <InventoryPage />
                    </ProtectedRoute>
                  }
                />

                {/* Movimientos de stock */}
                <Route
                  path="/inventory/movements"
                  element={
                    <ProtectedRoute roles={['manager', 'admin']}>
                      <StockMovementsView />
                    </ProtectedRoute>
                  }
                />

                {/* Clientes */}
                <Route
                  path="/customers"
                  element={
                    <ProtectedRoute>
                      <CustomersPage />
                    </ProtectedRoute>
                  }
                />

                {/* Reportes */}
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute roles={['manager', 'admin']}>
                      <ReportsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Caja */}
                <Route
                  path="/cash"
                  element={
                    <ProtectedRoute>
                      <CashPage />
                    </ProtectedRoute>
                  }
                />

                {/* Administración */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />

                {/* Pantalla de cliente */}
                <Route path="/display" element={<CustomerDisplay />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/pos" replace />} />
              </Routes>

              <Toaster />
            </div>
          </POSProvider>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
