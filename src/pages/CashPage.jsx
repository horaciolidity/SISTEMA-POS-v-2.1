
import React from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import CashView from '@/components/cash/CashView';

const CashPage = () => {
  return (
    <>
      <Helmet>
        <title>Caja - Sistema POS</title>
        <meta name="description" content="Gestión de caja y arqueos" />
      </Helmet>
      
      <Layout>
        <CashView />
      </Layout>
    </>
  );
};

export default CashPage;
