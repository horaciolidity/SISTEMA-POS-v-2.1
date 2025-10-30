import React, { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Edit3, Save, Plus, X, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import dayjs from "dayjs";

const CustomersView = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [form, setForm] = useState({
    id: "",
    name: "",
    doc_number: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  /* === Cargar datos === */
  useEffect(() => {
    const storedCustomers = JSON.parse(localStorage.getItem("pos_customers") || "[]");
    const storedSales = JSON.parse(localStorage.getItem("pos_sales") || "[]");
    setCustomers(storedCustomers);
    setSales(storedSales);
  }, []);

  /* === Guardar === */
  const saveCustomers = (list) => {
    localStorage.setItem("pos_customers", JSON.stringify(list));
    setCustomers(list);
  };

  /* === Cambios en formulario === */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* === Agregar cliente === */
  const handleAdd = () => {
    if (!form.name) {
      toast({
        title: "Faltan datos",
        description: "Debes ingresar al menos el nombre del cliente",
        variant: "destructive",
      });
      return;
    }

    const newCustomer = {
      ...form,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    const updated = [...customers, newCustomer];
    saveCustomers(updated);

    toast({
      title: "✅ Cliente agregado",
      description: `${newCustomer.name} fue registrado correctamente`,
    });

    resetForm();
  };

  /* === Editar / Guardar === */
  const handleEdit = (c) => {
    setEditingId(c.id);
    setForm(c);
  };

  const handleSaveEdit = () => {
    const updated = customers.map((c) =>
      c.id === editingId ? { ...form, id: editingId } : c
    );
    saveCustomers(updated);
    setEditingId(null);
    toast({ title: "💾 Cliente actualizado" });
    resetForm();
  };

  /* === Eliminar === */
  const handleDelete = (id) => {
    if (!confirm("¿Eliminar este cliente?")) return;
    const updated = customers.filter((c) => c.id !== id);
    saveCustomers(updated);
    toast({ title: "🗑️ Cliente eliminado" });
  };

  /* === Reset === */
  const resetForm = () =>
    setForm({
      id: "",
      name: "",
      doc_number: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
    });

  /* === Filtro de búsqueda === */
  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.doc_number || "").includes(search)
    );
  }, [search, customers]);

  /* === Historial de compras === */
  const getPurchaseHistory = (customerId) => {
    return sales.filter((s) => s.customer_id === customerId);
  };

  return (
    <div className="p-6 space-y-6">
      {/* === Formulario principal === */}
      <Card className="border-gray-200 dark:border-gray-700 dark:bg-gray-800/70">
        <CardHeader>
          <CardTitle>{editingId ? "Editar Cliente" : "Registrar Cliente"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Nombre</Label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div>
              <Label>DNI / CUIT</Label>
              <Input
                name="doc_number"
                value={form.doc_number}
                onChange={handleChange}
                placeholder="Ej: 12345678"
              />
            </div>

            <div>
              <Label>Teléfono</Label>
              <Input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+54 9 11 1234 5678"
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="correo@cliente.com"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Dirección</Label>
              <Input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Ej: Av. Corrientes 1234"
              />
            </div>

            <div className="md:col-span-3">
              <Label>Notas / Observaciones</Label>
              <Input
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Ej: Cliente habitual, pago a crédito..."
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            {editingId ? (
              <>
                <Button onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" /> Guardar Cambios
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4 mr-2" /> Cancelar
                </Button>
              </>
            ) : (
              <Button onClick={handleAdd} className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Agregar Cliente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* === Búsqueda y tabla de clientes === */}
      <Card className="border-gray-200 dark:border-gray-700 dark:bg-gray-800/70">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Base de Clientes ({customers.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre o documento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <p className="text-gray-500">No hay clientes registrados.</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-300 dark:border-gray-700">
                    <th>Nombre</th>
                    <th>DNI/CUIT</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th>Dirección</th>
                    <th>Última compra</th>
                    <th>Total histórico</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((c) => {
                    const history = getPurchaseHistory(c.id);
                    const totalSpent = history.reduce((sum, s) => sum + s.total, 0);
                    const lastPurchase = history.length
                      ? dayjs(history[history.length - 1].closed_at).format("DD/MM/YYYY")
                      : "-";
                    return (
                      <tr
                        key={c.id}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                      >
                        <td className="py-1">{c.name}</td>
                        <td>{c.doc_number}</td>
                        <td>{c.phone}</td>
                        <td>{c.email}</td>
                        <td>{c.address}</td>
                        <td>{lastPurchase}</td>
                        <td>${totalSpent.toFixed(2)}</td>
                        <td className="flex gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleEdit(c)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDelete(c.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomersView;
