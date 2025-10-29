
import React from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import InventoryView from '@/components/inventory/InventoryView';

const InventoryPage = () => {
  return (
    <>
      <Helmet>
        <title>Inventario - Sistema POS</title>
        <meta name="description" content="Gestión de productos e inventario" />
      </Helmet>
      
      <Layout>
        <InventoryView />
      </Layout>
    </>
  );
};

export default InventoryPage;
