import React, { useState, useEffect } from 'react';
import { Search, Plus, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePOS } from '@/contexts/POSContext';
import { useToast } from '@/components/ui/use-toast';

const CustomerSelector = () => {
  const { customer, setCustomer } = usePOS();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    doc_type: 'DNI',
    doc_number: '',
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  /* ===============================
     📦 Cargar / Guardar clientes
  =============================== */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('pos_customers') || '[]');
    setCustomers(saved);
  }, []);

  const saveCustomers = (list) => {
    setCustomers(list);
    localStorage.setItem('pos_customers', JSON.stringify(list));
  };

  /* ===============================
     🔎 Filtrar clientes
  =============================== */
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.doc_number.includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ===============================
     ✅ Seleccionar cliente
  =============================== */
  const handleSelectCustomer = (selectedCustomer) => {
    setCustomer(selectedCustomer);
    setSearchTerm('');
    toast({
      title: 'Cliente seleccionado',
      description: selectedCustomer.name,
      duration: 2000,
    });
  };

  /* ===============================
     🧾 Crear cliente nuevo
  =============================== */
  const handleCreateCustomer = () => {
    if (!newCustomer.name || !newCustomer.doc_number) {
      toast({
        title: 'Datos incompletos',
        description: 'Nombre y documento son obligatorios.',
        variant: 'destructive',
      });
      return;
    }

    // Evitar duplicado por número de documento
    const exists = customers.some(
      (c) => c.doc_number === newCustomer.doc_number
    );
    if (exists) {
      toast({
        title: 'Cliente existente',
        description: 'Ya hay un cliente con ese documento.',
        variant: 'destructive',
      });
      return;
    }

    const newEntry = {
      id: crypto.randomUUID(),
      ...newCustomer,
      created_at: new Date().toISOString(),
    };

    const updated = [...customers, newEntry];
    saveCustomers(updated);
    setCustomer(newEntry);
    setShowDialog(false);
    setNewCustomer({
      doc_type: 'DNI',
      doc_number: '',
      name: '',
      email: '',
      phone: '',
      address: '',
    });

    toast({
      title: 'Cliente agregado',
      description: newEntry.name,
    });
  };

  /* ===============================
     🧹 Limpiar cliente actual
  =============================== */
  const handleClearCustomer = () => {
    setCustomer(null);
    toast({ title: 'Cliente desasignado' });
  };

  /* ===============================
     🧾 Render principal
  =============================== */
  return (
    <div className="flex items-center space-x-2 relative">
      {/* Cliente actual */}
      {customer ? (
        <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
          <User className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            {customer.name}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearCustomer}
            className="text-blue-600 hover:text-blue-800 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        /* Buscador */
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
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 max-h-48 overflow-auto">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCustomer(c)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <div className="font-medium">{c.name}</div>
                    <div className="text-sm text-gray-500">
                      {c.doc_type}: {c.doc_number}
                    </div>
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

      {/* Botón / Diálogo nuevo cliente */}
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
                <Label>Tipo de Documento</Label>
                <Select
                  value={newCustomer.doc_type}
                  onValueChange={(v) =>
                    setNewCustomer({ ...newCustomer, doc_type: v })
                  }
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
                <Label>Número</Label>
                <Input
                  value={newCustomer.doc_number}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      doc_number: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label>Nombre Completo</Label>
              <Input
                value={newCustomer.name}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={newCustomer.email}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, email: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Teléfono</Label>
              <Input
                value={newCustomer.phone}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, phone: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Dirección</Label>
              <Input
                value={newCustomer.address}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, address: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={handleCreateCustomer}>
                Crear
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDialog(false)}
              >
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
