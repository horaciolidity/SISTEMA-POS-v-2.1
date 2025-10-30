import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  PlusCircle,
  FileDown,
  Search,
  Package,
  ArrowUpCircle,
  ArrowDownCircle,
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

const StockMovementsView = () => {
  const { toast } = useToast();

  // ========= ESTADOS =========
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [form, setForm] = useState({
    product_id: "",
    type: "in", // in | out
    quantity: 0,
    reason: "",
    note: "",
  });

  // ========= CARGA DE DATOS =========
  useEffect(() => {
    const savedMovs = JSON.parse(localStorage.getItem("pos_stock_movements") || "[]");
    const savedProducts = JSON.parse(localStorage.getItem("pos_products") || "[]");
    setMovements(savedMovs);
    setProducts(savedProducts);
  }, []);

  const saveMovements = (data) => {
    setMovements(data);
    localStorage.setItem("pos_stock_movements", JSON.stringify(data));
  };

  const saveProducts = (data) => {
    setProducts(data);
    localStorage.setItem("pos_products", JSON.stringify(data));
  };

  // ========= FILTRADO =========
  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const matchesType = filterType === "all" || m.type === filterType;
      const matchesSearch =
        m.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.reason.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [movements, searchTerm, filterType]);

  // ========= NUEVO MOVIMIENTO =========
  const handleAddMovement = () => {
    if (!form.product_id || !form.quantity || form.quantity <= 0) {
      toast({
        title: "Datos inválidos",
        description: "Debe seleccionar un producto y cantidad mayor a 0.",
        variant: "destructive",
      });
      return;
    }

    const product = products.find((p) => p.id === form.product_id);
    if (!product) {
      toast({ title: "Producto no encontrado", variant: "destructive" });
      return;
    }

    const newStock =
      form.type === "in"
        ? product.stock + Number(form.quantity)
        : product.stock - Number(form.quantity);

    if (newStock < 0) {
      toast({
        title: "Stock insuficiente",
        description: "No se puede registrar salida mayor al stock actual.",
        variant: "destructive",
      });
      return;
    }

    // Actualiza producto
    const updatedProducts = products.map((p) =>
      p.id === form.product_id ? { ...p, stock: newStock } : p
    );
    saveProducts(updatedProducts);

    // Guarda movimiento
    const movement = {
      id: crypto.randomUUID(),
      product_id: form.product_id,
      product_name: product.name,
      type: form.type,
      quantity: Number(form.quantity),
      reason: form.reason || (form.type === "in" ? "Ingreso manual" : "Salida manual"),
      note: form.note,
      date: new Date().toISOString(),
    };

    const updatedMovs = [...movements, movement];
    saveMovements(updatedMovs);

    setShowDialog(false);
    setForm({ product_id: "", type: "in", quantity: 0, reason: "", note: "" });
    toast({ title: "Movimiento registrado correctamente." });
  };

  // ========= EXPORTACIONES =========
  const exportToExcel = () => {
    const data = movements.map((m) => ({
      Producto: m.product_name,
      Tipo: m.type === "in" ? "Entrada" : "Salida",
      Cantidad: m.quantity,
      Motivo: m.reason,
      Nota: m.note,
      Fecha: new Date(m.date).toLocaleString(),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Movimientos");
    XLSX.writeFile(wb, "Movimientos_Stock.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Historial de Movimientos de Stock", 10, 10);
    let y = 25;
    movements.forEach((m) => {
      doc.text(
        `${m.type === "in" ? "+" : "-"} ${m.quantity} ${m.product_name} (${m.reason})`,
        10,
        y
      );
      y += 8;
    });
    doc.save("Movimientos_Stock.pdf");
  };

  const exportToTxt = () => {
    const lines = movements.map(
      (m) =>
        `${m.type === "in" ? "+" : "-"} ${m.quantity} ${m.product_name} | ${
          m.reason
        } | ${new Date(m.date).toLocaleString()}`
    );
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Movimientos_Stock.txt";
    a.click();
  };

  // ========= RENDER =========
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Movimientos de Stock</h1>
          <p className="text-gray-600">Entradas, salidas y ajustes</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="gradient-bg text-white">
              <PlusCircle className="h-4 w-4 mr-2" />
              Nuevo Movimiento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Movimiento</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Producto</Label>
                <select
                  className="w-full border rounded p-2"
                  value={form.product_id}
                  onChange={(e) =>
                    setForm({ ...form, product_id: e.target.value })
                  }
                >
                  <option value="">Seleccionar producto...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Tipo</Label>
                  <select
                    className="w-full border rounded p-2"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="in">Entrada</option>
                    <option value="out">Salida</option>
                  </select>
                </div>
                <div>
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({ ...form, quantity: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Motivo</Label>
                <Input
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Compra, ajuste, pérdida, etc."
                />
              </div>

              <div>
                <Label>Nota</Label>
                <Input
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="Observaciones opcionales"
                />
              </div>

              <Button onClick={handleAddMovement} className="w-full">
                Guardar Movimiento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* === Filtros === */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por producto o motivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            className="border rounded p-2"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="in">Entradas</option>
            <option value="out">Salidas</option>
          </select>

          <Button variant="outline" onClick={exportToExcel}>
            <FileDown className="h-4 w-4 mr-1" /> Excel
          </Button>
          <Button variant="outline" onClick={exportToPDF}>
            <FileDown className="h-4 w-4 mr-1" /> PDF
          </Button>
          <Button variant="outline" onClick={exportToTxt}>
            <FileDown className="h-4 w-4 mr-1" /> TXT
          </Button>
        </CardContent>
      </Card>

      {/* === Tabla === */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Producto</th>
                  <th className="text-left p-2">Tipo</th>
                  <th className="text-right p-2">Cantidad</th>
                  <th className="text-left p-2">Motivo</th>
                  <th className="text-left p-2">Nota</th>
                  <th className="text-left p-2">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map((m, i) => (
                  <motion.tr
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-2 font-medium">{m.product_name}</td>
                    <td className="p-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                          m.type === "in"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {m.type === "in" ? (
                          <ArrowUpCircle className="h-3 w-3" />
                        ) : (
                          <ArrowDownCircle className="h-3 w-3" />
                        )}
                        {m.type === "in" ? "Entrada" : "Salida"}
                      </span>
                    </td>
                    <td className="p-2 text-right font-mono">{m.quantity}</td>
                    <td className="p-2 text-gray-600">{m.reason}</td>
                    <td className="p-2 text-gray-600">{m.note}</td>
                    <td className="p-2 text-gray-500 text-sm">
                      {new Date(m.date).toLocaleString()}
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

export default StockMovementsView;
