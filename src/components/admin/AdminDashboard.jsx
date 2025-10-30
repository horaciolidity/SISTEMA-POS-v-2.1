import React, { useEffect, useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { RefreshCw, TrendingUp, DollarSign, ShoppingCart, Layers } from "lucide-react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

const AdminDashboard = () => {
  const { toast } = useToast();
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [cashMovs, setCashMovs] = useState([]);

  /* === Cargar datos === */
  useEffect(() => {
    setSales(JSON.parse(localStorage.getItem("pos_sales") || "[]"));
    setProducts(JSON.parse(localStorage.getItem("pos_products") || "[]"));
    setCashMovs(JSON.parse(localStorage.getItem("pos_cash_movements") || "[]"));
  }, []);

  /* === Cálculos === */
  const data = useMemo(() => {
    if (!sales.length) return {};

    // Ventas por día (últimos 7 días)
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const date = dayjs().subtract(6 - i, "day").format("YYYY-MM-DD");
      const total = sales
        .filter((s) => dayjs(s.closed_at).isSame(date, "day"))
        .reduce((sum, s) => sum + s.total, 0);
      return { date, total };
    });

    // Categorías de producto
    const categoryTotals = {};
    products.forEach((p) => {
      const cat = p.category || "Sin categoría";
      if (!categoryTotals[cat]) categoryTotals[cat] = { category: cat, stock: 0 };
      categoryTotals[cat].stock += p.stock;
    });

    // Productos más vendidos
    const productStats = {};
    sales.forEach((s) =>
      s.items?.forEach((i) => {
        if (!productStats[i.name]) productStats[i.name] = 0;
        productStats[i.name] += i.qty;
      })
    );

    const topProducts = Object.entries(productStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, qty]) => ({ name, qty }));

    // Ingresos y egresos
    const totalIncome = cashMovs
      .filter((m) => m.type === "income")
      .reduce((sum, m) => sum + m.amount, 0);
    const totalExpense = cashMovs
      .filter((m) => m.type === "expense")
      .reduce((sum, m) => sum + m.amount, 0);
    const net = totalIncome - totalExpense;

    return { last7Days, categoryTotals: Object.values(categoryTotals), topProducts, totalIncome, totalExpense, net };
  }, [sales, products, cashMovs]);

  if (!sales.length) {
    return <p className="text-center text-gray-500 mt-10">No hay datos de ventas registrados aún.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Estadísticas Generales
        </h2>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> Actualizar
        </Button>
      </div>

      {/* Tarjetas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Card className="dark:bg-gray-800/70">
          <CardHeader className="flex items-center gap-2">
            <DollarSign className="text-green-500" />
            <CardTitle>Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${data.totalIncome?.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800/70">
          <CardHeader className="flex items-center gap-2">
            <TrendingUp className="text-blue-500" />
            <CardTitle>Egresos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${data.totalExpense?.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800/70">
          <CardHeader className="flex items-center gap-2">
            <ShoppingCart className="text-yellow-500" />
            <CardTitle>Balance Neto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${data.net >= 0 ? "text-green-600" : "text-red-500"}`}>
              ${data.net?.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800/70">
          <CardHeader className="flex items-center gap-2">
            <Layers className="text-purple-500" />
            <CardTitle>Categorías</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {data.categoryTotals?.length ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de ventas diarias */}
      <Card className="dark:bg-gray-800/70">
        <CardHeader>
          <CardTitle>Ventas últimos 7 días</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#555" opacity={0.2} />
              <XAxis dataKey="date" tickFormatter={(d) => dayjs(d).format("DD/MM")} />
              <YAxis />
              <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
              <Bar dataKey="total" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de stock por categoría */}
      <Card className="dark:bg-gray-800/70">
        <CardHeader>
          <CardTitle>Stock por Categoría</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.categoryTotals}
                dataKey="stock"
                nameKey="category"
                outerRadius={100}
                label
              >
                {data.categoryTotals.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Productos más vendidos */}
      <Card className="dark:bg-gray-800/70">
        <CardHeader>
          <CardTitle>Top 5 Productos Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-700 text-left">
                <th>Producto</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.map((p, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                >
                  <td>{p.name}</td>
                  <td>{p.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
