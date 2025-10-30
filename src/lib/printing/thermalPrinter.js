export const printThermalReceipt = async (sale) => {
  // genera HTML legible por navegador o por impresora térmica
  const fecha = new Date(sale.timestamp).toLocaleString();
  const contenido = `
    <div style="font-family: monospace; width: 260px; padding: 8px;">
      <h3 style="text-align:center;">🛍️ LiberPOS</h3>
      <p style="text-align:center;">Venta Nº ${sale.number}</p>
      <p style="text-align:center;">${fecha}</p>
      <hr />
      <p>Atendido por: ${sale.user_email}</p>
      <p>Cliente: ${sale.customer}</p>
      <hr />
      ${sale.items
        .map(
          (i) =>
            `<div style="display:flex;justify-content:space-between;">
               <span>${i.qty}x ${i.name}</span>
               <span>$${(i.price * i.qty).toFixed(2)}</span>
             </div>`
        )
        .join("")}
      <hr />
      <div style="display:flex;justify-content:space-between;">
        <strong>Subtotal:</strong>
        <span>$${sale.subtotal.toFixed(2)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;">
        <strong>Impuestos:</strong>
        <span>$${sale.tax_total.toFixed(2)}</span>
      </div>
      ${
        sale.discount_total > 0
          ? `<div style="display:flex;justify-content:space-between;">
               <strong>Descuento:</strong>
               <span>-$${sale.discount_total.toFixed(2)}</span>
             </div>`
          : ""
      }
      <hr />
      <div style="display:flex;justify-content:space-between;font-size:1.1em;">
        <strong>Total:</strong>
        <strong>$${sale.total.toFixed(2)}</strong>
      </div>
      <p>Método: ${sale.payment_method.toUpperCase()}</p>
      ${
        sale.change > 0
          ? `<p>Vuelto: $${sale.change.toFixed(2)}</p>`
          : ""
      }
      <hr />
      <p style="text-align:center;">¡Gracias por su compra!</p>
    </div>
  `;

  // abre ventana de impresión de navegador
  const ventana = window.open("", "PRINT", "width=320,height=600");
  ventana.document.write(contenido);
  ventana.document.close();
  ventana.focus();
  ventana.print();
  ventana.close();
};
