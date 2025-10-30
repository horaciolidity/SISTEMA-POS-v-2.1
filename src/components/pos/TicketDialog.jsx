import React, { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const TicketDialog = ({ venta, onClose }) => {
  const ref = useRef();

  const exportToPDF = async () => {
    const element = ref.current;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ unit: "pt", format: "a6" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const ratio = pageWidth / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width * ratio, canvas.height * ratio);
    pdf.save(`Ticket_${venta.id}.pdf`);
  };

  return (
    <Dialog open={!!venta} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Ticket de Venta</DialogTitle>
        </DialogHeader>

        <div ref={ref} className="text-sm font-mono p-4 bg-white">
          <p className="text-center font-bold mb-2">🛍️ LiberPOS</p>
          <p>Fecha: {new Date(venta.date).toLocaleString()}</p>
          <p>Cliente: {venta.customer}</p>
          <hr className="my-2" />

          {venta.items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>{item.name} x{item.qty}</span>
              <span>${(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}

          <hr className="my-2" />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${venta.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Pagó con</span>
            <span>${venta.paid.toFixed(2)}</span>
          </div>
          {venta.change > 0 && (
            <div className="flex justify-between">
              <span>Vuelto</span>
              <span>${venta.change.toFixed(2)}</span>
            </div>
          )}
          <p className="text-center text-xs mt-3 text-gray-500">
            ¡Gracias por su compra!
          </p>
        </div>

        <div className="flex gap-2 mt-4">
          <Button className="flex-1" onClick={exportToPDF}>
            Guardar PDF
          </Button>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDialog;
