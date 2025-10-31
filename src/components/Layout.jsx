import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom"; // 👈 agregado Outlet
import { motion } from "framer-motion";
import {
  BarChart3,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

/**
 * 📐 Layout general del sistema POS
 * - Muestra barra lateral, barra superior y tema claro/oscuro
 * - Redirige automáticamente si no hay usuario autenticado
 */
const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ===================== 🔐 Redirección segura ===================== */
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  if (!user) return null;

  /* ===================== 📋 Menú dinámico según rol ===================== */
  const menuItems = [
    {
      path: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      roles: ["cashier", "manager", "admin"],
    },
    {
      path: "/pos",
      icon: ShoppingCart,
      label: "Punto de Venta",
      roles: ["cashier", "manager", "admin"],
    },
    {
      path: "/inventory",
      icon: Package,
      label: "Inventario",
      roles: ["manager", "admin"],
    },
    {
      path: "/customers",
      icon: Users,
      label: "Clientes",
      roles: ["cashier", "manager", "admin"],
    },
    {
      path: "/reports",
      icon: BarChart3,
      label: "Reportes",
      roles: ["manager", "admin"],
    },
    {
      path: "/cash",
      icon: DollarSign,
      label: "Caja",
      roles: ["cashier", "manager", "admin"],
    },
    {
      path: "/admin",
      icon: Settings,
      label: "Administración",
      roles: ["admin"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
      {/* === Overlay móvil === */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* === Sidebar === */}
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg lg:relative lg:translate-x-0 lg:shadow-none"
      >
        <div className="flex h-full flex-col">
          {/* === Header === */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              POS Sistema
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* === User Info === */}
          <div className="p-4 border-b dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-semibold">
                {user?.display_name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {user?.display_name || "Empleado"}
                </p>
                <p className="text-sm text-gray-500 capitalize dark:text-gray-400">
                  {user?.role || "sin rol"}
                </p>
              </div>
            </div>
          </div>

          {/* === Navegación === */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* === Logout === */}
          <div className="p-4 border-t dark:border-gray-700">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={logout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </motion.div>

      {/* === Main Content === */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* === Top bar === */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            {/* Toggle sidebar */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5 text-gray-700 dark:text-gray-200" />
            </Button>

            {/* Fecha y tema */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                title="Cambiar tema"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-yellow-400" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-700" />
                )}
              </button>

              <span className="text-sm text-gray-500 dark:text-gray-300 select-none">
                {new Date().toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* === Contenido principal === */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
