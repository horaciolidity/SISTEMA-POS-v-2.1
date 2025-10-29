
import React from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import CustomersView from '@/components/customers/CustomersView';

const CustomersPage = () => {
  return (
    <>
      <Helmet>
        <title>Clientes - Sistema POS</title>
        <meta name="description" content="Gestión de clientes y base de datos" />
      </Helmet>
      
      <Layout>
        <CustomersView />
      </Layout>
    </>
  );
};

export default CustomersPage;
