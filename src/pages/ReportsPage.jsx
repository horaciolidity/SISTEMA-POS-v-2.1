
import React from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import ReportsView from '@/components/reports/ReportsView';

const ReportsPage = () => {
  return (
    <>
      <Helmet>
        <title>Reportes - Sistema POS</title>
        <meta name="description" content="Reportes de ventas y análisis de negocio" />
      </Helmet>
      
      <Layout>
        <ReportsView />
      </Layout>
    </>
  );
};

export default ReportsPage;
