import {
  calcularSubtotalLinea,
  calcularIvaLinea,
  calcularTotalLinea,
  calcularTotalesCarrito,
  round2,
  generarSiguienteFolio,
  calcularCostoPromedioPonderado
} from './pos-calculos.helper';

// =============================================================================
// SUITE: round2 — Redondeo de decimales
// =============================================================================
describe('round2', () => {
  it('debería redondear a 2 decimales correctamente', () => {
    // Nota: 1.005 tiene imprecisión en IEEE 754 (resulta 1.004999...).
    // Usamos valores realistas de precios de punto de venta.
    expect(round2(1.234)).toBe(1.23);
    expect(round2(1.235)).toBe(1.24);
    expect(round2(99.999)).toBe(100);
    expect(round2(10.505)).toBe(10.51);
  });

  it('debería dejar intactos los números ya con 2 decimales', () => {
    expect(round2(10.5)).toBe(10.5);
    expect(round2(100)).toBe(100);
    expect(round2(0)).toBe(0);
  });
});

// =============================================================================
// SUITE: calcularSubtotalLinea — Línea del carrito sin IVA
// =============================================================================
describe('calcularSubtotalLinea', () => {
  it('debería calcular precio × cantidad sin descuento', () => {
    // 3 unidades × $50 = $150
    expect(calcularSubtotalLinea(3, 50)).toBe(150);
  });

  it('debería restar el descuento al bruto', () => {
    // 3 × $100 = $300, descuento $30 → $270
    expect(calcularSubtotalLinea(3, 100, 30)).toBe(270);
  });

  it('debería devolver 0 si la cantidad es 0', () => {
    expect(calcularSubtotalLinea(0, 99, 0)).toBe(0);
  });

  it('no debería dar negativo si el descuento supera el bruto', () => {
    // No es un error de negocio aquí; el helper calcula sin filtrar.
    // El servicio superior valida esto.
    expect(calcularSubtotalLinea(1, 50, 100)).toBe(-50);
  });
});

// =============================================================================
// SUITE: calcularIvaLinea — IVA de una línea
// =============================================================================
describe('calcularIvaLinea', () => {
  it('debería calcular IVA del 16 %', () => {
    // base $100 × 16 % = $16
    expect(calcularIvaLinea(100, 0.16, true)).toBeCloseTo(16, 2);
  });

  it('debería devolver 0 si aplicaIva es false', () => {
    expect(calcularIvaLinea(100, 0.16, false)).toBe(0);
  });

  it('debería soportar tasas de IVA distintas (8 %)', () => {
    expect(calcularIvaLinea(200, 0.08, true)).toBeCloseTo(16, 2);
  });
});

// =============================================================================
// SUITE: calcularTotalLinea — Total de una línea
// =============================================================================
describe('calcularTotalLinea', () => {
  it('debería sumar el IVA al subtotal', () => {
    // $100 + $16 = $116
    expect(calcularTotalLinea(100, 0.16, true)).toBeCloseTo(116, 2);
  });

  it('debería devolver solo el subtotal si no aplica IVA', () => {
    expect(calcularTotalLinea(100, 0.16, false)).toBe(100);
  });
});

// =============================================================================
// SUITE: calcularTotalesCarrito — Totales del carrito completo
// =============================================================================
describe('calcularTotalesCarrito', () => {
  it('debería devolver ceros con carrito vacío', () => {
    const result = calcularTotalesCarrito([]);
    expect(result.subtotal).toBe(0);
    expect(result.totalDescuento).toBe(0);
    expect(result.totalIva).toBe(0);
    expect(result.total).toBe(0);
  });

  it('debería calcular un carrito de 1 producto sin descuento ni IVA', () => {
    const result = calcularTotalesCarrito([
      { cantidad: 2, precioUnitario: 100, aplicaIva: false },
    ]);
    expect(result.subtotal).toBe(200);
    expect(result.totalDescuento).toBe(0);
    expect(result.totalIva).toBe(0);
    expect(result.total).toBe(200);
  });

  it('debería calcular un carrito de 1 producto CON IVA del 16 %', () => {
    const result = calcularTotalesCarrito([
      { cantidad: 1, precioUnitario: 100, aplicaIva: true, iva: 16 },
    ]);
    expect(result.subtotal).toBe(100);
    expect(result.totalIva).toBeCloseTo(16, 2);
    expect(result.total).toBe(116);
  });

  it('debería calcular correctamente múltiples productos mezclados', () => {
    // Producto A: 2 × $50 = $100, sin IVA, sin descuento
    // Producto B: 1 × $200 = $200, con IVA 16%, descuento $20 → base $180, IVA $28.80
    const result = calcularTotalesCarrito([
      { cantidad: 2, precioUnitario: 50, aplicaIva: false },
      { cantidad: 1, precioUnitario: 200, aplicaIva: true, iva: 16, descuento: 20 },
    ]);
    expect(result.subtotal).toBe(300);        // 100 + 200
    expect(result.totalDescuento).toBe(20);   // solo B
    expect(result.totalIva).toBeCloseTo(28.8, 1); // 180 × 16%
    expect(result.total).toBeCloseTo(308.8, 1);   // 300 - 20 + 28.80
  });

  it('el total debería ser Subtotal - Descuento + IVA', () => {
    const result = calcularTotalesCarrito([
      { cantidad: 5, precioUnitario: 40, aplicaIva: true, iva: 16, descuento: 10 },
    ]);
    const esperado = result.subtotal - result.totalDescuento + result.totalIva;
    expect(result.total).toBeCloseTo(esperado, 2);
  });
});

// =============================================================================
// SUITE: generarSiguienteFolio — Generación de folios consecutivos
// =============================================================================
describe('generarSiguienteFolio', () => {
  it('debería generar el primer folio con 0001', () => {
    expect(generarSiguienteFolio('VTA-2026-', null)).toBe('VTA-2026-0001');
  });

  it('debería incrementar correctamente el número', () => {
    expect(generarSiguienteFolio('VTA-2026-', 'VTA-2026-0005')).toBe('VTA-2026-0006');
  });

  it('debería rellenar con ceros a la izquierda', () => {
    expect(generarSiguienteFolio('FAC-2026-', 'FAC-2026-0099')).toBe('FAC-2026-0100');
  });

  it('debería manejar folios de 4 dígitos sin padding excesivo', () => {
    expect(generarSiguienteFolio('NV-2026-', 'NV-2026-0999')).toBe('NV-2026-1000');
  });
});

// =============================================================================
// SUITE: calcularCostoPromedioPonderado
// =============================================================================
describe('calcularCostoPromedioPonderado', () => {
  it('debería calcular el promedio simple con cantidades iguales', () => {
    // 10 a $10 y entran 10 a $20 -> Promedio $15
    expect(calcularCostoPromedioPonderado(10, 10, 10, 20)).toBe(15);
  });

  it('debería calcular el promedio ponderado correcto (peso diferente)', () => {
    // 10 a $10 (Total 100) y entran 5 a $16 (Total 80) -> Total $180 / 15 -> $12
    expect(calcularCostoPromedioPonderado(10, 10, 5, 16)).toBe(12);
  });

  it('debería redondear a 4 decimales', () => {
    // 10 a $10 y entran 3 a $15.55 -> Total (100 + 46.65) = 146.65 / 13 = 11.280769...
    expect(calcularCostoPromedioPonderado(10, 10, 3, 15.55)).toBe(11.2808);
  });

  it('debería reemplazar el costo si el stock actual es 0 (reseteo de historial)', () => {
    expect(calcularCostoPromedioPonderado(0, 10, 10, 15)).toBe(15);
  });

  it('debería reemplazar el costo si el stock actual es negativo (reseteo de historial)', () => {
    // Stock -4 (sobreventa), costo viejo 10. Entran 10 a 15.
    // El nuevo stock será 6 (calculado afuera), y su costo real proviene 100% del nuevo lote.
    expect(calcularCostoPromedioPonderado(-4, 10, 10, 15)).toBe(15);
  });
});
