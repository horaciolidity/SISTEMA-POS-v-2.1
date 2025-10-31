// src/pages/DashboardPage.jsx
import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DollarSign, ShoppingCart, Package, Users } from 'lucide-react';
import { usePOS } from '@/contexts/POSContext';
import { useAuth } from '@/contexts/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const { cashSession } = usePOS();

  return (
    <>
      <Helmet>
        <title>Dashboard - Sistema POS</title>
        <meta
          name="description"
          content="Resumen general del sistema POS: ventas, caja, inventario y más."
        />
      </Helmet>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            👋 Bienvenido{user?.display_name ? `, ${user.display_name}` : ''}!
          </h1>
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                <DollarSign className="h-5 w-5 text-green-500" /> Ventas del día
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">$0.00</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                <ShoppingCart className="h-5 w-5 text-purple-500" /> Caja actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {cashSession ? 'Abierta' : 'Cerrada'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                <Package className="h-5 w-5 text-blue-500" /> Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">128</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                <Users className="h-5 w-5 text-yellow-500" /> Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">56</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          Este es un resumen general de tu negocio. Usa el menú lateral para
          acceder a las demás secciones (POS, Inventario, Clientes, etc.).
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
