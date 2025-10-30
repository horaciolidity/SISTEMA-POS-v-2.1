import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { POSProvider } from '@/contexts/POSContext';
import ProtectedRoute from '@/components/ProtectedRoute';

import LoginPage from '@/pages/LoginPage';
import POSPage from '@/pages/POSPage';
import InventoryPage from '@/pages/InventoryPage';
import CustomersPage from '@/pages/CustomersPage';
import ReportsPage from '@/pages/ReportsPage';
import CashPage from '@/pages/CashPage';
import AdminPage from '@/pages/AdminPage';
import CustomerDisplay from '@/pages/CustomerDisplay';

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

      <AuthProvider>
        <POSProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
              <Routes>
                {/* 🔐 Autenticación */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Navigate to="/pos" replace />} />

                {/* 💵 Punto de Venta */}
                <Route
                  path="/pos"
                  element={
                    <ProtectedRoute>
                      <POSPage />
                    </ProtectedRoute>
                  }
                />

                {/* 📦 Inventario */}
                <Route
                  path="/inventory"
                  element={
                    <ProtectedRoute>
                      <InventoryPage />
                    </ProtectedRoute>
                  }
                />

                {/* 👥 Clientes */}
                <Route
                  path="/customers"
                  element={
                    <ProtectedRoute>
                      <CustomersPage />
                    </ProtectedRoute>
                  }
                />

                {/* 📊 Reportes (solo gerente y admin) */}
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute requiredRole="manager">
                      <ReportsPage />
                    </ProtectedRoute>
                  }
                />

                {/* 🏧 Caja */}
                <Route
                  path="/cash"
                  element={
                    <ProtectedRoute>
                      <CashPage />
                    </ProtectedRoute>
                  }
                />

                {/* ⚙️ Administración (solo admin) */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />

                {/* 🖥️ Display del cliente */}
                <Route path="/display" element={<CustomerDisplay />} />
              </Routes>

              <Toaster />
            </div>
          </Router>
        </POSProvider>
      </AuthProvider>
    </>
  );
}

export default App;
