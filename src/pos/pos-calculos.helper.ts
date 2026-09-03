/**
 * Funciones de cálculo puras del Punto de Venta AUP.
 * Sin dependencias de base de datos → 100% testeable.
 */

/** Calcula el precio final de una línea del carrito aplicando descuento. */
export function calcularSubtotalLinea(
  cantidad: number,
  precioUnitario: number,
  descuento = 0,
): number {
  const bruto = cantidad * precioUnitario;
  return bruto - descuento;
}

/** Calcula el monto de IVA para una línea dado el subtotal sin IVA. */
export function calcularIvaLinea(
  subtotalSinIva: number,
  tasaIva: number, // ej. 16 → 0.16
  aplicaIva: boolean,
): number {
  if (!aplicaIva) return 0;
  return subtotalSinIva * tasaIva;
}

/** Calcula el total de una línea (subtotal + IVA). */
export function calcularTotalLinea(
  subtotalSinIva: number,
  tasaIva: number,
  aplicaIva: boolean,
): number {
  return subtotalSinIva + calcularIvaLinea(subtotalSinIva, tasaIva, aplicaIva);
}

/** Agrupa totales de una lista de ítems del carrito.
 *  Cada ítem debe tener: cantidad, precioUnitario, descuento?, aplicaIva?, iva?
 */
export function calcularTotalesCarrito(
  items: Array<{
    cantidad: number;
    precioUnitario: number;
    descuento?: number;
    aplicaIva?: boolean;
    iva?: number; // porcentaje: 16 → 16 %
  }>,
): { subtotal: number; totalDescuento: number; totalIva: number; total: number } {
  let subtotal = 0;
  let totalDescuento = 0;
  let totalIva = 0;

  for (const item of items) {
    const desc = item.descuento ?? 0;
    const tasa = (item.iva ?? 16) / 100;
    const bruto = item.cantidad * item.precioUnitario;
    const base = bruto - desc;
    const iva = calcularIvaLinea(base, tasa, item.aplicaIva ?? false);

    subtotal += bruto;
    totalDescuento += desc;
    totalIva += iva;
  }

  return {
    subtotal: round2(subtotal),
    totalDescuento: round2(totalDescuento),
    totalIva: round2(totalIva),
    total: round2(subtotal - totalDescuento + totalIva),
  };
}

/** Redondea a 2 decimales (evita errores de punto flotante). */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Genera el siguiente folio consecutivo dada la cadena del último folio existente. */
export function generarSiguienteFolio(prefixYear: string, lastFolio: string | null): string {
  let nextNum = 1;
  if (lastFolio) {
    const parts = lastFolio.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) nextNum = lastNum + 1;
  }
  return `${prefixYear}${String(nextNum).padStart(4, '0')}`;
}

/**
 * Calcula el Costo Promedio Ponderado de un producto cuando entra nuevo inventario.
 * Regla de negocio: Si el stock actual es 0 o negativo, el nuevo costo es igual al costo entrante.
 * 
 * @param stockActual - Unidades actuales en inventario (puede ser negativo).
 * @param costoActual - Costo promedio actual del producto.
 * @param cantEntrante - Cantidad de unidades que se están comprando o ingresando.
 * @param costoEntrante - Costo unitario de las nuevas unidades.
 * @returns El nuevo costo promedio ponderado redondeado a 4 decimales.
 */
export function calcularCostoPromedioPonderado(
  stockActual: number,
  costoActual: number,
  cantEntrante: number,
  costoEntrante: number
): number {
  if (stockActual <= 0) {
    // Si había sobreventa o inventario vacío, las piezas reales provienen de esta compra.
    return Number(costoEntrante.toFixed(4));
  }

  const valorActual = stockActual * costoActual;
  const valorNuevo = cantEntrante * costoEntrante;
  const stockTotal = stockActual + cantEntrante;

  if (stockTotal === 0) return Number(costoEntrante.toFixed(4));

  const costoPromedio = (valorActual + valorNuevo) / stockTotal;
  // Redondear a 4 decimales para mayor precisión en bases de datos contables
  return Number(costoPromedio.toFixed(4));
}
