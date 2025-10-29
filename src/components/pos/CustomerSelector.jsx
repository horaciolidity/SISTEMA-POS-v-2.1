
import React, { useState } from 'react';
import { Search, Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePOS } from '@/contexts/POSContext';
import { useToast } from '@/components/ui/use-toast';

const CustomerSelector = () => {
  const { customer, setCustomer } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    doc_type: 'DNI',
    doc_number: '',
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const { toast } = useToast();

  // Mock customers data
  const [customers] = useState([
    {
      id: '1',
      doc_type: 'DNI',
      doc_number: '12345678',
      name: 'Juan Pérez',
      email: 'juan@email.com',
      phone: '1234567890',
      address: 'Av. Corrientes 1234'
    },
    {
      id: '2',
      doc_type: 'CUIT',
      doc_number: '20-12345678-9',
      name: 'María García',
      email: 'maria@email.com',
      phone: '0987654321',
      address: 'Av. Santa Fe 5678'
    }
  ]);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.doc_number.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectCustomer = (selectedCustomer) => {
    setCustomer(selectedCustomer);
    setSearchTerm('');
    toast({
      title: "Cliente seleccionado",
      description: selectedCustomer.name,
      duration: 2000
    });
  };

  const handleCreateCustomer = () => {
    if (!newCustomer.name || !newCustomer.doc_number) {
      toast({
        title: "Datos incompletos",
        description: "Nombre y documento son obligatorios",
        variant: "destructive",
        duration: 3000
      });
      return;
    }

    const customerToAdd = {
      id: Date.now().toString(),
      ...newCustomer
    };

    setCustomer(customerToAdd);
    setShowDialog(false);
    setNewCustomer({
      doc_type: 'DNI',
      doc_number: '',
      name: '',
      email: '',
      phone: '',
      address: ''
    });

    toast({
      title: "Cliente creado",
      description: `${customerToAdd.name} agregado exitosamente`,
      duration: 3000
    });
  };

  return (
    <div className="flex items-center space-x-2">
      {customer ? (
        <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
          <User className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">{customer.name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCustomer(null)}
            className="text-blue-600 hover:text-blue-800 p-1"
          >
            ×
          </Button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          {searchTerm && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-48 overflow-auto">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCustomer(c)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <div className="font-medium">{c.name}</div>
                    <div className="text-sm text-gray-500">{c.doc_type}: {c.doc_number}</div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  No se encontraron clientes
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="doc_type">Tipo de Documento</Label>
                <Select
                  value={newCustomer.doc_type}
                  onValueChange={(value) => setNewCustomer({...newCustomer, doc_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DNI">DNI</SelectItem>
                    <SelectItem value="CUIT">CUIT</SelectItem>
                    <SelectItem value="CUIL">CUIL</SelectItem>
                    <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="doc_number">Número de Documento</Label>
                <Input
                  id="doc_number"
                  value={newCustomer.doc_number}
                  onChange={(e) => setNewCustomer({...newCustomer, doc_number: e.target.value})}
                  placeholder="12345678"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                placeholder="Juan Pérez"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                placeholder="juan@email.com"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                placeholder="1234567890"
              />
            </div>
            
            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                placeholder="Av. Corrientes 1234"
              />
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button onClick={handleCreateCustomer} className="flex-1">
                Crear Cliente
              </Button>
              <Button variant="outline" onClick={() => setShowDialog(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerSelector;
