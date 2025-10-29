
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Pause, 
  FileText,
  Calculator
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePOS } from '@/contexts/POSContext';
import PaymentDialog from './PaymentDialog';
import { useToast } from '@/components/ui/use-toast';

const Cart = () => {
  const {
    cart,
    customer,
    discount,
    saleStatus,
    removeFromCart,
    updateQuantity,
    clearCart,
    setDiscount,
    suspendSale,
    resumeSale,
    calculateSubtotal,
    calculateTax,
    calculateTotal
  } = usePOS();

  const [showPayment, setShowPayment] = useState(false);
  const { toast } = useToast();

  const subtotal = calculateSubtotal();
  const tax = calculateTax();
  const total = calculateTotal();
  const discountAmount = subtotal * (discount / 100);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleSuspend = () => {
    if (cart.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "No hay productos para suspender",
        variant: "destructive",
        duration: 3000
      });
      return;
    }
    suspendSale();
  };

  const handlePayment = () => {
    if (cart.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos antes de procesar el pago",
        variant: "destructive",
        duration: 3000
      });
      return;
    }
    setShowPayment(true);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Carrito</span>
            {cart.length > 0 && (
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                {cart.length}
              </span>
            )}
          </div>
          
          {saleStatus === 'suspended' && (
            <Button
              variant="outline"
              size="sm"
              onClick={resumeSale}
              className="text-orange-600 border-orange-600"
            >
              Reanudar
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Customer Info */}
        {customer && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="font-medium text-blue-900">{customer.name}</p>
            <p className="text-sm text-blue-700">{customer.doc_number}</p>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-auto space-y-2 mb-4">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="border rounded-lg p-3 bg-white"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{item.name}</h4>
                    <p className="text-xs text-gray-500">${item.price.toFixed(2)} c/u</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {cart.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <ShoppingCart className="h-12 w-12 mb-2" />
              <p>Carrito vacío</p>
            </div>
          )}
        </div>

        {/* Discount */}
        {cart.length > 0 && (
          <div className="mb-4 space-y-2">
            <Label htmlFor="discount">Descuento (%)</Label>
            <Input
              id="discount"
              type="number"
              min="0"
              max="100"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              placeholder="0"
            />
          </div>
        )}

        {/* Totals */}
        {cart.length > 0 && (
          <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>Descuento ({discount}%):</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>IVA:</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          {cart.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => toast({
                    title: "🚧 Esta función no está implementada aún—¡pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀"
                  })}
                  className="flex items-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Presupuesto</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSuspend}
                  className="flex items-center space-x-2"
                >
                  <Pause className="h-4 w-4" />
                  <span>Suspender</span>
                </Button>
              </div>
              
              <Button
                onClick={handlePayment}
                className="w-full gradient-bg text-white font-semibold"
                size="lg"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Cobrar ${total.toFixed(2)}
              </Button>
            </>
          )}
          
          {cart.length > 0 && (
            <Button
              variant="outline"
              onClick={clearCart}
              className="w-full text-red-600 border-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpiar Carrito
            </Button>
          )}
        </div>
      </CardContent>

      {/* Payment Dialog */}
      <PaymentDialog
        open={showPayment}
        onClose={() => setShowPayment(false)}
        total={total}
        cart={cart}
        customer={customer}
        discount={discount}
      />
    </Card>
  );
};

export default Cart;
