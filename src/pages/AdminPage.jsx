
import React from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import AdminView from '@/components/admin/AdminView';

const AdminPage = () => {
  return (
    <>
      <Helmet>
        <title>Administración - Sistema POS</title>
        <meta name="description" content="Panel de administración del sistema" />
      </Helmet>
      
      <Layout>
        <AdminView />
      </Layout>
    </>
  );
};

export default AdminPage;
