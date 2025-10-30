import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Package,
  Edit,
  Trash2,
  AlertTriangle,
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
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

const InventoryView = () => {
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    barcode: "",
    category: "",
    price: 0,
    cost: 0,
    tax_rate: 0.21,
    stock: 0,
    min_stock: 5,
    active: true,
  });

  // =============================
  // 📦 Cargar / Guardar productos
  // =============================
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("pos_products") || "[]");
    setProducts(saved);
  }, []);

  const saveProducts = (data) => {
    setProducts(data);
    localStorage.setItem("pos_products", JSON.stringify(data));
  };

  // =============================
  // 🧮 Filtros y métricas
  // =============================
  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const lowStockProducts = products.filter((p) => p.stock <= p.min_stock);
  const totalValue = products.reduce((sum, p) => sum + p.cost * p.stock, 0);
  const categoriesCount = new Set(products.map((p) => p.category)).size;

  // =============================
  // 🔧 CRUD
  // =============================
  const handleAddProduct = () => {
    setEditingProduct(null);
    setForm({
      name: "",
      sku: "",
      barcode: "",
      category: "",
      price: 0,
      cost: 0,
      tax_rate: 0.21,
      stock: 0,
      min_stock: 5,
      active: true,
    });
    setShowDialog(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setForm(product);
    setShowDialog(true);
  };

  const handleDeleteProduct = (product) => {
    if (!confirm(`¿Eliminar ${product.name}?`)) return;
    const updated = products.filter((p) => p.id !== product.id);
    saveProducts(updated);
    toast({ title: "Producto eliminado", description: product.name });
  };

  const handleSaveProduct = () => {
    if (!form.name || !form.sku) {
      toast({
        title: "Datos incompletos",
        description: "Debe completar al menos el nombre y SKU.",
        variant: "destructive",
      });
      return;
    }

    let updated;
    if (editingProduct) {
      updated = products.map((p) =>
        p.id === editingProduct.id ? { ...form } : p
      );
      toast({ title: "Producto actualizado", description: form.name });
    } else {
      updated = [
        ...products,
        { ...form, id: crypto.randomUUID(), created_at: new Date().toISOString() },
      ];
      toast({ title: "Producto agregado", description: form.name });
    }

    saveProducts(updated);
    setShowDialog(false);
  };

  // =============================
  // 📤 Exportaciones
  // =============================
  const exportToExcel = () => {
    const data = products.map((p) => ({
      SKU: p.sku,
      Producto: p.name,
      Categoría: p.category,
      Costo: p.cost,
      Precio: p.price,
      Stock: p.stock,
      "Stock mínimo": p.min_stock,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Productos");
    XLSX.writeFile(wb, "Inventario_POS.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Lista de Productos - POS", 10, 10);
    let y = 25;
    products.forEach((p) => {
      doc.text(`${p.sku} - ${p.name} ($${p.price.toFixed(2)})`, 10, y);
      y += 8;
    });
    doc.save("Inventario_POS.pdf");
  };

  const exportToTxt = () => {
    const lines = products.map(
      (p) => `${p.sku} | ${p.name} | ${p.category} | ${p.stock} unidades`
    );
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Inventario_POS.txt";
    a.click();
  };

  // =============================
  // 🧾 Render principal
  // =============================
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Inventario</h1>
          <p className="text-gray-600">Gestión de productos y stock</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleAddProduct} className="gradient-bg text-white">
            <Plus className="h-4 w-4 mr-2" /> Nuevo Producto
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/inventory/movements")}
          >
            📦 Movimientos
          </Button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-2">
            <Package className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-2">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Stock Bajo</p>
              <p className="text-2xl font-bold text-orange-600">
                {lowStockProducts.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 font-bold">$</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-purple-600 font-bold">#</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Categorías</p>
              <p className="text-2xl font-bold">{categoriesCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="low-stock">Stock Bajo</TabsTrigger>
        </TabsList>

        {/* Productos */}
        <TabsContent value="products">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Lista de Productos</CardTitle>
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
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">SKU</th>
                      <th className="text-left p-2">Producto</th>
                      <th className="text-left p-2">Categoría</th>
                      <th className="text-right p-2">Costo</th>
                      <th className="text-right p-2">Precio</th>
                      <th className="text-right p-2">Stock</th>
                      <th className="text-center p-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product, i) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-2 font-mono text-sm">{product.sku}</td>
                        <td className="p-2 font-medium">{product.name}</td>
                        <td className="p-2 text-gray-600">{product.category}</td>
                        <td className="p-2 text-right font-mono">
                          ${product.cost.toFixed(2)}
                        </td>
                        <td className="p-2 text-right font-mono">
                          ${product.price.toFixed(2)}
                        </td>
                        <td
                          className={`p-2 text-right font-bold ${
                            product.stock <= product.min_stock
                              ? "text-orange-600"
                              : ""
                          }`}
                        >
                          {product.stock}
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteProduct(product)}
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
        </TabsContent>

        {/* Stock bajo */}
        <TabsContent value="low-stock">
          <Card>
            <CardHeader>
              <CardTitle>Productos con Stock Bajo</CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No hay productos con stock bajo.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">SKU</th>
                        <th className="text-left p-2">Producto</th>
                        <th className="text-right p-2">Stock</th>
                        <th className="text-right p-2">Mínimo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockProducts.map((p) => (
                        <tr
                          key={p.id}
                          className="border-b hover:bg-gray-50 text-orange-600"
                        >
                          <td className="p-2 font-mono">{p.sku}</td>
                          <td className="p-2 font-medium">{p.name}</td>
                          <td className="p-2 text-right">{p.stock}</td>
                          <td className="p-2 text-right">{p.min_stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo producto */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Editar Producto" : "Nuevo Producto"}
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
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>SKU</Label>
                <Input
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                />
              </div>
              <div>
                <Label>Código de Barras</Label>
                <Input
                  value={form.barcode}
                  onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Categoría</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Costo</Label>
                <Input
                  type="number"
                  value={form.cost}
                  onChange={(e) =>
                    setForm({ ...form, cost: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Precio</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: parseFloat(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={form.stock}
                  onChange={(e) =>
                    setForm({ ...form, stock: parseInt(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Stock mínimo</Label>
                <Input
                  type="number"
                  value={form.min_stock}
                  onChange={(e) =>
                    setForm({ ...form, min_stock: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>
            <Button onClick={handleSaveProduct} className="w-full">
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryView;
