
class EscPosAdapter {
  constructor() {
    this.device = null;
  }

  async connect() {
    try {
      // Try WebUSB first
      if ('usb' in navigator) {
        this.device = await navigator.usb.requestDevice({
          filters: [{ classCode: 7 }] // Printer class
        });
        await this.device.open();
        await this.device.selectConfiguration(1);
        await this.device.claimInterface(0);
        return true;
      }
      
      // Try WebSerial as fallback
      if ('serial' in navigator) {
        this.device = await navigator.serial.requestPort();
        await this.device.open({ baudRate: 9600 });
        return true;
      }
      
      throw new Error('No compatible interface available');
    } catch (error) {
      console.warn('ESC/POS printer not available, falling back to preview');
      return false;
    }
  }

  async printReceipt(sale) {
    try {
      const connected = await this.connect();
      if (!connected) {
        // Fallback to preview
        const PreviewAdapter = (await import('./PreviewAdapter')).default;
        const previewPrinter = new PreviewAdapter();
        return previewPrinter.printReceipt(sale);
      }

      const commands = this.generateEscPosCommands(sale);
      await this.sendCommands(commands);
      
      return { success: true };
    } catch (error) {
      console.warn('ESC/POS printing failed, falling back to preview');
      const PreviewAdapter = (await import('./PreviewAdapter')).default;
      const previewPrinter = new PreviewAdapter();
      return previewPrinter.printReceipt(sale);
    }
  }

  generateEscPosCommands(sale) {
    const ESC = '\x1B';
    const GS = '\x1D';
    
    let commands = '';
    
    // Initialize printer
    commands += ESC + '@';
    
    // Header
    commands += ESC + 'a' + '\x01'; // Center align
    commands += 'SISTEMA POS\n';
    commands += 'Ticket de Venta\n';
    commands += '================================\n';
    
    // Sale info
    commands += ESC + 'a' + '\x00'; // Left align
    commands += `Ticket: ${sale.number}\n`;
    commands += `Fecha: ${new Date(sale.opened_at).toLocaleString()}\n`;
    
    if (sale.customer_id) {
      commands += `Cliente: ${sale.customer?.name || 'N/A'}\n`;
    }
    
    commands += '================================\n';
    
    // Items
    sale.items.forEach(item => {
      commands += `${item.product_name || 'Producto'}\n`;
      commands += `${item.qty} x $${item.unit_price.toFixed(2)} = $${item.total.toFixed(2)}\n`;
    });
    
    commands += '================================\n';
    
    // Totals
    commands += `Subtotal: $${sale.subtotal.toFixed(2)}\n`;
    if (sale.discount_total > 0) {
      commands += `Descuento: -$${sale.discount_total.toFixed(2)}\n`;
    }
    commands += `IVA: $${sale.tax_total.toFixed(2)}\n`;
    commands += ESC + 'E' + '\x01'; // Bold on
    commands += `TOTAL: $${sale.total.toFixed(2)}\n`;
    commands += ESC + 'E' + '\x00'; // Bold off
    
    // Payment
    commands += '================================\n';
    commands += `Pago (${sale.payment.method}): $${sale.paid_total.toFixed(2)}\n`;
    if (sale.change > 0) {
      commands += `Vuelto: $${sale.change.toFixed(2)}\n`;
    }
    
    // Footer
    commands += '\n';
    commands += ESC + 'a' + '\x01'; // Center align
    commands += 'Gracias por su compra!\n';
    commands += '\n\n\n';
    
    // Cut paper
    commands += GS + 'V' + '\x42' + '\x00';
    
    return commands;
  }

  async sendCommands(commands) {
    const encoder = new TextEncoder();
    const data = encoder.encode(commands);
    
    if (this.device.transferOut) {
      // WebUSB
      await this.device.transferOut(1, data);
    } else if (this.device.writable) {
      // WebSerial
      const writer = this.device.writable.getWriter();
      await writer.write(data);
      writer.releaseLock();
    }
  }

  async openCashDrawer() {
    try {
      const commands = '\x1B\x70\x00\x19\xFA'; // ESC p 0 25 250
      await this.sendCommands(commands);
      return true;
    } catch (error) {
      console.warn('Could not open cash drawer:', error);
      return false;
    }
  }
}

export default EscPosAdapter;
