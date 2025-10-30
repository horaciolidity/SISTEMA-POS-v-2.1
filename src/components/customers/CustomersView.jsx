import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  User,
  Edit,
  Trash2,
  Mail,
  Phone,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

const CustomersView = () => {
  const { toast } = useToast();

  // =========================
  // 📦 Estado general
  // =========================
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    doc_type: "DNI",
    doc_number: "",
    address: "",
  });

  // =========================
  // 🔄 Cargar / Guardar
  // =========================
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("pos_customers") || "[]");
    setCustomers(saved);
  }, []);

  const saveCustomers = (data) => {
    setCustomers(data);
    localStorage.setItem("pos_customers", JSON.stringify(data));
  };

  // =========================
  // 🧮 Filtros / Promedios
  // =========================
  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.doc_number.includes(searchTerm) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  const avgSpent =
    customers.length > 0
      ? customers.reduce((sum, c) => sum + (c.total_spent || 0), 0) /
        customers.length
      : 0;

  // =========================
  // 🧾 CRUD de clientes
  // =========================
  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      doc_type: "DNI",
      doc_number: "",
      address: "",
    });
    setShowDialog(true);
  };

  const handleEditCustomer = (c) => {
    setEditingCustomer(c);
    setForm(c);
    setShowDialog(true);
  };

  const handleDeleteCustomer = (id) => {
    const updated = customers.filter((c) => c.id !== id);
    saveCustomers(updated);
    toast({ title: "Cliente eliminado", description: "El registro fue borrado correctamente." });
  };

  const handleSaveCustomer = () => {
    if (!form.name || !form.doc_number) {
      toast({
        title: "Datos incompletos",
        description: "Nombre y documento son obligatorios.",
        variant: "destructive",
      });
      return;
    }

    let updated;
    if (editingCustomer) {
      updated = customers.map((c) =>
        c.id === editingCustomer.id ? { ...c, ...form } : c
      );
      toast({ title: "Cliente actualizado correctamente." });
    } else {
      updated = [
        ...customers,
        {
          ...form,
          id: crypto.randomUUID(),
          total_spent: 0,
          last_purchase: null,
        },
      ];
      toast({ title: "Cliente agregado correctamente." });
    }

    saveCustomers(updated);
    setShowDialog(false);
  };

  // =========================
  // 📤 Exportaciones
  // =========================
  const exportToExcel = () => {
    const data = customers.map((c) => ({
      Nombre: c.name,
      Documento: `${c.doc_type} ${c.doc_number}`,
      Email: c.email,
      Teléfono: c.phone,
      Dirección: c.address,
      "Total gastado": c.total_spent || 0,
      "Última compra": c.last_purchase
        ? new Date(c.last_purchase).toLocaleDateString()
        : "-",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clientes");
    XLSX.writeFile(wb, "Clientes_POS.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Lista de Clientes - POS", 10, 10);
    let y = 25;
    customers.forEach((c) => {
      doc.text(`${c.name} (${c.doc_number}) - ${c.email}`, 10, y);
      y += 8;
    });
    doc.save("Clientes_POS.pdf");
  };

  const exportToTxt = () => {
    const lines = customers.map(
      (c) =>
        `${c.name} | ${c.doc_type} ${c.doc_number} | ${c.email} | ${c.phone} | ${c.address}`
    );
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Clientes_POS.txt";
    a.click();
  };

  // =========================
  // 🧾 Render principal
  // =========================
  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
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

      {/* Métricas */}
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
              <p className="text-sm text-gray-600">Gasto Promedio</p>
              <p className="text-2xl font-bold">${avgSpent.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
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
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={exportToExcel}>
              <FileDown className="h-4 w-4 mr-1" /> Excel
            </Button>
            <Button variant="outline" onClick={exportToPDF}>
              <FileDown className="h-4 w-4 mr-1" /> PDF
            </Button>
            <Button variant="outline" onClick={exportToTxt}>
              <FileDown className="h-4 w-4 mr-1" /> TXT
            </Button>
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
                        <Mail className="h-3 w-3" />
                        <span>{customer.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Phone className="h-3 w-3" />
                        <span>{customer.phone}</span>
                      </div>
                    </td>
                    <td className="p-2 text-gray-600">
                      {customer.doc_type}: {customer.doc_number}
                    </td>
                    <td className="p-2 text-right font-mono">
                      ${customer.total_spent?.toFixed(2) || "0.00"}
                    </td>
                    <td className="p-2 text-gray-600">
                      {customer.last_purchase
                        ? new Date(customer.last_purchase).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditCustomer(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="text-red-500 hover:text-red-700"
                        >
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

      {/* Diálogo Cliente */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Editar Cliente" : "Nuevo Cliente"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nombre</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Tipo Doc.</Label>
                <select
                  className="border p-2 rounded w-full"
                  value={form.doc_type}
                  onChange={(e) => setForm({ ...form, doc_type: e.target.value })}
                >
                  <option value="DNI">DNI</option>
                  <option value="CUIT">CUIT</option>
                  <option value="PAS">Pasaporte</option>
                </select>
              </div>
              <div>
                <Label>N° Documento</Label>
                <Input
                  value={form.doc_number}
                  onChange={(e) =>
                    setForm({ ...form, doc_number: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Dirección</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <Button onClick={handleSaveCustomer} className="w-full">
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomersView;
