import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, DollarSign, Smile } from 'lucide-react';

/**
 * Pantalla espejo del cliente (display externo)
 * Muestra último producto, total acumulado y mensaje de agradecimiento.
 * Abrir en otra pestaña o monitor secundario.
 */
const CustomerDisplay = () => {
  const [lastProduct, setLastProduct] = useState(null);
  const [total, setTotal] = useState(0);
  const [showThanks, setShowThanks] = useState(false);

  useEffect(() => {
    const channel = new BroadcastChannel('customer_display');

    channel.onmessage = (e) => {
      const { type, payload } = e.data;

      if (type === 'UPDATE_DISPLAY') {
        setLastProduct(payload.lastProduct);
        setTotal(payload.total);
        setShowThanks(false);
      } else if (type === 'SHOW_THANKS') {
        setShowThanks(true);
      }
    };

    return () => channel.close();
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-800 to-black text-white overflow-hidden">
      {/* Logo o encabezado */}
      <div className="absolute top-6 text-center">
        <h1 className="text-4xl font-bold tracking-wide">🛒 Super POS</h1>
        <p className="text-sm text-white/70">Display del cliente</p>
      </div>

      {/* Contenido dinámico */}
      <AnimatePresence mode="wait">
        {showThanks ? (
          <motion.div
            key="thanks"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center"
          >
            <Smile className="h-20 w-20 text-yellow-300 mb-6" />
            <h2 className="text-5xl font-bold mb-4">¡Gracias por su compra!</h2>
            <p className="text-2xl text-white/80">
              ¡Vuelva pronto! 👋
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="info"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            {lastProduct ? (
              <>
                <div className="mb-10">
                  <ShoppingBag className="h-16 w-16 mx-auto mb-3 text-green-400" />
                  <h2 className="text-4xl font-bold">{lastProduct.name}</h2>
                  <p className="text-2xl text-white/70">
                    ${lastProduct.price.toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-col items-center mt-6">
                  <span className="text-lg text-white/60">Total actual</span>
                  <div className="text-6xl font-extrabold mt-2 flex items-center">
                    <DollarSign className="h-10 w-10 text-green-400 mr-1" />
                    {total.toFixed(2)}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-3xl opacity-50">
                Esperando productos...
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerDisplay;
