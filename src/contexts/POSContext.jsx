import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const POSContext = createContext();

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) throw new Error("usePOS must be used within a POSProvider");
  return context;
};

export const POSProvider = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [saleStatus, setSaleStatus] = useState("sale"); // sale | quote | suspended
  const [cashSession, setCashSession] = useState(null);

  /* ============================
     🔹 Cargar datos al iniciar
  ============================ */
  useEffect(() => {
    loadCashSession();
    loadSuspendedSale();
  }, [user?.email]);

  const getSessionKey = () =>
    user ? `pos_cash_session_${user.email}` : "pos_cash_session";
  const getSuspendedKey = () =>
    user ? `pos_suspended_sale_${user.email}` : "pos_suspended_sale";

  /* ============================
     💰 Manejo de caja
  ============================ */
  const loadCashSession = () => {
    const session = localStorage.getItem(getSessionKey());
    if (session) {
      setCashSession(JSON.parse(session));
    }
  };

  const openCashSession = (openingAmount) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para abrir caja.",
        variant: "destructive",
      });
      return;
    }

    const session = {
      id: Date.now().toString(),
      user_id: user.id,
      user_email: user.email,
      opened_at: new Date().toISOString(),
      opening_amount: openingAmount,
      status: "open",
    };

    localStorage.setItem(getSessionKey(), JSON.stringify(session));
    setCashSession(session);

    toast({
      title: "Caja abierta 💵",
      description: `Monto inicial: $${openingAmount.toFixed(2)}`,
    });
  };

  const closeCashSession = (closingAmount) => {
    if (!cashSession) return;

    const updatedSession = {
      ...cashSession,
      closed_at: new Date().toISOString(),
      closing_amount: closingAmount,
      status: "closed",
    };

    // Guardar en historial
    const historyKey = "pos_cash_history";
    const history = JSON.parse(localStorage.getItem(historyKey) || "[]");
    history.push(updatedSession);
    localStorage.setItem(historyKey, JSON.stringify(history));

    // Cerrar sesión actual
    localStorage.removeItem(getSessionKey());
    setCashSession(null);

    toast({
      title: "Caja cerrada ✅",
      description: `Monto final: $${closingAmount.toFixed(2)}`,
    });
  };

  /* ============================
     🛒 Manejo de carrito
  ============================ */
  const loadSuspendedSale = () => {
    const suspended = localStorage.getItem(getSuspendedKey());
    if (suspended) {
      const sale = JSON.parse(suspended);
      setCart(sale.cart || []);
      setCustomer(sale.customer || null);
      setDiscount(sale.discount || 0);
      setSaleStatus("suspended");
    }
  };

  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });

    toast({
      title: "Producto agregado 🛍️",
      description: `${product.name} x${quantity}`,
      duration: 2000,
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) return removeFromCart(productId);
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setCustomer(null);
    setDiscount(0);
    setSaleStatus("sale");
    localStorage.removeItem(getSuspendedKey());
  };

  const suspendSale = () => {
    const saleData = {
      cart,
      customer,
      discount,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(getSuspendedKey(), JSON.stringify(saleData));
    setSaleStatus("suspended");

    toast({
      title: "Venta suspendida ⏸️",
      description: "La venta fue guardada correctamente.",
    });
  };

  const resumeSale = () => {
    setSaleStatus("sale");
    toast({
      title: "Venta reanudada ▶️",
      description: "Continuando con la venta suspendida.",
    });
  };

  /* ============================
     💵 Cálculos de venta
  ============================ */
  const calculateSubtotal = () =>
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const calculateTax = () =>
    cart.reduce((sum, item) => {
      const taxRate = item.tax_rate ?? 0.21;
      return sum + item.price * item.quantity * taxRate;
    }, 0);

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const discountAmount = subtotal * (discount / 100);
    return subtotal + tax - discountAmount;
  };

  /* ============================
     🧾 Confirmar venta
  ============================ */
  const confirmSale = (paymentMethod = "efectivo") => {
    if (cart.length === 0) {
      toast({
        title: "Sin productos",
        description: "Agrega productos antes de confirmar la venta.",
        variant: "destructive",
      });
      return;
    }

    if (!cashSession) {
      toast({
        title: "Caja cerrada",
        description: "Debes abrir la caja para registrar ventas.",
        variant: "destructive",
      });
      return;
    }

    const sale = {
      id: Date.now().toString(),
      user_email: user?.email || "sin_usuario",
      customer,
      items: cart,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal(),
      discount,
      payment_method: paymentMethod,
      closed_at: new Date().toISOString(),
    };

    const sales = JSON.parse(localStorage.getItem("pos_sales") || "[]");
    sales.push(sale);
    localStorage.setItem("pos_sales", JSON.stringify(sales));

    clearCart();

    toast({
      title: "Venta registrada ✅",
      description: `Total: $${sale.total.toFixed(2)}`,
    });
  };

  /* ============================
     🔁 Context Value
  ============================ */
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
    suspendSale,
    resumeSale,
    calculateSubtotal,
    calculateTax,
    calculateTotal,
    openCashSession,
    closeCashSession,
    confirmSale,
    setCustomer,
    setDiscount,
    setSaleStatus,
  };

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>;
};
