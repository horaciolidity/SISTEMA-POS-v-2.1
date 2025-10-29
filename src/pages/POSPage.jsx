
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import POSView from '@/components/pos/POSView';
import Cart from '@/components/pos/Cart';
import { usePOS } from '@/contexts/POSContext';
import { useToast } from '@/components/ui/use-toast';

const POSPage = () => {
  const { cashSession } = usePOS();
  const { toast } = useToast();

  useEffect(() => {
    if (!cashSession) {
      toast({
        title: "Caja cerrada",
        description: "Necesitas abrir la caja para realizar ventas",
        variant: "destructive",
        duration: 5000
      });
    }
  }, [cashSession, toast]);

  return (
    <>
      <Helmet>
        <title>Punto de Venta - Sistema POS</title>
        <meta name="description" content="Interfaz de punto de venta para procesar transacciones" />
      </Helmet>
      
      <Layout>
        <div className="h-full pos-grid p-4">
          <POSView />
          <Cart />
        </div>
      </Layout>
    </>
  );
};

export default POSPage;
