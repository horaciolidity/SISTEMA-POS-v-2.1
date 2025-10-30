import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart3,
  Users,
  DollarSign,
  Timer,
  AlertTriangle,
  TrendingUp,
  Activity,
  FileText,
  FileSpreadsheet,
  FileDown,
  Filter,
  X,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

const EmployeeReports = ({ shifts = [] }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  /* === Filtro de fechas === */
  const filteredShifts = useMemo(() => {
    if (!startDate && !endDate) return shifts;

    return shifts.filter((s) => {
      const d = dayjs(s.started_at);
      const afterStart = startDate ? d.isAfter(dayjs(startDate).subtract(1, "day")) : true;
      const beforeEnd = endDate ? d.isBefore(dayjs(endDate).add(1, "day")) : true;
      return afterStart && beforeEnd;
    });
  }, [shifts, startDate, endDate]);

  /* === Agrupar por empleado === */
  const reports = useMemo(() => {
    const map = {};
    filteredShifts.forEach((s) => {
      if (!s.employee) return;
      if (!map[s.employee]) {
        map[s.employee] = {
          total_turns: 0,
          total_duration: 0,
          total_cash_open: 0,
          total_cash_close: 0,
          total_difference: 0,
        };
      }
      const entry = map[s.employee];
      entry.total_turns += 1;
      entry.total_duration += s.duration || 0;
      entry.total_cash_open += s.cash_open || 0;
      entry.total_cash_close += s.cash_close || 0;
      entry.total_difference += s.difference || 0;
    });

    return Object.entries(map).map(([employee, data]) => ({
      employee,
      ...data,
      avg_duration: data.total_duration / data.total_turns,
      avg_difference: data.total_difference / data.total_turns,
      total_handled: data.total_cash_close + data.total_cash_open,
    }));
  }, [filteredShifts]);

  /* === Totales === */
  const totals = useMemo(() => {
    const employees = reports.length;
    const totalCash = reports.reduce((sum, r) => sum + r.total_cash_close, 0);
    const avgDiff =
      reports.reduce((sum, r) => sum + r.avg_difference, 0) / Math.max(1, employees);
    const avgDuration =
      reports.reduce((sum, r) => sum + r.avg_duration, 0) / Math.max(1, employees);
    return { employees, totalCash, avgDiff, avgDuration };
  }, [reports]);

  /* === Exportar a PDF === */
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Reporte de Empleados - Sistema POS", 14, 18);

    if (startDate || endDate) {
      doc.setFontSize(11);
      doc.text(
        `Rango: ${startDate || "inicio"} - ${endDate || "actual"}`,
        14,
        25
      );
    }

    const tableData = reports.map((r) => [
      r.employee,
      r.total_turns,
      `${r.avg_duration.toFixed(1)} min`,
      `$${r.avg_difference.toFixed(2)}`,
      `$${r.total_cash_close.toFixed(2)}`,
      `$${r.total_handled.toFixed(2)}`,
    ]);

    doc.autoTable({
      startY: startDate || endDate ? 32 : 25,
      head: [["Empleado", "Turnos", "Prom. Duración", "Prom. Diferencia", "Caja Total", "Movido"]],
      body: tableData,
    });

    doc.text(
      `Total empleados: ${totals.employees} | Caja total: $${totals.totalCash.toFixed(
        2
      )}`,
      14,
      doc.lastAutoTable.finalY + 10
    );

    doc.save("reporte_empleados.pdf");
  };

  /* === Exportar a Excel === */
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      reports.map((r) => ({
        Empleado: r.employee,
        Turnos: r.total_turns,
        "Promedio Duración (min)": r.avg_duration.toFixed(1),
        "Promedio Diferencia ($)": r.avg_difference.toFixed(2),
        "Caja Total ($)": r.total_cash_close.toFixed(2),
        "Efectivo Movido ($)": r.total_handled.toFixed(2),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte Empleados");
    XLSX.writeFile(workbook, "reporte_empleados.xlsx");
  };

  /* === Exportar a TXT === */
  const exportTXT = () => {
    let text = "REPORTE DE EMPLEADOS - SISTEMA POS\n\n";
    if (startDate || endDate)
      text += `Rango: ${startDate || "inicio"} - ${endDate || "actual"}\n\n`;

    reports.forEach((r) => {
      text += `Empleado: ${r.employee}\n`;
      text += `Turnos: ${r.total_turns}\n`;
      text += `Prom. Duración: ${r.avg_duration.toFixed(1)} min\n`;
      text += `Prom. Diferencia: $${r.avg_difference.toFixed(2)}\n`;
      text += `Caja Total: $${r.total_cash_close.toFixed(2)}\n`;
      text += `Efectivo Movido: $${r.total_handled.toFixed(2)}\n`;
      text += "--------------------------------------------\n";
    });

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reporte_empleados.txt";
    link.click();
  };

  /* === Limpiar filtro === */
  const clearFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="space-y-6 mt-6">
      {/* === Encabezado y filtros === */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            📊 Reporte General de Empleados
            {startDate || endDate ? (
              <span className="text-xs text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/50 px-2 py-1 rounded-md">
                Filtro activo
              </span>
            ) : null}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total de turnos analizados: {filteredShifts.length}
          </p>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-[160px]"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-[160px]"
          />
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={clearFilter}
          >
            <X className="h-4 w-4" /> Limpiar
          </Button>
          <Button
            variant="default"
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" /> Aplicar
          </Button>
        </div>
      </div>

      {/* === Exportaciones === */}
      <div className="flex flex-wrap gap-2 justify-end">
        <Button onClick={exportPDF} variant="outline" className="flex items-center gap-2">
          <FileText className="h-4 w-4" /> PDF
        </Button>
        <Button onClick={exportExcel} variant="outline" className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4" /> Excel
        </Button>
        <Button onClick={exportTXT} variant="outline" className="flex items-center gap-2">
          <FileDown className="h-4 w-4" /> TXT
        </Button>
      </div>

      {/* === Resumen General === */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="dark:bg-gray-800/70">
          <CardHeader className="flex items-center gap-2">
            <Users className="text-blue-500" />
            <CardTitle>Empleados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totals.employees}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800/70">
          <CardHeader className="flex items-center gap-2">
            <DollarSign className="text-green-500" />
            <CardTitle>Total Caja Movida</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${totals.totalCash.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800/70">
          <CardHeader className="flex items-center gap-2">
            <Timer className="text-yellow-500" />
            <CardTitle>Promedio Duración</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {totals.avgDuration.toFixed(1)} min
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800/70">
          <CardHeader className="flex items-center gap-2">
            <AlertTriangle className="text-red-500" />
            <CardTitle>Diferencia Promedio Caja</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                totals.avgDiff >= 0 ? "text-green-600" : "text-red-500"
              }`}
            >
              ${totals.avgDiff.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* === Tabla === */}
      <Card className="dark:bg-gray-800/70">
        <CardHeader className="flex items-center gap-2">
          <BarChart3 className="text-indigo-500" />
          <CardTitle>Rendimiento por Empleado</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-gray-500">No hay datos para mostrar.</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-gray-700 text-left">
                    <th>Empleado</th>
                    <th>Turnos</th>
                    <th>Prom. Duración</th>
                    <th>Prom. Diferencia</th>
                    <th>Caja Total</th>
                    <th>Efectivo Movido</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr
                      key={r.employee}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                    >
                      <td className="font-medium">{r.employee}</td>
                      <td>{r.total_turns}</td>
                      <td>{r.avg_duration.toFixed(1)} min</td>
                      <td
                        className={`${
                          r.avg_difference >= 0
                            ? "text-green-600 font-semibold"
                            : "text-red-500 font-semibold"
                        }`}
                      >
                        ${r.avg_difference.toFixed(2)}
                      </td>
                      <td>${r.total_cash_close.toFixed(2)}</td>
                      <td>${r.total_handled.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* === Gráficos === */}
      {reports.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Duración promedio */}
            <Card className="dark:bg-gray-800/70">
              <CardHeader className="flex items-center gap-2">
                <TrendingUp className="text-purple-500" />
                <CardTitle>Duración Promedio por Empleado</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reports}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="employee" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avg_duration" fill="#8884d8" name="Minutos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Diferencia de caja */}
            <Card className="dark:bg-gray-800/70">
              <CardHeader className="flex items-center gap-2">
                <DollarSign className="text-green-500" />
                <CardTitle>Diferencia Promedio de Caja</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reports}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="employee" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="avg_difference"
                      stroke="#82ca9d"
                      strokeWidth={3}
                      name="Prom. diferencia"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* === Gráfico combinado === */}
          <Card className="dark:bg-gray-800/70">
            <CardHeader className="flex items-center gap-2">
              <Activity className="text-cyan-500" />
              <CardTitle>Turnos Totales vs Caja Movida</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={reports}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="employee" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="total_turns"
                    barSize={30}
                    fill="#00BFFF"
                    name="Turnos Totales"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="total_cash_close"
                    stroke="#FF8042"
                    strokeWidth={3}
                    name="Caja Movida ($)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default EmployeeReports;
