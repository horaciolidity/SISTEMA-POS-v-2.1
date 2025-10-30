import React, { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DollarSign,
  ArrowDownCircle,
  ArrowUpCircle,
  Save,
  RefreshCw,
  Trash2,
  Calendar,
  FileText,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import dayjs from "dayjs";

const CashView = () => {
  const { toast } = useToast();
  const [movements, setMovements] = useState([]);
  const [sales, setSales] = useState([]);
  const [form, setForm] = useState({
    type: "income", // income | expense
    description: "",
    amount: "",
  });

  /* === Cargar datos === */
  useEffect(() => {
    const storedMovs = JSON.parse(localStorage.getItem("pos_cash_movements") || "[]");
    const storedSales = JSON.parse(localStorage.getItem("pos_sales") || "[]");
    setMovements(storedMovs);
    setSales(storedSales);
  }, []);

  /* === Guardar === */
  const saveMovements = (list) => {
    localStorage.setItem("pos_cash_movements", JSON.stringify(list));
    setMovements(list);
  };

  /* === Agregar movimiento manual === */
  const handleAdd = () => {
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast({
        title: "Monto inválido",
        description: "Debes ingresar un monto válido mayor que 0",
        variant: "destructive",
      });
      return;
    }

    const newMov = {
      id: crypto.randomUUID(),
      type: form.type,
      description: form.description || "(sin descripción)",
      amount: parseFloat(form.amount),
      created_at: new Date().toISOString(),
    };

    const updated = [...movements, newMov];
    saveMovements(updated);

    toast({
      title: form.type === "income" ? "💰 Ingreso registrado" : "💸 Egreso registrado",
      description: `${newMov.description} - $${newMov.amount.toFixed(2)}`,
    });

    setForm({ type: "income", description: "", amount: "" });
  };

  /* === Eliminar movimiento === */
  const handleDelete = (id) => {
    if (!confirm("¿Eliminar este movimiento?")) return;
    const updated = movements.filter((m) => m.id !== id);
    saveMovements(updated);
  };

  /* === Cierre de caja === */
  const handleCloseCash = () => {
    if (!movements.length && !sales.length) {
      toast({
        title: "Sin movimientos",
        description: "No hay movimientos registrados para cerrar la caja",
        variant: "destructive",
      });
      return;
    }

    const today = dayjs().format("YYYY-MM-DD");
    const totalSales = sales
      .filter((s) => dayjs(s.closed_at).isSame(today, "day"))
      .reduce((sum, s) => sum + s.total, 0);

    const incomes = movements
      .filter((m) => m.type === "income")
      .reduce((sum, m) => sum + m.amount, 0);
    const expenses = movements
      .filter((m) => m.type === "expense")
      .reduce((sum, m) => sum + m.amount, 0);

    const total = totalSales + incomes - expenses;

    toast({
      title: "🧾 Cierre de Caja",
      description: `Total ventas: $${totalSales.toFixed(2)} | Efectivo neto: $${total.toFixed(2)}`,
      duration: 5000,
    });

    // Reset caja diaria
    saveMovements([]);
  };

  /* === Cálculos === */
  const totals = useMemo(() => {
    const today = dayjs().format("YYYY-MM-DD");
    const dailySales = sales.filter((s) => dayjs(s.closed_at).isSame(today, "day"));
    const dailySalesTotal = dailySales.reduce((sum, s) => sum + s.total, 0);

    const incomes = movements
      .filter((m) => m.type === "income")
      .reduce((sum, m) => sum + m.amount, 0);
    const expenses = movements
      .filter((m) => m.type === "expense")
      .reduce((sum, m) => sum + m.amount, 0);

    return {
      dailySalesTotal,
      incomes,
      expenses,
      netCash: dailySalesTotal + incomes - expenses,
    };
  }, [movements, sales]);

  return (
    <div className="p-6 space-y-6">
      {/* === Resumen de Caja === */}
      <Card className="border-gray-200 dark:border-gray-700 dark:bg-gray-800/70">
        <CardHeader className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-500" />
          <CardTitle>Resumen Diario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-md">
              <p className="text-sm text-gray-500">Ventas del día</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${totals.dailySalesTotal.toFixed(2)}
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md">
              <p className="text-sm text-gray-500">Ingresos manuales</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${totals.incomes.toFixed(2)}
              </p>
            </div>

            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-md">
              <p className="text-sm text-gray-500">Egresos</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                ${totals.expenses.toFixed(2)}
              </p>
            </div>

            <div className="bg-gray-100 dark:bg-gray-700/60 p-3 rounded-md">
              <p className="text-sm text-gray-500">Efectivo actual</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                ${totals.netCash.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={handleCloseCash} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
              <FileText className="h-4 w-4" /> Cerrar Caja
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* === Registrar movimiento manual === */}
      <Card className="border-gray-200 dark:border-gray-700 dark:bg-gray-800/70">
        <CardHeader>
          <CardTitle>Registrar Movimiento Manual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Tipo</Label>
              <select
                name="type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="border border-gray-300 rounded-md p-2 w-full dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="income">Ingreso</option>
                <option value="expense">Egreso</option>
              </select>
            </div>

            <div>
              <Label>Descripción</Label>
              <Input
                name="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ej: Pago proveedor, ajuste, etc."
              />
            </div>

            <div>
              <Label>Monto</Label>
              <Input
                type="number"
                name="amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="Ej: 500"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={handleAdd} className="flex items-center gap-2">
              <Save className="h-4 w-4" /> Guardar Movimiento
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* === Tabla de movimientos === */}
      <Card className="border-gray-200 dark:border-gray-700 dark:bg-gray-800/70">
        <CardHeader className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <CardTitle>Movimientos de Caja ({movements.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {movements.length === 0 ? (
            <p className="text-gray-500">No hay movimientos registrados hoy.</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-300 dark:border-gray-700">
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>Monto</th>
                    <th>Fecha</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                    >
                      <td className="py-1 font-medium">
                        {m.type === "income" ? (
                          <span className="text-green-600">Ingreso</span>
                        ) : (
                          <span className="text-red-600">Egreso</span>
                        )}
                      </td>
                      <td>{m.description}</td>
                      <td>${m.amount.toFixed(2)}</td>
                      <td>{dayjs(m.created_at).format("DD/MM/YYYY HH:mm")}</td>
                      <td>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(m.id)}
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
  );
};

export default CashView;
