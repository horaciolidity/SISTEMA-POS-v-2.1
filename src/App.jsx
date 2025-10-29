
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

function App() {
  return (
    <>
      <Helmet>
        <title>Sistema POS Moderno - Punto de Venta</title>
        <meta name="description" content="Sistema de punto de venta moderno con gestión de inventario, clientes, reportes y más" />
      </Helmet>
      
      <AuthProvider>
        <POSProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Navigate to="/pos" replace />} />
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
                    <ProtectedRoute>
                      <InventoryPage />
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
                    <ProtectedRoute requiredRole="manager">
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
                    <ProtectedRoute requiredRole="admin">
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
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
