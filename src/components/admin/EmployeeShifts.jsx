import React, { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Clock,
  User,
  LogIn,
  LogOut,
  DollarSign,
  FileText,
  RefreshCw,
  AlertTriangle,
  Calculator,
} from "lucide-react";
import dayjs from "dayjs";
import { useToast } from "@/components/ui/use-toast";

const EmployeeShifts = () => {
  const { toast } = useToast();
  const [shifts, setShifts] = useState([]);
  const [currentShift, setCurrentShift] = useState(null);
  const [employeeName, setEmployeeName] = useState("");
  const [cashOpen, setCashOpen] = useState("");

  /* === Cargar turnos almacenados === */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("pos_shifts") || "[]");
    setShifts(stored);
    const active = stored.find((s) => !s.ended_at);
    if (active) setCurrentShift(active);
  }, []);

  /* === Guardar turnos === */
  const saveShifts = (list) => {
    localStorage.setItem("pos_shifts", JSON.stringify(list));
    setShifts(list);
  };

  /* === Abrir turno === */
  const openShift = () => {
    if (!employeeName.trim()) {
      toast({
        title: "⚠️ Falta nombre",
        description: "Debes ingresar tu nombre antes de abrir el turno.",
        variant: "destructive",
      });
      return;
    }

    if (currentShift) {
      toast({
        title: "Ya existe un turno activo",
        description: "Debes cerrar el turno anterior antes de abrir otro.",
        variant: "destructive",
      });
      return;
    }

    const newShift = {
      id: crypto.randomUUID(),
      employee: employeeName,
      started_at: new Date().toISOString(),
      ended_at: null,
      cash_open: parseFloat(cashOpen || 0),
      cash_close: 0,
      notes: "",
    };

    const updated = [...shifts, newShift];
    saveShifts(updated);
    setCurrentShift(newShift);
    setCashOpen("");

    toast({
      title: "✅ Turno abierto correctamente",
      description: `${employeeName} inició su turno.`,
    });
  };

  /* === Cerrar turno === */
  const closeShift = (finalCash) => {
    if (!currentShift) return;

    const endTime = new Date().toISOString();
    const duration = dayjs(endTime).diff(dayjs(currentShift.started_at), "minute");
    const difference = parseFloat(finalCash || 0) - currentShift.cash_open;

    const updatedShift = {
      ...currentShift,
      ended_at: endTime,
      duration,
      cash_close: parseFloat(finalCash || 0),
      difference,
    };

    const updated = shifts.map((s) => (s.id === currentShift.id ? updatedShift : s));
    saveShifts(updated);
    setCurrentShift(null);

    toast({
      title: "✅ Turno cerrado",
      description: `${updatedShift.employee} cerró su turno. Diferencia de caja: $${difference.toFixed(
        2
      )}`,
    });
  };

  /* === Resumen general === */
  const totals = useMemo(() => {
    const totalShifts = shifts.length;
    const active = shifts.filter((s) => !s.ended_at).length;
    const avgDuration =
      shifts
        .filter((s) => s.ended_at)
        .reduce((sum, s) => sum + (s.duration || 0), 0) /
      Math.max(1, shifts.filter((s) => s.ended_at).length);
    const avgDiff =
      shifts
        .filter((s) => s.ended_at)
        .reduce((sum, s) => sum + (s.difference || 0), 0) /
      Math.max(1, shifts.filter((s) => s.ended_at).length);

    return { totalShifts, active, avgDuration, avgDiff };
  }, [shifts]);

  return (
    <div className="p-6 space-y-6">
      {/* === Encabezado === */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Control de Turnos de Empleados
        </h2>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> Actualizar
        </Button>
      </div>

      {/* === Resumen General === */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="dark:bg-gray-800/70">
          <CardHeader className="flex items-center gap-2">
            <Clock className="text-indigo-500" />
            <CardTitle>Turnos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {totals.totalShifts}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800/70">
          <CardHeader className="flex items-center gap-2">
            <User className="text-green-500" />
            <CardTitle>Turnos Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {totals.active}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800/70">
          <CardHeader className="flex items-center gap-2">
            <Calculator className="text-yellow-500" />
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
            <DollarSign className="text-blue-500" />
            <CardTitle>Promedio Diferencia Caja</CardTitle>
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

      {/* === Apertura o Cierre === */}
      <Card className="dark:bg-gray-800/70">
        <CardHeader>
          <CardTitle>{currentShift ? "Cerrar Turno" : "Abrir Turno"}</CardTitle>
        </CardHeader>
        <CardContent>
          {!currentShift ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Empleado</Label>
                <Input
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="Nombre del empleado"
                />
              </div>
              <div>
                <Label>Efectivo inicial</Label>
                <Input
                  type="number"
                  value={cashOpen}
                  onChange={(e) => setCashOpen(e.target.value)}
                  placeholder="Monto de apertura"
                />
              </div>
              <div className="col-span-2 flex justify-end">
                <Button onClick={openShift} className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" /> Abrir Turno
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Empleado:</strong> {currentShift.employee}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Inicio:</strong>{" "}
                {dayjs(currentShift.started_at).format("DD/MM/YYYY HH:mm")}
              </p>
              <Label>Efectivo al cierre</Label>
              <Input
                type="number"
                step="0.01"
                onKeyDown={(e) => {
                  if (e.key === "Enter") closeShift(e.target.value);
                }}
                placeholder="Monto final de caja"
              />
              <Button
                onClick={() => {
                  const cash = prompt("Monto final de caja:");
                  if (cash) closeShift(cash);
                }}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
              >
                <LogOut className="h-4 w-4" /> Cerrar Turno
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* === Historial de Turnos === */}
      <Card className="dark:bg-gray-800/70">
        <CardHeader className="flex items-center gap-2">
          <FileText className="text-blue-500" />
          <CardTitle>Historial de Turnos ({shifts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {shifts.length === 0 ? (
            <p className="text-gray-500">No hay turnos registrados.</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-gray-700 text-left">
                    <th>Empleado</th>
                    <th>Inicio</th>
                    <th>Cierre</th>
                    <th>Duración</th>
                    <th>Apertura</th>
                    <th>Cierre</th>
                    <th>Diferencia</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                    >
                      <td>{s.employee}</td>
                      <td>{dayjs(s.started_at).format("DD/MM HH:mm")}</td>
                      <td>
                        {s.ended_at ? dayjs(s.ended_at).format("DD/MM HH:mm") : "—"}
                      </td>
                      <td>
                        {s.ended_at
                          ? `${Math.floor(s.duration / 60)}h ${s.duration % 60}m`
                          : "Activo"}
                      </td>
                      <td>${s.cash_open?.toFixed(2)}</td>
                      <td>${s.cash_close?.toFixed(2) || "—"}</td>
                      <td
                        className={`${
                          s.difference >= 0
                            ? "text-green-600 font-semibold"
                            : "text-red-500 font-semibold"
                        }`}
                      >
                        ${s.difference?.toFixed(2) || "—"}
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

export default EmployeeShifts;
