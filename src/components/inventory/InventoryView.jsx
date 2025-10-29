
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Package, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

const InventoryView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Mock products data
  const [products] = useState([
    {
      id: '1',
      sku: 'PROD001',
      barcode: '1234567890123',
      name: 'Coca Cola 500ml',
      category: 'Bebidas',
      price: 150.00,
      cost: 100.00,
      tax_rate: 0.21,
      stock: 50,
      min_stock: 10,
      active: true
    },
    {
      id: '2',
      sku: 'PROD002',
      barcode: '2345678901234',
      name: 'Pan Lactal',
      category: 'Panadería',
      price: 280.00,
      cost: 200.00,
      tax_rate: 0.21,
      stock: 5,
      min_stock: 5,
      active: true
    },
    {
      id: '3',
      sku: 'PROD003',
      barcode: '3456789012345',
      name: 'Leche Entera 1L',
      category: 'Lácteos',
      price: 320.00,
      cost: 250.00,
      tax_rate: 0.21,
      stock: 30,
      min_stock: 8,
      active: true
    }
  ]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter(p => p.stock <= p.min_stock);

  const handleAddProduct = () => {
    toast({
      title: "🚧 Esta función no está implementada aún—¡pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀"
    });
  };

  const handleEditProduct = (product) => {
    toast({
      title: "🚧 Esta función no está implementada aún—¡pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀"
    });
  };

  const handleDeleteProduct = (product) => {
    toast({
      title: "🚧 Esta función no está implementada aún—¡pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀"
    });
  };

  const handleStockMovement = () => {
    toast({
      title: "🚧 Esta función no está implementada aún—¡pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀"
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventario</h1>
          <p className="text-gray-600">Gestión de productos y stock</p>
        </div>
        <Button onClick={handleAddProduct} className="gradient-bg text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Productos</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Stock Bajo</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-bold">$</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold">
                  ${products.reduce((sum, p) => sum + (p.cost * p.stock), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-bold">#</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Categorías</p>
                <p className="text-2xl font-bold">
                  {new Set(products.map(p => p.category)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="low-stock">Stock Bajo</TabsTrigger>
          <TabsTrigger value="movements">Movimientos</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleStockMovement} variant="outline">
                  Movimiento de Stock
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Productos</CardTitle>
            </CardHeader>
            <CardContent>
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
                    {filteredProducts.map((product, index) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b hover:bg-gray-50"
                      ><td className="p-2 font-mono text-sm">{product.sku}</td>
                        <td className="p-2 font-medium">{product.name}</td>
                        <td className="p-2 text-gray-600">{product.category}</td>
                        <td className="p-2 text-right font-mono">${product.cost.toFixed(2)}</td>
                        <td className="p-2 text-right font-mono">${product.price.toFixed(2)}</td>
                        <td className={`p-2 text-right font-bold ${product.stock <= product.min_stock ? 'text-orange-600' : ''}`}>{product.stock}</td>
                        <td className="p-2 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product)} className="text-red-500 hover:text-red-700">
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

        <TabsContent value="low-stock">
           <Card>
            <CardHeader>
              <CardTitle>Productos con Stock Bajo</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">SKU</th>
                      <th className="text-left p-2">Producto</th>
                      <th className="text-right p-2">Stock</th>
                      <th className="text-right p-2">Stock Mínimo</th>
                      <th className="text-center p-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-mono text-sm">{product.sku}</td>
                        <td className="p-2 font-medium">{product.name}</td>
                        <td className="p-2 text-right font-bold text-orange-600">{product.stock}</td>
                        <td className="p-2 text-right">{product.min_stock}</td>
                        <td className="p-2 text-center">
                            <Button variant="outline" size="sm" onClick={() => toast({ title: "🚧 No implementado" })}>
                                Comprar
                            </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
            </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
                <p>La gestión de movimientos de stock estará disponible pronto.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
           <Card>
            <CardContent className="p-6 text-center text-gray-500">
                <p>La gestión de categorías estará disponible pronto.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryView;
