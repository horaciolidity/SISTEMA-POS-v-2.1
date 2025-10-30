import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Save, Trash2, RefreshCw, Phone, Mail, Building2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const SuppliersView = () => {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({
    id: "",
    name: "",
    company: "",
    email: "",
    phone: "",
    category: "",
    balance: "",
  });

  /* === Cargar datos iniciales === */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("pos_suppliers") || "[]");
    setSuppliers(stored);
  }, []);

  /* === Guardar proveedores === */
  const saveSuppliers = (list) => {
    localStorage.setItem("pos_suppliers", JSON.stringify(list));
    setSuppliers(list);
  };

  /* === Manejar formulario === */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* === Agregar / actualizar proveedor === */
  const handleAdd = () => {
    if (!form.name || !form.company) {
      toast({
        title: "Faltan campos",
        description: "Completa al menos el nombre y la empresa",
        variant: "destructive",
      });
      return;
    }

    const newSupplier = {
      ...form,
      id: form.id || crypto.randomUUID(),
      balance: parseFloat(form.balance || 0),
    };

    let updated;
    if (form.id) {
      updated = suppliers.map((s) => (s.id === form.id ? newSupplier : s));
      toast({ title: "Proveedor actualizado", description: `${form.name} modificado correctamente.` });
    } else {
      updated = [...suppliers, newSupplier];
      toast({ title: "Proveedor agregado", description: `${form.name} registrado correctamente.` });
    }

    saveSuppliers(updated);
    setForm({
      id: "",
      name: "",
      company: "",
      email: "",
      phone: "",
      category: "",
      balance: "",
    });
  };

  /* === Editar proveedor === */
  const handleEdit = (supplier) => {
    setForm(supplier);
  };

  /* === Eliminar proveedor === */
  const handleDelete = (id) => {
    if (!confirm("¿Seguro que deseas eliminar este proveedor?")) return;
    const updated = suppliers.filter((s) => s.id !== id);
    saveSuppliers(updated);
    toast({ title: "Proveedor eliminado", description: "Se eliminó correctamente." });
  };

  /* === Totales === */
  const totalDebt = suppliers.reduce((sum, s) => sum + (s.balance < 0 ? Math.abs(s.balance) : 0), 0);
  const totalCredit = suppliers.reduce((sum, s) => sum + (s.balance > 0 ? s.balance : 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Gestión de Proveedores
        </h2>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> Actualizar
        </Button>
      </div>

      {/* Formulario */}
      <Card className="dark:bg-gray-800/70">
        <CardHeader>
          <CardTitle>{form.id ? "Editar Proveedor" : "Agregar Proveedor"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Nombre del Contacto</Label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ej: Juan Pérez"
              />
            </div>
            <div>
              <Label>Empresa</Label>
              <Input
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="Ej: Distribuidora Norte"
              />
            </div>
            <div>
              <Label>Rubro / Categoría</Label>
              <Input
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Ej: Alimentos, Limpieza..."
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Ej: contacto@empresa.com"
              />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Ej: +54 11 2233 4455"
              />
            </div>
            <div>
              <Label>Saldo</Label>
              <Input
                type="number"
                name="balance"
                value={form.balance}
                onChange={handleChange}
                placeholder="Ej: -15000 (deuda) o 5000 (a favor)"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <Button onClick={handleAdd} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {form.id ? "Guardar Cambios" : "Agregar Proveedor"}
            </Button>
            {form.id && (
              <Button
                variant="outline"
                onClick={() =>
                  setForm({ id: "", name: "", company: "", email: "", phone: "", category: "", balance: "" })
                }
              >
                Cancelar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Totales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="dark:bg-gray-800/70">
          <CardHeader>
            <CardTitle>Deuda total con proveedores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">${totalDebt.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800/70">
          <CardHeader>
            <CardTitle>Créditos a favor (anticipos)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${totalCredit.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de proveedores */}
      <Card className="dark:bg-gray-800/70">
        <CardHeader>
          <CardTitle>Listado de Proveedores ({suppliers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {suppliers.length === 0 ? (
            <p className="text-gray-500">No hay proveedores registrados aún.</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-300 dark:border-gray-700">
                    <th>Nombre</th>
                    <th>Empresa</th>
                    <th>Rubro</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Saldo</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                    >
                      <td>{s.name}</td>
                      <td className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        {s.company}
                      </td>
                      <td>{s.category}</td>
                      <td className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {s.email || "-"}
                      </td>
                      <td className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {s.phone || "-"}
                      </td>
                      <td
                        className={
                          s.balance < 0
                            ? "text-red-600 font-semibold"
                            : "text-green-600 font-semibold"
                        }
                      >
                        ${s.balance.toFixed(2)}
                      </td>
                      <td className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(s)}>
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(s.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SuppliersView;
