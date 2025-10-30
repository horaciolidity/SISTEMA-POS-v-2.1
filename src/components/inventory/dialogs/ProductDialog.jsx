import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const ProductDialog = ({ open, onClose, product = null, onSave }) => {
  const [form, setForm] = useState({
    id: '',
    sku: '',
    name: '',
    category: '',
    price: 0,
    cost: 0,
    tax_rate: 0.21,
    stock: 0,
    min_stock: 5,
    active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    if (product) setForm(product);
    else setForm({
      id: Date.now().toString(),
      sku: '',
      name: '',
      category: '',
      price: 0,
      cost: 0,
      tax_rate: 0.21,
      stock: 0,
      min_stock: 5,
      active: true
    });
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'cost' || name === 'stock' || name === 'min_stock'
        ? parseFloat(value)
        : value
    }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.sku) {
      toast({ title: 'Error', description: 'Completa nombre y SKU', variant: 'destructive' });
      return;
    }

    onSave(form);
    toast({
      title: product ? 'Producto actualizado' : 'Producto creado',
      description: form.name,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>SKU</Label>
            <Input name="sku" value={form.sku} onChange={handleChange} />
          </div>
          <div>
            <Label>Nombre</Label>
            <Input name="name" value={form.name} onChange={handleChange} />
          </div>
          <div>
            <Label>Categoría</Label>
            <Input name="category" value={form.category} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Costo</Label>
              <Input type="number" step="0.01" name="cost" value={form.cost} onChange={handleChange} />
            </div>
            <div>
              <Label>Precio</Label>
              <Input type="number" step="0.01" name="price" value={form.price} onChange={handleChange} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Stock</Label>
              <Input type="number" name="stock" value={form.stock} onChange={handleChange} />
            </div>
            <div>
              <Label>Stock mínimo</Label>
              <Input type="number" name="min_stock" value={form.min_stock} onChange={handleChange} />
            </div>
          </div>

          <div className="flex justify-end pt-4 space-x-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button className="gradient-bg text-white" onClick={handleSubmit}>
              {product ? 'Guardar cambios' : 'Agregar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;
