import React, { useState, useEffect } from 'react';
import { Search, Scan, Camera, Plus, Monitor } from 'lucide-react';
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
  const [scannerType, setScannerType] = useState('keyboard'); // 'keyboard' | 'camera'
  const [products, setProducts] = useState([]);
  const { addToCart, calculateTotal } = usePOS();
  const { toast } = useToast();

  /* === Inicializa canal de comunicación con Display del Cliente === */
  useEffect(() => {
    if (!window.customerDisplayChannel && 'BroadcastChannel' in window) {
      window.customerDisplayChannel = new BroadcastChannel('customer_display');
    }
    return () => window.customerDisplayChannel?.close?.();
  }, []);

  /* === Cargar productos desde el almacenamiento local === */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('pos_products') || '[]');
    setProducts(stored);
  }, []);

  /* === Filtro de búsqueda === */
  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode?.includes(searchTerm)
  );

  /* === Lector de código de barras por teclado === */
  useEffect(() => {
    if (scannerType !== 'keyboard') return;

    let buffer = '';
    let lastTime = Date.now();

    const handleKeyPress = (e) => {
      const now = Date.now();
      if (now - lastTime > 100) buffer = '';
      lastTime = now;

      if (e.key === 'Enter' && buffer.length > 6) {
        const product = products.find((p) => p.barcode === buffer);
        if (product) {
          addToCart(product);
          emitCustomerDisplay(product);
          toast({
            title: '✅ Producto agregado',
            description: `${product.name} — $${product.price?.toFixed(2)}`,
            duration: 2000,
          });
        } else {
          toast({
            title: 'Producto no encontrado',
            description: `Código ${buffer}`,
            variant: 'destructive',
            duration: 3000,
          });
        }
        buffer = '';
      } else if (/\d/.test(e.key)) {
        buffer += e.key;
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [scannerType, products, addToCart]);

  /* === Callback al detectar código desde cámara === */
  const handleBarcodeDetected = (barcode) => {
    const product = products.find((p) => p.barcode === barcode);
    if (product) {
      addToCart(product);
      emitCustomerDisplay(product);
      setShowScanner(false);
      toast({
        title: '✅ Producto escaneado',
        description: `${product.name} agregado al carrito`,
        duration: 2000,
      });
    } else {
      toast({
        title: 'Producto no encontrado',
        description: `Código de barras: ${barcode}`,
        variant: 'destructive',
      });
    }
  };

  /* === Enviar datos al Display del Cliente === */
  const emitCustomerDisplay = (lastProduct) => {
    const total = calculateTotal();
    if (window.customerDisplayChannel) {
      window.customerDisplayChannel.postMessage({
        type: 'UPDATE_DISPLAY',
        payload: { lastProduct, total },
      });
    }
  };

  /* === Abrir display del cliente === */
  const handleOpenDisplay = () => {
    const url = `${window.location.origin}/display`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <Card className="mb-4 border-gray-200 dark:border-gray-700 dark:bg-gray-800/80">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="font-semibold text-lg text-gray-800 dark:text-gray-100">
              Punto de Venta
            </span>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenDisplay}
                className="flex items-center space-x-2"
              >
                <Monitor className="h-4 w-4" />
                <span>Display</span>
              </Button>
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
                variant={scannerType === 'camera' ? 'default' : 'outline'}
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
          <div className="flex space-x-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, SKU o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
            </div>
            <CustomerSelector />
          </div>
        </CardContent>
      </Card>

      {/* Escáner (cámara) */}
      {showScanner && scannerType === 'camera' && (
        <BarcodeScanner
          onBarcodeDetected={handleBarcodeDetected}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Grilla de productos */}
      <div className="flex-1 overflow-auto">
        <ProductGrid products={filteredProducts} />
      </div>

      {/* Acciones rápidas */}
      <Card className="mt-4 border-gray-200 dark:border-gray-700 dark:bg-gray-800/80">
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
