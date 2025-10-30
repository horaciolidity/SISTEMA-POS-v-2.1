import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Trash2,
  Save,
  Plus,
  Edit3,
  Check,
  X,
  Upload,
  Building2,
  PackageSearch,
} from "lucide-react";
import Layout from "@/components/Layout";
import { useToast } from "@/components/ui/use-toast";

const InventoryPage = () => {
  const { toast } = useToast();

  const [products, setProducts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [showProviderForm, setShowProviderForm] = useState(false);

  const [form, setForm] = useState({
    id: "",
    name: "",
    sku: "",
    barcode: "",
    price: "",
    cost: "",
    stock: "",
    min_stock: "",
    category: "",
    supplier: "",
    description: "",
    image_url: "",
  });

  const [providerForm, setProviderForm] = useState({
    id: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const [editingId, setEditingId] = useState(null);

  /* === Cargar datos al iniciar === */
  useEffect(() => {
    const storedProducts = JSON.parse(localStorage.getItem("pos_products") || "[]");
    const storedProviders = JSON.parse(localStorage.getItem("pos_providers") || "[]");
    setProducts(storedProducts);
    setProviders(storedProviders);
  }, []);

  /* === Guardar productos/proveedores === */
  const saveProducts = (list) => {
    localStorage.setItem("pos_products", JSON.stringify(list));
    setProducts(list);
  };
  const saveProviders = (list) => {
    localStorage.setItem("pos_providers", JSON.stringify(list));
    setProviders(list);
  };

  /* === Cambios === */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleProviderChange = (e) => {
    setProviderForm({ ...providerForm, [e.target.name]: e.target.value });
  };

  /* === Imagen === */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, image_url: reader.result });
    reader.readAsDataURL(file);
  };

  /* === Agregar producto === */
  const handleAddProduct = () => {
    if (!form.name || !form.price) {
      toast({
        title: "Faltan campos obligatorios",
        description: "Completa al menos el nombre y el precio de venta",
        variant: "destructive",
      });
      return;
    }

    const newProduct = {
      ...form,
      id: crypto.randomUUID(),
      price: parseFloat(form.price),
      cost: parseFloat(form.cost || 0),
      stock: parseInt(form.stock || 0),
      min_stock: parseInt(form.min_stock || 0),
      created_at: new Date().toISOString(),
    };

    const updated = [...products, newProduct];
    saveProducts(updated);

    toast({
      title: "✅ Producto agregado",
      description: `${newProduct.name} guardado correctamente`,
    });

    resetProductForm();
  };

  /* === Agregar proveedor === */
  const handleAddProvider = () => {
    if (!providerForm.name) {
      toast({
        title: "Falta el nombre del proveedor",
        variant: "destructive",
      });
      return;
    }

    const newProv = {
      ...providerForm,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    const updated = [...providers, newProv];
    saveProviders(updated);

    toast({
      title: "🏭 Proveedor agregado",
      description: `${newProv.name} registrado correctamente`,
    });

    resetProviderForm();
    setShowProviderForm(false);
  };

  /* === Eliminar === */
  const handleDeleteProduct = (id) => {
    if (!confirm("¿Eliminar este producto del inventario?")) return;
    const updated = products.filter((p) => p.id !== id);
    saveProducts(updated);
    toast({ title: "🗑️ Producto eliminado" });
  };
  const handleDeleteProvider = (id) => {
    if (!confirm("¿Eliminar este proveedor?")) return;
    const updated = providers.filter((p) => p.id !== id);
    saveProviders(updated);
    toast({ title: "🗑️ Proveedor eliminado" });
  };

  /* === Editar === */
  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm(p);
  };
  const handleSaveEdit = () => {
    const updated = products.map((p) =>
      p.id === editingId ? { ...form, id: editingId } : p
    );
    saveProducts(updated);
    setEditingId(null);
    resetProductForm();
    toast({ title: "💾 Cambios guardados" });
  };

  /* === Reset === */
  const resetProductForm = () =>
    setForm({
      id: "",
      name: "",
      sku: "",
      barcode: "",
      price: "",
      cost: "",
      stock: "",
      min_stock: "",
      category: "",
      supplier: "",
      description: "",
      image_url: "",
    });

  const resetProviderForm = () =>
    setProviderForm({
      id: "",
      name: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
    });

  return (
    <>
      <Helmet>
        <title>Inventario y Proveedores - Sistema POS</title>
      </Helmet>

      <Layout>
        <div className="p-6 space-y-8">

          {/* === FORMULARIO DE PRODUCTO === */}
          <Card className="border-gray-200 dark:border-gray-700 dark:bg-gray-800/70">
            <CardHeader>
              <CardTitle>
                {editingId ? "Editar Producto" : "Agregar Producto"}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Nombre</Label>
                  <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Ej: Leche entera 1L"
                  />
                </div>

                <div>
                  <Label>SKU</Label>
                  <Input name="sku" value={form.sku} onChange={handleChange} />
                </div>

                <div>
                  <Label>Código de barras</Label>
                  <Input
                    name="barcode"
                    value={form.barcode}
                    onChange={handleChange}
                    placeholder="Ej: 7791234567890"
                  />
                </div>

                <div>
                  <Label>Categoría</Label>
                  <Input
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="Ej: Lácteos"
                  />
                </div>

                <div>
                  <Label>Proveedor</Label>
                  <select
                    name="supplier"
                    value={form.supplier}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md p-2 w-full dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="">Seleccionar proveedor...</option>
                    {providers.map((prov) => (
                      <option key={prov.id} value={prov.name}>
                        {prov.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Precio venta</Label>
                  <Input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label>Costo</Label>
                  <Input
                    type="number"
                    name="cost"
                    value={form.cost}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label>Stock actual</Label>
                  <Input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label>Stock mínimo</Label>
                  <Input
                    type="number"
                    name="min_stock"
                    value={form.min_stock}
                    onChange={handleChange}
                  />
                </div>

                <div className="md:col-span-3">
                  <Label>Descripción</Label>
                  <Input
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Detalles del producto"
                  />
                </div>

                <div>
                  <Label>Imagen</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    {form.image_url && (
                      <img
                        src={form.image_url}
                        alt="preview"
                        className="h-10 w-10 rounded border"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setShowProviderForm(!showProviderForm)}
                  className="flex items-center gap-2"
                >
                  <Building2 className="h-4 w-4" />
                  {showProviderForm ? "Ocultar proveedores" : "Gestionar proveedores"}
                </Button>

                <div className="flex gap-2">
                  {editingId ? (
                    <>
                      <Button
                        onClick={handleSaveEdit}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" /> Guardar Cambios
                      </Button>
                      <Button variant="outline" onClick={resetProductForm}>
                        <X className="h-4 w-4 mr-2" /> Cancelar
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleAddProduct} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" /> Agregar Producto
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* === FORMULARIO DE PROVEEDORES === */}
          {showProviderForm && (
            <Card className="border-gray-200 dark:border-gray-700 dark:bg-gray-800/70">
              <CardHeader>
                <CardTitle>Proveedores ({providers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Nombre</Label>
                    <Input
                      name="name"
                      value={providerForm.name}
                      onChange={handleProviderChange}
                      placeholder="Distribuidora Norte"
                    />
                  </div>

                  <div>
                    <Label>Teléfono</Label>
                    <Input
                      name="phone"
                      value={providerForm.phone}
                      onChange={handleProviderChange}
                      placeholder="+54 9 11 1234 5678"
                    />
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input
                      name="email"
                      value={providerForm.email}
                      onChange={handleProviderChange}
                      placeholder="proveedor@correo.com"
                    />
                  </div>

                  <div>
                    <Label>Dirección</Label>
                    <Input
                      name="address"
                      value={providerForm.address}
                      onChange={handleProviderChange}
                      placeholder="Av. Rivadavia 1234, CABA"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Notas / Observaciones</Label>
                    <Input
                      name="notes"
                      value={providerForm.notes}
                      onChange={handleProviderChange}
                      placeholder="Ej: entrega semanal, pagos a 30 días..."
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button onClick={handleAddProvider} className="flex items-center gap-2">
                    <Save className="h-4 w-4" /> Guardar Proveedor
                  </Button>
                </div>

                {/* Tabla de proveedores */}
                {providers.length > 0 && (
                  <div className="mt-6 overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left border-b border-gray-300 dark:border-gray-700">
                          <th>Nombre</th>
                          <th>Teléfono</th>
                          <th>Email</th>
                          <th>Dirección</th>
                          <th>Notas</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {providers.map((prov) => (
                          <tr
                            key={prov.id}
                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                          >
                            <td>{prov.name}</td>
                            <td>{prov.phone}</td>
                            <td>{prov.email}</td>
                            <td>{prov.address}</td>
                            <td>{prov.notes}</td>
                            <td>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleDeleteProvider(prov.id)}
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
          )}

          {/* === TABLA DE PRODUCTOS === */}
          <Card className="border-gray-200 dark:border-gray-700 dark:bg-gray-800/70">
            <CardHeader>
              <CardTitle>Inventario Actual ({products.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <p className="text-gray-500">No hay productos cargados aún.</p>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-gray-300 dark:border-gray-700">
                        <th>Nombre</th>
                        <th>Proveedor</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Costo</th>
                        <th>Stock</th>
                        <th>Mínimo</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr
                          key={p.id}
                          className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                        >
                          <td className="py-2 flex items-center gap-2">
                            {p.image_url && (
                              <img
                                src={p.image_url}
                                alt=""
                                className="h-8 w-8 rounded object-cover border"
                              />
                            )}
                            {p.name}
                          </td>
                          <td>{p.supplier}</td>
                          <td>{p.category}</td>
                          <td>${p.price}</td>
                          <td>${p.cost}</td>
                          <td>{p.stock}</td>
                          <td>{p.min_stock}</td>
                          <td className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(p)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDeleteProduct(p.id)}
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
      </Layout>
    </>
  );
};

export default InventoryPage;
