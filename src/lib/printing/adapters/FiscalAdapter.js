
class FiscalAdapter {
  constructor() {
    this.endpoint = import.meta.env.VITE_PRINTER_ENDPOINT || 'http://127.0.0.1:8000';
  }

  async printReceipt(sale) {
    try {
      // This would connect to a local fiscal printer service
      const response = await fetch(`${this.endpoint}/print-fiscal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sale,
          type: 'fiscal_receipt'
        })
      });

      if (!response.ok) {
        throw new Error('Fiscal printer service not available');
      }

      return await response.json();
    } catch (error) {
      console.warn('Fiscal printer not available, falling back to preview');
      // Fallback to preview mode
      const PreviewAdapter = (await import('./PreviewAdapter')).default;
      const previewPrinter = new PreviewAdapter();
      return previewPrinter.printReceipt(sale);
    }
  }

  async openCashDrawer() {
    try {
      const response = await fetch(`${this.endpoint}/open-drawer`, {
        method: 'POST'
      });
      return response.ok;
    } catch (error) {
      console.warn('Could not open cash drawer:', error);
      return false;
    }
  }

  async cancelLastReceipt() {
    try {
      const response = await fetch(`${this.endpoint}/cancel-receipt`, {
        method: 'POST'
      });
      return response.ok;
    } catch (error) {
      console.warn('Could not cancel receipt:', error);
      return false;
    }
  }
}

export default FiscalAdapter;
