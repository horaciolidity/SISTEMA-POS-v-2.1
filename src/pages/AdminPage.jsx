import React, { useState } from "react";
import { Helmet } from "react-helmet";
import Layout from "@/components/Layout";
import AdminView from "@/components/admin/AdminView";
import AdminDashboard from "@/components/admin/AdminDashboard";
import EmployeeShifts from "@/components/admin/EmployeeShifts";
import SuppliersView from "@/components/suppliers/SuppliersView"; // 👈 Nuevo módulo
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BarChart3,
  BarChart4,
  Users,
  Building2,
} from "lucide-react";

const AdminPage = () => {
  const [tab, setTab] = useState("summary"); // summary | analytics | shifts | suppliers

  return (
    <>
      <Helmet>
        <title>Administración - Sistema POS</title>
        <meta
          name="description"
          content="Panel de administración con resumen, estadísticas, turnos y gestión de proveedores"
        />
      </Helmet>

      <Layout>
        <div className="p-6 space-y-6">
          {/* Encabezado principal */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Panel de Administración
            </h1>
          </div>

          {/* Tabs de navegación del panel */}
          <Tabs value={tab} onValueChange={setTab} className="space-y-6">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Resumen
              </TabsTrigger>

              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart4 className="h-4 w-4" />
                Estadísticas
              </TabsTrigger>

              <TabsTrigger value="shifts" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Turnos
              </TabsTrigger>

              <TabsTrigger value="suppliers" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Proveedores
              </TabsTrigger>
            </TabsList>

            {/* === Resumen (métricas, stock bajo, flujo de caja, acciones) === */}
            <TabsContent value="summary">
              <AdminView />
            </TabsContent>

            {/* === Estadísticas (gráficos interactivos) === */}
            <TabsContent value="analytics">
              <AdminDashboard />
            </TabsContent>

            {/* === Turnos de empleados === */}
            <TabsContent value="shifts">
              <EmployeeShifts />
            </TabsContent>

            {/* === Proveedores (alta, edición, deuda, crédito, contacto) === */}
            <TabsContent value="suppliers">
              <SuppliersView />
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </>
  );
};

export default AdminPage;
