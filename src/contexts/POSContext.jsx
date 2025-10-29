
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

const POSContext = createContext();

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};

export const POSProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [saleStatus, setSaleStatus] = useState('sale'); // sale, quote, suspended
  const [cashSession, setCashSession] = useState(null);
  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    loadCashSession();
    loadSuspendedSale();
  }, []);

  const loadCashSession = () => {
    const session = localStorage.getItem('pos_cash_session');
    if (session) {
      setCashSession(JSON.parse(session));
    }
  };

  const loadSuspendedSale = () => {
    const suspended = localStorage.getItem('pos_suspended_sale');
    if (suspended) {
      const sale = JSON.parse(suspended);
      setCart(sale.cart || []);
      setCustomer(sale.customer || null);
      setDiscount(sale.discount || 0);
      setSaleStatus('suspended');
    }
  };

  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
    
    toast({
      title: "Producto agregado",
      description: `${product.name} x${quantity}`,
      duration: 2000
    });
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    setCustomer(null);
    setDiscount(0);
    setSaleStatus('sale');
    localStorage.removeItem('pos_suspended_sale');
  };

  const suspendSale = () => {
    const saleData = {
      cart,
      customer,
      discount,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('pos_suspended_sale', JSON.stringify(saleData));
    setSaleStatus('suspended');
    
    toast({
      title: "Venta suspendida",
      description: "La venta se guardó correctamente",
      duration: 3000
    });
  };

  const resumeSale = () => {
    setSaleStatus('sale');
    toast({
      title: "Venta reanudada",
      description: "Continuando con la venta suspendida",
      duration: 2000
    });
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return cart.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      const taxRate = item.tax_rate || 0.21;
      return sum + (itemTotal * taxRate);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const discountAmount = subtotal * (discount / 100);
    return subtotal + tax - discountAmount;
  };

  const openCashSession = (openingAmount) => {
    const session = {
      id: Date.now().toString(),
      user_id: '1', // Replace with actual user ID
      opened_at: new Date().toISOString(),
      opening_amount: openingAmount,
      status: 'open'
    };
    
    setCashSession(session);
    localStorage.setItem('pos_cash_session', JSON.stringify(session));
    
    toast({
      title: "Caja abierta",
      description: `Monto inicial: $${openingAmount.toFixed(2)}`,
      duration: 3000
    });
  };

  const closeCashSession = (closingAmount) => {
    if (!cashSession) return;
    
    const updatedSession = {
      ...cashSession,
      closed_at: new Date().toISOString(),
      closing_amount: closingAmount,
      status: 'closed'
    };
    
    setCashSession(null);
    localStorage.removeItem('pos_cash_session');
    
    // Save to history
    const history = JSON.parse(localStorage.getItem('pos_cash_history') || '[]');
    history.push(updatedSession);
    localStorage.setItem('pos_cash_history', JSON.stringify(history));
    
    toast({
      title: "Caja cerrada",
      description: `Monto final: $${closingAmount.toFixed(2)}`,
      duration: 3000
    });
  };

  const value = {
    cart,
    customer,
    discount,
    saleStatus,
    cashSession,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setCustomer,
    setDiscount,
    setSaleStatus,
    suspendSale,
    resumeSale,
    calculateSubtotal,
    calculateTax,
    calculateTotal,
    openCashSession,
    closeCashSession
  };

  return (
    <POSContext.Provider value={value}>
      {children}
    </POSContext.Provider>
  );
};
