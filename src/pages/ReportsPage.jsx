import React, { useEffect, useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign, BarChart3, PieChart, Calendar, TrendingUp, Users } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Pie, PieChart as RCPieChart, Cell } from "recharts";
import dayjs from "dayjs";
import { useAuth } from "@/contexts/AuthContext";

const ReportsView = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [filter, setFilter] = useState("month"); // day | week | month

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("pos_sales") || "[]");
    setSales(stored);
  }, []);

  /* === Filtros === */
  const filteredSales = useMemo(() => {
    const now = dayjs();
    return sales.filter((s) => {
      const saleDate = dayjs(s.closed_at);
      if (filter === "day") return saleDate.isSame(now, "day");
      if (filter === "week") return saleDate.isSame(now, "week");
      if (filter === "month") return saleDate.isSame(now, "month");
      return true;
    });
  }, [sales, filter]);

  /* === Cálculos principales === */
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const totalCount = filteredSales.length;
  const avgTicket = totalCount > 0 ? totalRevenue / totalCount : 0;

  const paymentTotals = useMemo(() => {
    const totals = { cash: 0, card: 0, qr: 0 };
    filteredSales.forEach((s) => {
      if (s.payment?.method === "cash") totals.cash += s.total;
      else if (s.payment?.method === "card") totals.card += s.total;
      else if (s.payment?.method === "qr") totals.qr += s.total;
    });
    return totals;
  }, [filteredSales]);

  const topProducts = useMemo(() => {
    const map = {};
    filteredSales.forEach((s) => {
      s.items?.forEach((i) => {
        if (!map[i.product_id])
          map[i.product_id] = { name: i.name || `#${i.product_id}`, qty: 0, total: 0 };
        map[i.product_id].qty += i.qty;
        map[i.product_id].total += i.total;
      });
    });
    return Object.values(map)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [filteredSales]);

  const chartData = useMemo(() => {
    const grouped = {};
    filteredSales.forEach((s) => {
      const date = dayjs(s.closed_at).format("DD/MM");
      grouped[date] = (grouped[date] || 0) + s.total;
    });
    return Object.keys(grouped).map((k) => ({ date: k, total: grouped[k] }));
  }, [filteredSales]);

  const COLORS = ["#00C49F", "#0088FE", "#FFBB28"];

  return (
    <div className="p-6 space-y-6">
      {/* === Filtros de período === */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Reportes de Ventas
        </h2>
        <div className="flex gap-2">
          {["day", "week", "month"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
              }`}
            >
              {f === "day" ? "Hoy" : f === "week" ? "Semana" : "Mes"}
            </button>
          ))}
        </div>
      </div>

      {/* === Resumen general === */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            <CardTitle>Total Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <CardTitle>Operaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <CardTitle>Ticket Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${avgTicket.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-500" />
            <CardTitle>Usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{user?.email || "Empleado POS"}</p>
          </CardContent>
        </Card>
      </div>

      {/* === Gráfico de ingresos === */}
      <Card className="dark:bg-gray-800/70">
        <CardHeader className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <CardTitle>Ventas por Día</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-gray-500">No hay ventas registradas aún.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" stroke="#888" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* === Gráfico de métodos de pago === */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="dark:bg-gray-800/70">
          <CardHeader className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-gray-400" />
            <CardTitle>Distribución por Método de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <RCPieChart>
                <Pie
                  data={[
                    { name: "Efectivo", value: paymentTotals.cash },
                    { name: "Tarjeta", value: paymentTotals.card },
                    { name: "QR", value: paymentTotals.qr },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {COLORS.map((color, index) => (
                    <Cell key={index} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </RCPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Productos más vendidos */}
        <Card className="dark:bg-gray-800/70">
          <CardHeader className="flex items-center gap-2">
            <PackageSearch className="h-5 w-5 text-gray-400" />
            <CardTitle>Productos más vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-gray-500">Aún no se registraron ventas.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-gray-700">
                    <th className="py-1">Producto</th>
                    <th>Cantidad</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/40"
                    >
                      <td className="py-1">{p.name}</td>
                      <td>{p.qty}</td>
                      <td>${p.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsView;
