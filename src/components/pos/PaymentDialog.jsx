
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, DollarSign, Smartphone, Receipt, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { usePOS } from '@/contexts/POSContext';
import { useToast } from '@/components/ui/use-toast';
import { createPrinter } from '@/lib/printing/printerFactory';

const PaymentDialog = ({ open, onClose, total, cart, customer, discount }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashAmount, setCashAmount] = useState(total);
  const [cardAmount, setCardAmount] = useState(total);
  const [processing, setProcessing] = useState(false);
  const { clearCart } = usePOS();
  const { toast } = useToast();

  const change = cashAmount - total;

  const handlePayment = async () => {
    setProcessing(true);

    try {
      // Create sale record
      const sale = {
        id: Date.now().toString(),
        number: `V-${Date.now()}`,
        customer_id: customer?.id || null,
        status: 'completed',
        subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        tax_total: cart.reduce((sum, item) => {
          const itemTotal = item.price * item.quantity;
          const taxRate = item.tax_rate || 0.21;
          return sum + (itemTotal * taxRate);
        }, 0),
        discount_total: (cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * (discount / 100)),
        total: total,
        paid_total: paymentMethod === 'cash' ? cashAmount : cardAmount,
        change: paymentMethod === 'cash' ? change : 0,
        user_id: '1', // Replace with actual user ID
        opened_at: new Date().toISOString(),
        closed_at: new Date().toISOString(),
        items: cart.map(item => ({
          product_id: item.id,
          qty: item.quantity,
          unit_price: item.price,
          tax_rate: item.tax_rate || 0.21,
          discount_pct: 0,
          total: item.price * item.quantity
        })),
        payment: {
          method: paymentMethod,
          amount: paymentMethod === 'cash' ? cashAmount : cardAmount
        }
      };

      // Save sale to localStorage (replace with Supabase)
      const sales = JSON.parse(localStorage.getItem('pos_sales') || '[]');
      sales.push(sale);
      localStorage.setItem('pos_sales', JSON.stringify(sales));

      // Print receipt
      await printReceipt(sale);

      // Clear cart
      clearCart();
      onClose();

      toast({
        title: "¡Venta completada!",
        description: `Venta ${sale.number} procesada exitosamente`,
        duration: 4000
      });

    } catch (error) {
      toast({
        title: "Error en el pago",
        description: "No se pudo procesar la venta",
        variant: "destructive",
        duration: 4000
      });
    } finally {
      setProcessing(false);
    }
  };

  const printReceipt = async (sale) => {
    try {
      const printer = createPrinter();
      await printer.printReceipt(sale);
    } catch (error) {
      console.error('Error printing receipt:', error);
      toast({
        title: "Error de impresión",
        description: "La venta se procesó pero no se pudo imprimir el ticket",
        variant: "destructive",
        duration: 4000
      });
    }
  };

  const handleMercadoPago = () => {
    toast({
      title: "🚧 Esta función no está implementada aún—¡pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Procesar Pago</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Total */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total a cobrar</p>
                <p className="text-3xl font-bold text-green-600">${total.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cash" className="flex items-center space-x-1">
                <DollarSign className="h-4 w-4" />
                <span>Efectivo</span>
              </TabsTrigger>
              <TabsTrigger value="card" className="flex items-center space-x-1">
                <CreditCard className="h-4 w-4" />
                <span>Tarjeta</span>
              </TabsTrigger>
              <TabsTrigger value="qr" className="flex items-center space-x-1">
                <Smartphone className="h-4 w-4" />
                <span>QR</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cash" className="space-y-4">
              <div>
                <Label htmlFor="cash-amount">Monto recibido</Label>
                <Input
                  id="cash-amount"
                  type="number"
                  step="0.01"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(Number(e.target.value))}
                  className="text-lg font-semibold"
                />
              </div>
              
              {change >= 0 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">Vuelto</p>
                  <p className="text-xl font-bold text-green-800">${change.toFixed(2)}</p>
                </div>
              )}
              
              {change < 0 && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-700">Falta</p>
                  <p className="text-xl font-bold text-red-800">${Math.abs(change).toFixed(2)}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="card" className="space-y-4">
              <div>
                <Label htmlFor="card-amount">Monto a cobrar</Label>
                <Input
                  id="card-amount"
                  type="number"
                  step="0.01"
                  value={cardAmount}
                  onChange={(e) => setCardAmount(Number(e.target.value))}
                  className="text-lg font-semibold"
                />
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">Conectar terminal de tarjeta</p>
                <p className="text-xs text-blue-600">Sigue las instrucciones del dispositivo</p>
              </div>
            </TabsContent>

            <TabsContent value="qr" className="space-y-4">
              <div className="text-center space-y-4">
                <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                  <Smartphone className="h-12 w-12 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600">Código QR de Mercado Pago</p>
                <Button onClick={handleMercadoPago} variant="outline" className="w-full">
                  Generar QR
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex space-x-2 pt-4">
            <Button
              onClick={handlePayment}
              disabled={processing || (paymentMethod === 'cash' && change < 0)}
              className="flex-1 gradient-bg text-white"
            >
              {processing ? (
                "Procesando..."
              ) : (
                <>
                  <Receipt className="h-4 w-4 mr-2" />
                  Confirmar Pago
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={processing}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
