import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const MovementDialog = ({ open, onClose, product, onSave }) => {
  const [type, setType] = useState('in'); // 'in' o 'out'
  const [quantity, setQuantity] = useState(0);
  const [note, setNote] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (quantity <= 0) {
      toast({ title: 'Error', description: 'Cantidad inválida', variant: 'destructive' });
      return;
    }

    const movement = {
      id: Date.now().toString(),
      product_id: product?.id,
      product_name: product?.name,
      type,
      quantity,
      note,
      created_at: new Date().toISOString(),
    };

    onSave(movement);
    toast({
      title: 'Movimiento registrado',
      description: `${type === 'in' ? 'Entrada' : 'Salida'} de ${quantity} unidades`,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Movimiento de Stock</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Tipo</Label>
            <div className="flex gap-2 pt-1">
              <Button
                variant={type === 'in' ? 'default' : 'outline'}
                onClick={() => setType('in')}
                className="flex-1"
              >
                Entrada
              </Button>
              <Button
                variant={type === 'out' ? 'default' : 'outline'}
                onClick={() => setType('out')}
                className="flex-1"
              >
                Salida
              </Button>
            </div>
          </div>

          <div>
            <Label>Cantidad</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>

          <div>
            <Label>Motivo / Nota</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Opcional" />
          </div>

          <div className="flex justify-end pt-4 space-x-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button className="gradient-bg text-white" onClick={handleSubmit}>
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MovementDialog;
