// src/pages/POSPage.jsx
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import POSView from '@/components/pos/POSView';
import Cart from '@/components/pos/Cart';
import CustomerSelector from '@/components/pos/CustomerSelector';
import { usePOS } from '@/contexts/POSContext';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangle } from 'lucide-react';

const POSPage = () => {
  const { cashSession } = usePOS();
  const { toast } = useToast();

  useEffect(() => {
    if (!cashSession) {
      toast({
        title: 'Caja cerrada',
        description: 'Debes abrir una caja para comenzar a vender.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  }, [cashSession, toast]);

  return (
    <>
      <Helmet>
        <title>Punto de Venta - Sistema POS</title>
        <meta
          name="description"
          content="Interfaz moderna de punto de venta para procesar transacciones"
        />
      </Helmet>

      <Layout>
        {/* Barra superior con cliente actual */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              💳 Punto de Venta
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Gestiona tus ventas en tiempo real
            </span>
          </div>

          {/* Selector de cliente */}
          <CustomerSelector />
        </div>

        {/* Vista principal */}
        <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 transition-colors">
          {/* Panel de productos */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
            <POSView />
          </div>

          {/* Carrito y resumen */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden relative">
            {!cashSession ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100/90 dark:bg-gray-900/80 z-20 text-center p-6">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mb-3" />
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  Caja cerrada
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Abre una caja desde la sección <strong>“Caja”</strong> para comenzar a vender.
                </p>
              </div>
            ) : (
              <Cart />
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default POSPage;
