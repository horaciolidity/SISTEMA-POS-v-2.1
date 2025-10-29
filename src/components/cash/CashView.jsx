
import React, { useState } from 'react';
import { DollarSign, ArrowUp, ArrowDown, BookOpen, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePOS } from '@/contexts/POSContext';
import { useToast } from '@/components/ui/use-toast';

const CashView = () => {
  const { cashSession, openCashSession, closeCashSession } = usePOS();
  const [openingAmount, setOpeningAmount] = useState(0);
  const [closingAmount, setClosingAmount] = useState(0);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const { toast } = useToast();
  
  const sales = JSON.parse(localStorage.getItem('pos_sales') || '[]');
  const sessionSales = sales.filter(s => new Date(s.opened_at) > new Date(cashSession?.opened_at || 0));

  const expectedAmount = (cashSession?.opening_amount || 0) + sessionSales.reduce((sum, s) => s.payment.method === 'cash' ? sum + s.total : sum, 0);

  const handleOpenSession = () => {
    openCashSession(openingAmount);
    setShowOpenDialog(false);
  };

  const handleCloseSession = () => {
    closeCashSession(closingAmount);
    setShowCloseDialog(false);
  };

  const handleCashMovement = (type) => {
    toast({
      title: "🚧 Esta función no está implementada aún—¡pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀"
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Caja</h1>
          <p className="text-gray-600">Apertura, cierre y movimientos de caja</p>
        </div>
        {cashSession ? (
          <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <XCircle className="h-4 w-4 mr-2" />
                Cerrar Caja
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cierre de Caja</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm">Monto esperado en caja</p>
                    <p className="text-xl font-bold">${expectedAmount.toFixed(2)}</p>
                </div>
                <div>
                  <Label htmlFor="closing-amount">Monto contado</Label>
                  <Input id="closing-amount" type="number" value={closingAmount} onChange={(e) => setClosingAmount(Number(e.target.value))} />
                </div>
                <Button onClick={handleCloseSession} className="w-full">Confirmar Cierre</Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Dialog open={showOpenDialog} onOpenChange={setShowOpenDialog}>
            <DialogTrigger asChild>
              <Button className="gradient-bg text-white">
                <BookOpen className="h-4 w-4 mr-2" />
                Abrir Caja
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Apertura de Caja</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="opening-amount">Monto Inicial</Label>
                  <Input id="opening-amount" type="number" value={openingAmount} onChange={(e) => setOpeningAmount(Number(e.target.value))} />
                </div>
                <Button onClick={handleOpenSession} className="w-full">Confirmar Apertura</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {cashSession ? (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-600">Monto Inicial</p>
                        <p className="text-2xl font-bold">${cashSession.opening_amount.toFixed(2)}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-600">Ventas en Efectivo</p>
                        <p className="text-2xl font-bold">${sessionSales.reduce((sum, s) => s.payment.method === 'cash' ? sum + s.total : sum, 0).toFixed(2)}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-600">Monto Esperado</p>
                        <p className="text-2xl font-bold text-green-600">${expectedAmount.toFixed(2)}</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Movimientos de Caja</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex space-x-2">
                        <Button variant="outline" onClick={() => handleCashMovement('income')}><ArrowUp className="h-4 w-4 mr-2 text-green-500" /> Ingreso</Button>
                        <Button variant="outline" onClick={() => handleCashMovement('expense')}><ArrowDown className="h-4 w-4 mr-2 text-red-500" /> Egreso</Button>
                    </div>
                    <div className="mt-4 h-40 flex items-center justify-center text-gray-500 border rounded-lg">
                        <p>No hay movimientos registrados en esta sesión.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-10 text-center">
            <DollarSign className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold">Caja Cerrada</h2>
            <p className="text-gray-600">Debes abrir la caja para comenzar a operar.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CashView;
