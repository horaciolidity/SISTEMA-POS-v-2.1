
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, User, Edit, Trash2, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const CustomersView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [customers] = useState([
    {
      id: '1',
      doc_type: 'DNI',
      doc_number: '12345678',
      name: 'Juan Pérez',
      email: 'juan@email.com',
      phone: '1234567890',
      address: 'Av. Corrientes 1234',
      total_spent: 1500.50,
      last_purchase: '2025-08-15'
    },
    {
      id: '2',
      doc_type: 'CUIT',
      doc_number: '20-12345678-9',
      name: 'María García',
      email: 'maria@email.com',
      phone: '0987654321',
      address: 'Av. Santa Fe 5678',
      total_spent: 850.00,
      last_purchase: '2025-08-20'
    }
  ]);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.doc_number.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCustomer = () => {
    toast({
      title: "🚧 Esta función no está implementada aún—¡pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀"
    });
  };

  const handleEditCustomer = () => {
    toast({
      title: "🚧 Esta función no está implementada aún—¡pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀"
    });
  };

  const handleDeleteCustomer = () => {
    toast({
      title: "🚧 Esta función no está implementada aún—¡pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀"
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-gray-600">Base de datos de clientes</p>
        </div>
        <Button onClick={handleAddCustomer} className="gradient-bg text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
            <CardContent className="p-4 flex items-center space-x-4">
                <User className="h-8 w-8 text-blue-600" />
                <div>
                    <p className="text-sm text-gray-600">Total Clientes</p>
                    <p className="text-2xl font-bold">{customers.length}</p>
                </div>
            </CardContent>
        </Card>
         <Card>
            <CardContent className="p-4 flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-bold">$</span>
                </div>
                <div>
                    <p className="text-sm text-gray-600">Gasto Total Promedio</p>
                    <p className="text-2xl font-bold">${(customers.reduce((sum, c) => sum + c.total_spent, 0) / customers.length).toFixed(2)}</p>
                </div>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <div className="relative pt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, documento o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Nombre</th>
                  <th className="text-left p-2">Contacto</th>
                  <th className="text-left p-2">Documento</th>
                  <th className="text-right p-2">Gasto Total</th>
                  <th className="text-left p-2">Última Compra</th>
                  <th className="text-center p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer, index) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-2 font-medium">{customer.name}</td>
                    <td className="p-2 text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <Mail className="h-3 w-3" /> <span>{customer.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                            <Phone className="h-3 w-3" /> <span>{customer.phone}</span>
                        </div>
                    </td>
                    <td className="p-2 text-gray-600">{customer.doc_type}: {customer.doc_number}</td>
                    <td className="p-2 text-right font-mono">${customer.total_spent.toFixed(2)}</td>
                    <td className="p-2 text-gray-600">{new Date(customer.last_purchase).toLocaleDateString()}</td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Button variant="ghost" size="icon" onClick={handleEditCustomer}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleDeleteCustomer} className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomersView;
