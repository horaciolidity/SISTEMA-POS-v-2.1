
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Scan, Camera, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProductGrid from './ProductGrid';
import BarcodeScanner from './BarcodeScanner';
import CustomerSelector from './CustomerSelector';
import { usePOS } from '@/contexts/POSContext';
import { useToast } from '@/components/ui/use-toast';

const POSView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [scannerType, setScannerType] = useState('keyboard'); // keyboard, camera
  const { addToCart } = usePOS();
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
      image_url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=200&h=200&fit=crop'
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
      stock: 25,
      min_stock: 5,
      image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop'
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
      image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&h=200&fit=crop'
    },
    {
      id: '4',
      sku: 'PROD004',
      barcode: '4567890123456',
      name: 'Arroz 1kg',
      category: 'Almacén',
      price: 450.00,
      cost: 350.00,
      tax_rate: 0.21,
      stock: 40,
      min_stock: 10,
      image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop'
    }
  ]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
  );

  // Handle keyboard barcode scanner input
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyPress = (e) => {
      const currentTime = Date.now();
      
      // If more than 100ms between keystrokes, reset buffer
      if (currentTime - lastKeyTime > 100) {
        barcodeBuffer = '';
      }
      
      lastKeyTime = currentTime;
      
      if (e.key === 'Enter' && barcodeBuffer.length > 8) {
        // Process barcode
        const product = products.find(p => p.barcode === barcodeBuffer);
        if (product) {
          addToCart(product);
          toast({
            title: "Producto escaneado",
            description: `${product.name} agregado al carrito`,
            duration: 2000
          });
        } else {
          toast({
            title: "Producto no encontrado",
            description: `Código de barras: ${barcodeBuffer}`,
            variant: "destructive",
            duration: 3000
          });
        }
        barcodeBuffer = '';
      } else if (e.key.length === 1 && /\d/.test(e.key)) {
        barcodeBuffer += e.key;
      }
    };

    if (scannerType === 'keyboard') {
      window.addEventListener('keypress', handleKeyPress);
      return () => window.removeEventListener('keypress', handleKeyPress);
    }
  }, [scannerType, products, addToCart, toast]);

  const handleBarcodeDetected = (barcode) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      addToCart(product);
      setShowScanner(false);
      toast({
        title: "Producto escaneado",
        description: `${product.name} agregado al carrito`,
        duration: 2000
      });
    } else {
      toast({
        title: "Producto no encontrado",
        description: `Código de barras: ${barcode}`,
        variant: "destructive",
        duration: 3000
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>Punto de Venta</span>
            <div className="flex space-x-2">
              <Button
                variant={scannerType === 'keyboard' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setScannerType('keyboard')}
                className="flex items-center space-x-2"
              >
                <Scan className="h-4 w-4" />
                <span>Teclado</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setScannerType('camera');
                  setShowScanner(true);
                }}
                className="flex items-center space-x-2"
              >
                <Camera className="h-4 w-4" />
                <span>Cámara</span>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar productos por nombre, SKU o código de barras..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <CustomerSelector />
          </div>
        </CardContent>
      </Card>

      {/* Scanner Modal */}
      {showScanner && scannerType === 'camera' && (
        <BarcodeScanner
          onBarcodeDetected={handleBarcodeDetected}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Products Grid */}
      <div className="flex-1 overflow-auto">
        <ProductGrid products={filteredProducts} />
      </div>

      {/* Quick Actions */}
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Producto Rápido
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              Descuento
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              Nota
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default POSView;
