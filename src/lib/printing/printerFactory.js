
import FiscalAdapter from './adapters/FiscalAdapter';
import EscPosAdapter from './adapters/EscPosAdapter';
import PreviewAdapter from './adapters/PreviewAdapter';

export const createPrinter = () => {
  const provider = import.meta.env.VITE_PRINTER_PROVIDER || 'preview';
  
  switch (provider) {
    case 'fiscal':
      return new FiscalAdapter();
    case 'escpos':
      return new EscPosAdapter();
    case 'preview':
    default:
      return new PreviewAdapter();
  }
};
