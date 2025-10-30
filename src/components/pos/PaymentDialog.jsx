// src/components/pos/dialogs/PaymentDialog.jsx
import React, { useState } from "react";
import { CreditCard, DollarSign, Smartphone, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { usePOS } from "@/contexts/POSContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { createPrinter } from "@/lib/printing/printerFactory";

const PaymentDialog = ({ open, onClose, total, cart, customer, discount }) => {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashAmount, setCashAmount] = useState(total);
  const [cardAmount, setCardAmount] = useState(total);
  const [processing, setProcessing] = useState(false);
  const { confirmSale, cashSession } = usePOS();
  const { user } = useAuth();
  const { toast } = useToast();

  const change = cashAmount - total;

  /* =============================
     📦 Procesar Pago / Registrar Venta
  ============================== */
  const handlePayment = async () => {
    if (!cashSession) {
      toast({
        title: "Caja cerrada",
        description: "Debes abrir la caja antes de procesar una venta.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Sesión no iniciada",
        description: "Debes iniciar sesión para registrar la venta.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      const sale = {
        id: Date.now().toString(),
        number: `V-${Date.now()}`,
        user_email: user.email,
        user_role: user.role,
        customer: customer ? customer.name : "Consumidor Final",
        status: "completed",
        subtotal: cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
        tax_total: cart.reduce((sum, i) => sum + (i.price * i.quantity * (i.tax_rate ?? 0.21)), 0),
        discount_total:
          cart.reduce((sum, i) => sum + i.price * i.quantity, 0) * (discount / 100),
        total,
        paid_total: paymentMethod === "cash" ? cashAmount : cardAmount,
        change: paymentMethod === "cash" ? change : 0,
        payment_method: paymentMethod,
        timestamp: new Date().toISOString(),
        items: cart.map((i) => ({
          product_id: i.id,
          name: i.name,
          qty: i.quantity,
          price: i.price,
          total: i.price * i.quantity,
          tax_rate: i.tax_rate ?? 0.21,
        })),
      };

      // Guardar venta local
      const previous = JSON.parse(localStorage.getItem("pos_sales") || "[]");
      localStorage.setItem("pos_sales", JSON.stringify([...previous, sale]));

      // Imprimir ticket
      await printReceipt(sale);

      // Confirmar en contexto
      confirmSale(paymentMethod);

      toast({
        title: "✅ Venta completada",
        description: `Venta ${sale.number} registrada exitosamente.`,
        duration: 4000,
      });

      onClose();
    } catch (error) {
      console.error("Error al procesar venta:", error);
      toast({
        title: "Error en el pago",
        description: "No se pudo completar la venta.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  /* =============================
     🖨️ Imprimir Ticket
  ============================== */
  const printReceipt = async (sale) => {
    try {
      const printer = createPrinter();
      await printer.printReceipt(sale);
    } catch (error) {
      console.error("Error al imprimir ticket:", error);
      toast({
        title: "Error de impresión",
        description: "La venta fue registrada pero no se imprimió el ticket.",
        variant: "destructive",
      });
    }
  };

  /* =============================
     ⚡ QR Placeholder
  ============================== */
  const handleMercadoPago = () => {
    toast({
      title: "🚧 Función en desarrollo",
      description: "La integración con Mercado Pago QR estará disponible próximamente.",
    });
  };

  /* =============================
     🎨 Render
  ============================== */
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
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-600">Total a cobrar</p>
              <p className="text-3xl font-bold text-green-600">${total.toFixed(2)}</p>
            </CardContent>
          </Card>

          {/* Métodos de pago */}
          <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cash">
                <DollarSign className="h-4 w-4 mr-1" /> Efectivo
              </TabsTrigger>
              <TabsTrigger value="card">
                <CreditCard className="h-4 w-4 mr-1" /> Tarjeta
              </TabsTrigger>
              <TabsTrigger value="qr">
                <Smartphone className="h-4 w-4 mr-1" /> QR
              </TabsTrigger>
            </TabsList>

            {/* Efectivo */}
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

              {change >= 0 ? (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">Vuelto</p>
                  <p className="text-xl font-bold text-green-800">${change.toFixed(2)}</p>
                </div>
              ) : (
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-700">Falta</p>
                  <p className="text-xl font-bold text-red-800">${Math.abs(change).toFixed(2)}</p>
                </div>
              )}
            </TabsContent>

            {/* Tarjeta */}
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
              <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                Conecta la terminal de pago y sigue las instrucciones.
              </div>
            </TabsContent>

            {/* QR */}
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

          {/* Acciones */}
          <div className="flex space-x-2 pt-4">
            <Button
              onClick={handlePayment}
              disabled={processing || (paymentMethod === "cash" && change < 0)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {processing ? "Procesando..." : (
                <>
                  <Receipt className="h-4 w-4 mr-2" /> Confirmar Pago
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
