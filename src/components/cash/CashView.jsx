import React, { useState, useMemo } from "react";
import {
  DollarSign,
  ArrowUp,
  ArrowDown,
  BookOpen,
  XCircle,
  Wallet,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePOS } from "@/contexts/POSContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import dayjs from "dayjs";

const CashView = () => {
  const { cashSession, openCashSession, closeCashSession } = usePOS();
  const { user } = useAuth();
  const { toast } = useToast();

  const [openingAmount, setOpeningAmount] = useState(0);
  const [closingAmount, setClosingAmount] = useState(0);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showMovDialog, setShowMovDialog] = useState(false);
  const [movType, setMovType] = useState("income");
  const [movAmount, setMovAmount] = useState(0);
  const [movDesc, setMovDesc] = useState("");

  // =============================
  // 🔹 Obtener ventas y movimientos
  // =============================
  const sales = JSON.parse(localStorage.getItem("pos_sales") || "[]");
  const movements = JSON.parse(localStorage.getItem("pos_cash_movements") || "[]");
  const sessionMovs = movements.filter(
    (m) => m.session_id === cashSession?.id
  );

  const sessionSales = useMemo(() => {
    if (!cashSession) return [];
    return sales.filter(
      (s) =>
        dayjs(s.timestamp).isAfter(dayjs(cashSession.opened_at)) &&
        s.payment_method === "cash"
    );
  }, [sales, cashSession]);

  const totalCashSales = sessionSales.reduce((sum, s) => sum + s.total, 0);
  const totalIncome = sessionMovs
    .filter((m) => m.type === "income")
    .reduce((sum, m) => sum + m.amount, 0);
  const totalExpense = sessionMovs
    .filter((m) => m.type === "expense")
    .reduce((sum, m) => sum + m.amount, 0);
  const expectedAmount =
    (cashSession?.opening_amount || 0) +
    totalCashSales +
    totalIncome -
    totalExpense;

  // =============================
  // ⚙️ Handlers
  // =============================
  const handleOpenSession = () => {
    if (openingAmount <= 0) {
      toast({
        title: "Monto inválido",
        description: "Debes ingresar un monto inicial mayor a 0.",
        variant: "destructive",
      });
      return;
    }
    openCashSession(openingAmount);
    setShowOpenDialog(false);
  };

  const handleCloseSession = () => {
    closeCashSession(closingAmount);
    setShowCloseDialog(false);
  };

  const handleAddMovement = () => {
    if (movAmount <= 0 || movDesc.trim() === "") {
      toast({
        title: "Datos incompletos",
        description: "Debe ingresar monto y descripción.",
        variant: "destructive",
      });
      return;
    }

    const newMov = {
      id: crypto.randomUUID(),
      session_id: cashSession.id,
      type: movType,
      amount: movAmount,
      description: movDesc,
      created_at: new Date().toISOString(),
      user_email: user?.email || "desconocido",
    };

    const updated = [...movements, newMov];
    localStorage.setItem("pos_cash_movements", JSON.stringify(updated));

    toast({
      title: "Movimiento registrado",
      description: `${movType === "income" ? "Ingreso" : "Egreso"}: $${movAmount.toFixed(2)}`,
    });

    setMovAmount(0);
    setMovDesc("");
    setShowMovDialog(false);
  };

  // =============================
  // 📤 Exportaciones
  // =============================
  const exportToExcel = () => {
    const data = sessionMovs.map((m) => ({
      Fecha: dayjs(m.created_at).format("DD/MM/YYYY HH:mm"),
      Tipo: m.type === "income" ? "Ingreso" : "Egreso",
      Descripción: m.description,
      Monto: m.amount,
      Usuario: m.user_email,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Movimientos");
    XLSX.writeFile(wb, `Movimientos_Caja_${cashSession.id}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text(`Reporte de Caja - ${dayjs().format("DD/MM/YYYY HH:mm")}`, 10, 10);
    doc.text(`Usuario: ${user?.email}`, 10, 20);

    let y = 35;
    doc.text("Fecha", 10, 30);
    doc.text("Tipo", 50, 30);
    doc.text("Monto", 90, 30);
    doc.text("Descripción", 130, 30);

    sessionMovs.forEach((m) => {
      doc.text(dayjs(m.created_at).format("DD/MM HH:mm"), 10, y);
      doc.text(m.type === "income" ? "Ingreso" : "Egreso", 50, y);
      doc.text(`$${m.amount.toFixed(2)}`, 90, y);
      doc.text(m.description.slice(0, 25), 130, y);
      y += 8;
    });

    doc.save(`Movimientos_Caja_${cashSession.id}.pdf`);
  };

  const exportToTxt = () => {
    const lines = [
      `REPORTE DE MOVIMIENTOS DE CAJA`,
      `Usuario: ${user?.email}`,
      `Fecha: ${dayjs().format("DD/MM/YYYY HH:mm")}`,
      `-------------------------------------------`,
      ...sessionMovs.map(
        (m) =>
          `${dayjs(m.created_at).format("DD/MM HH:mm")} | ${
            m.type === "income" ? "Ingreso" : "Egreso"
          } | $${m.amount.toFixed(2)} | ${m.description}`
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Movimientos_Caja_${cashSession.id}.txt`;
    a.click();
  };

  // =============================
  // 🧾 Render principal
  // =============================
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Caja</h1>
          <p className="text-gray-600">
            Apertura, cierre y movimientos manuales
          </p>
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
                  <p className="text-sm">Monto esperado</p>
                  <p className="text-xl font-bold text-green-600">
                    ${expectedAmount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label htmlFor="closing-amount">Monto contado</Label>
                  <Input
                    id="closing-amount"
                    type="number"
                    value={closingAmount}
                    onChange={(e) => setClosingAmount(Number(e.target.value))}
                  />
                </div>
                <Button onClick={handleCloseSession} className="w-full">
                  Confirmar Cierre
                </Button>
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
                  <Input
                    id="opening-amount"
                    type="number"
                    value={openingAmount}
                    onChange={(e) => setOpeningAmount(Number(e.target.value))}
                  />
                </div>
                <Button onClick={handleOpenSession} className="w-full">
                  Confirmar Apertura
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {cashSession ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4"><p className="text-sm">Inicial</p><p className="text-2xl font-bold">${cashSession.opening_amount.toFixed(2)}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm">Ventas</p><p className="text-2xl font-bold">${totalCashSales.toFixed(2)}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm">Ingresos</p><p className="text-2xl font-bold text-green-600">+${totalIncome.toFixed(2)}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm">Egresos</p><p className="text-2xl font-bold text-red-600">-${totalExpense.toFixed(2)}</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Movimientos de Caja</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={exportToExcel}>
                  <FileDown className="h-4 w-4 mr-1" /> Excel
                </Button>
                <Button variant="outline" onClick={exportToPDF}>
                  <FileDown className="h-4 w-4 mr-1" /> PDF
                </Button>
                <Button variant="outline" onClick={exportToTxt}>
                  <FileDown className="h-4 w-4 mr-1" /> TXT
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex space-x-2 mb-4">
                <Dialog open={showMovDialog} onOpenChange={setShowMovDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <ArrowUp className="h-4 w-4 mr-2" /> Nuevo Movimiento
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Registrar Movimiento</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Tipo</Label>
                        <select
                          className="w-full border p-2 rounded"
                          value={movType}
                          onChange={(e) => setMovType(e.target.value)}
                        >
                          <option value="income">Ingreso</option>
                          <option value="expense">Egreso</option>
                        </select>
                      </div>
                      <div>
                        <Label>Monto</Label>
                        <Input
                          type="number"
                          value={movAmount}
                          onChange={(e) => setMovAmount(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Descripción</Label>
                        <Input
                          value={movDesc}
                          onChange={(e) => setMovDesc(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleAddMovement} className="w-full">
                        Guardar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {sessionMovs.length === 0 ? (
                <div className="border rounded-lg p-6 text-center text-gray-500">
                  <Wallet className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No hay movimientos registrados.</p>
                </div>
              ) : (
                <div className="overflow-auto max-h-[300px]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Fecha</th>
                        <th className="text-left p-2">Tipo</th>
                        <th className="text-left p-2">Monto</th>
                        <th className="text-left p-2">Descripción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessionMovs.map((m) => (
                        <tr key={m.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            {dayjs(m.created_at).format("DD/MM HH:mm")}
                          </td>
                          <td
                            className={`p-2 font-semibold ${
                              m.type === "income"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {m.type === "income" ? "Ingreso" : "Egreso"}
                          </td>
                          <td className="p-2">${m.amount.toFixed(2)}</td>
                          <td className="p-2">{m.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="p-10 text-center">
            <DollarSign className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold">Caja Cerrada</h2>
            <p className="text-gray-600">
              Debes abrir la caja para comenzar a operar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CashView;
