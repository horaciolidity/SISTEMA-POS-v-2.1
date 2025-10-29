
import jsPDF from 'jspdf';

class PreviewAdapter {
  async printReceipt(sale) {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 200] // Thermal printer width
      });

      let y = 10;
      const lineHeight = 4;
      const pageWidth = 80;

      // Helper function to add text
      const addText = (text, x = 5, fontSize = 8, align = 'left') => {
        pdf.setFontSize(fontSize);
        if (align === 'center') {
          pdf.text(text, pageWidth / 2, y, { align: 'center' });
        } else {
          pdf.text(text, x, y);
        }
        y += lineHeight;
      };

      // Header
      addText('SISTEMA POS', 5, 12, 'center');
      addText('Ticket de Venta', 5, 10, 'center');
      addText('================================', 5, 8, 'center');
      y += 2;

      // Sale info
      addText(`Ticket: ${sale.number}`);
      addText(`Fecha: ${new Date(sale.opened_at).toLocaleString()}`);
      
      if (sale.customer_id) {
        addText(`Cliente: ${sale.customer?.name || 'N/A'}`);
      }
      
      addText('================================', 5, 8, 'center');
      y += 2;

      // Items
      sale.items.forEach(item => {
        addText(`${item.product_name || 'Producto'}`);
        addText(`${item.qty} x $${item.unit_price.toFixed(2)} = $${item.total.toFixed(2)}`);
        y += 1;
      });

      addText('================================', 5, 8, 'center');
      y += 2;

      // Totals
      addText(`Subtotal: $${sale.subtotal.toFixed(2)}`);
      if (sale.discount_total > 0) {
        addText(`Descuento: -$${sale.discount_total.toFixed(2)}`);
      }
      addText(`IVA: $${sale.tax_total.toFixed(2)}`);
      addText(`TOTAL: $${sale.total.toFixed(2)}`, 5, 10);

      // Payment
      addText('================================', 5, 8, 'center');
      addText(`Pago (${sale.payment.method}): $${sale.paid_total.toFixed(2)}`);
      if (sale.change > 0) {
        addText(`Vuelto: $${sale.change.toFixed(2)}`);
      }

      y += 4;
      addText('Gracias por su compra!', 5, 8, 'center');

      // Open PDF in new window
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');

      return { success: true, preview: true };
    } catch (error) {
      console.error('Error generating receipt preview:', error);
      throw error;
    }
  }

  async openCashDrawer() {
    // Simulate cash drawer opening
    console.log('Cash drawer opened (simulated)');
    return true;
  }

  async cancelLastReceipt() {
    // Simulate receipt cancellation
    console.log('Receipt cancelled (simulated)');
    return true;
  }
}

export default PreviewAdapter;
