import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Protege rutas según autenticación y rol.
 * - Si no hay sesión: redirige al login.
 * - Si hay sesión pero no tiene permisos: muestra mensaje o redirige al POS.
 * - Si cumple: renderiza el contenido.
 */
const ProtectedRoute = ({ children, roles = [], requiredRole }) => {
  const { user, loading, hasRole } = useAuth();

  // Combina roles si se pasa uno solo
  const allowedRoles = requiredRole
    ? Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole]
    : roles;

  // ⏳ Mostrar cargando mientras se verifica sesión
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // 🚪 Si no hay sesión activa
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔒 Si hay restricción de roles
  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    // Admin siempre puede acceder a todo
    if (user.role === "admin") return children;

    // Si no tiene permiso, mostramos un mensaje elegante
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700">
          <h1 className="text-2xl font-bold text-red-600 mb-3">
            🚫 Acceso Denegado
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            No tienes permisos para acceder a esta sección.
          </p>
          <a
            href="/pos"
            className="inline-block mt-6 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
          >
            Volver al Punto de Venta
          </a>
        </div>
      </div>
    );
  }

  // ✅ Si pasa todas las validaciones
  return children;
};

export default ProtectedRoute;
