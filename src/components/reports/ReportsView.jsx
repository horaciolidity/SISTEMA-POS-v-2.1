import React, { useEffect, useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  FileDown,
  BarChart3,
  TrendingUp,
  Clock,
  Layers,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import dayjs from "dayjs";

const ReportsView = () => {
  const { toast } = useToast();
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  /* === Cargar datos === */
  useEffect(() => {
    setSales(JSON.parse(localStorage.getItem("pos_sales") || "[]"));
    setProducts(JSON.parse(localStorage.getItem("pos_products") || "[]"));
  }, []);

  /* === Filtrar ventas por fecha === */
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (startDate && dayjs(s.closed_at).isBefore(startDate)) return false;
      if (endDate && dayjs(s.closed_at).isAfter(endDate)) return false;
      return true;
    });
  }, [sales, startDate, endDate]);

  /* === Métricas === */
  const metrics = useMemo(() => {
    if (filteredSales.length === 0) return {};

    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
    const totalTickets = filteredSales.length;
    const avgTicket = totalRevenue / totalTickets;

    // Agrupado por producto
    const productStats = {};
    filteredSales.forEach((sale) => {
      sale.items?.forEach((item) => {
        if (!productStats[item.name]) {
          productStats[item.name] = { qty: 0, total: 0, category: item.category };
        }
        productStats[item.name].qty += item.qty;
        productStats[item.name].total += item.qty * item.price;
      });
    });

    // Agrupado por categoría
    const categoryStats = {};
    Object.values(productStats).forEach((p) => {
      const cat = p.category || "Sin categoría";
      if (!categoryStats[cat]) categoryStats[cat] = { qty: 0, total: 0 };
      categoryStats[cat].qty += p.qty;
      categoryStats[cat].total += p.total;
    });

    // Hora pico
    const hours = {};
    filteredSales.forEach((s) => {
      const h = dayjs(s.closed_at).hour();
      hours[h] = (hours[h] || 0) + 1;
    });
    const peakHour = Object.entries(hours).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    return {
      totalRevenue,
      totalTickets,
      avgTicket,
      productStats,
      categoryStats,
      peakHour,
    };
  }, [filteredSales]);

  /* === Exportar CSV === */
  const exportCSV = () => {
    if (!filteredSales.length) {
      toast({ title: "Sin datos", description: "No hay ventas en el rango seleccionado" });
      return;
    }

    const header = "Fecha,Producto,Categoría,Cantidad,Precio Total\n";
    let csv = header;

    filteredSales.forEach((s) => {
      s.items?.forEach((i) => {
        csv += `${dayjs(s.closed_at).format("DD/MM/YYYY")},${i.name},${i.category},${i.qty},${(
          i.qty * i.price
        ).toFixed(2)}\n`;
      });
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_ventas_${dayjs().format("YYYYMMDD")}.csv`;
    link.click();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Reportes de Ventas
        </h2>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> Actualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card className="dark:bg-gray-800/70">
        <CardHeader>
          <CardTitle>Filtrar por Fecha</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Desde</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label>Hasta</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button onClick={exportCSV} className="flex items-center gap-2">
              <FileDown className="h-4 w-4" /> Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Métricas principales */}
      {filteredSales.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Card className="dark:bg-gray-800/70">
              <CardHeader className="flex items-center gap-2">
                <BarChart3 className="text-green-500" />
                <CardTitle>Ingresos Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${metrics.totalRevenue.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800/70">
              <CardHeader className="flex items-center gap-2">
                <TrendingUp className="text-blue-500" />
                <CardTitle>Ticket Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${metrics.avgTicket.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800/70">
              <CardHeader className="flex items-center gap-2">
                <Clock className="text-yellow-500" />
                <CardTitle>Hora Pico</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {metrics.peakHour}:00 hs
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800/70">
              <CardHeader className="flex items-center gap-2">
                <Layers className="text-purple-500" />
                <CardTitle>Ventas Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {metrics.totalTickets}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Ranking de productos */}
          <Card className="dark:bg-gray-800/70">
            <CardHeader>
              <CardTitle>Top Productos Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-gray-700 text-left">
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Cantidad</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(metrics.productStats)
                    .sort((a, b) => b[1].qty - a[1].qty)
                    .slice(0, 10)
                    .map(([name, data]) => (
                      <tr
                        key={name}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                      >
                        <td>{name}</td>
                        <td>{data.category}</td>
                        <td>{data.qty}</td>
                        <td>${data.total.toFixed(2)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Por categoría */}
          <Card className="dark:bg-gray-800/70">
            <CardHeader>
              <CardTitle>Ventas por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-gray-700 text-left">
                    <th>Categoría</th>
                    <th>Cantidad</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(metrics.categoryStats).map(([cat, data]) => (
                    <tr
                      key={cat}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                    >
                      <td>{cat}</td>
                      <td>{data.qty}</td>
                      <td>${data.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      ) : (
        <p className="text-gray-500 text-center">No hay ventas registradas en este rango.</p>
      )}
    </div>
  );
};

export default ReportsView;
