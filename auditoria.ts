/**
 * ============================================================
 *   AUDITORÍA FINANCIERA — AUP PUNTO DE VENTA
 *   Verifica que no haya "lagunas" de dinero ni incongruencias
 *   en el flujo de: ventas, compras, gastos, kardex, cortes.
 * ============================================================
 * Uso:
 *   npx ts-node auditoria.ts
 *   npx ts-node auditoria.ts --sucursal=1
 *   npx ts-node auditoria.ts --desde=2026-01-01 --hasta=2026-12-31
 * ============================================================
 */
import * as dotenv from 'dotenv';
dotenv.config();
import { DataSource } from 'typeorm';

// ──────────────────────────────────────────────────────────────
// COLORES CONSOLA
// ──────────────────────────────────────────────────────────────
const R = '\x1b[31m'; // rojo
const G = '\x1b[32m'; // verde
const Y = '\x1b[33m'; // amarillo
const B = '\x1b[36m'; // cyan
const W = '\x1b[37m'; // blanco
const X = '\x1b[0m';  // reset
const BOLD = '\x1b[1m';

function ok(msg: string)   { console.log(`  ${G}✔${X} ${msg}`); }
function warn(msg: string) { console.log(`  ${Y}⚠${X}  ${msg}`); }
function fail(msg: string) { console.log(`  ${R}✘${X} ${msg}`); }
function info(msg: string) { console.log(`  ${B}ℹ${X} ${msg}`); }
function title(msg: string){ console.log(`\n${BOLD}${W}══ ${msg} ══${X}`); }

// ──────────────────────────────────────────────────────────────
// ARGS
// ──────────────────────────────────────────────────────────────
const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, v] = a.replace('--', '').split('=');
  return [k, v];
}));
const filtroSucursal  = args.sucursal ? Number(args.sucursal) : null;
const filtroDesdeFecha = args.desde   || null;
const filtroHastaFecha = args.hasta   || null;

// ──────────────────────────────────────────────────────────────
// CONEXIÓN
// ──────────────────────────────────────────────────────────────
const ds = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// ──────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────
function n(val: any): number {
  return typeof val === 'string' ? parseFloat(val) || 0 : (val ?? 0);
}

function fmt(val: number): string {
  return `$${val.toFixed(2)}`;
}

function buildDateFilter(alias: string, col: string): string {
  const parts: string[] = [];
  if (filtroDesdeFecha) parts.push(`DATE(${alias}.${col}) >= '${filtroDesdeFecha}'`);
  if (filtroHastaFecha) parts.push(`DATE(${alias}.${col}) <= '${filtroHastaFecha}'`);
  return parts.join(' AND ');
}

function buildSucursalFilter(alias: string, col: string = 'id_sucursal'): string {
  return filtroSucursal ? `${alias}.${col} = ${filtroSucursal}` : '1=1';
}

// ──────────────────────────────────────────────────────────────
// RESULTADOS GLOBALES
// ──────────────────────────────────────────────────────────────
let totalOK = 0;
let totalWarn = 0;
let totalFail = 0;
const erroresDetalle: string[] = [];

function regOk(msg: string)   { ok(msg);   totalOK++; }
function regWarn(msg: string) { warn(msg); totalWarn++; erroresDetalle.push(`⚠  ${msg}`); }
function regFail(msg: string) { fail(msg); totalFail++; erroresDetalle.push(`✘  ${msg}`); }

// ══════════════════════════════════════════════════════════════
// AUDITORÍAS
// ══════════════════════════════════════════════════════════════

// ── 1. VENTAS vs CORTES DE CAJA ──────────────────────────────
async function auditarVentasVsCortes() {
  title('AUDITORÍA 1 — Ventas vs Cortes de Caja');
  info('Verifica que cada venta esté ligada a un corte de caja.');

  // Ventas sin corte
  const ventasSinCorte: any[] = await ds.query(`
    SELECT v.id_venta, v.folio, v.total_pagado, v.fecha_venta, s.nombre AS sucursal
    FROM pos_ventas v
    LEFT JOIN pos_sucursales s ON s.id_sucursal = v.id_sucursal
    WHERE v.id_corte IS NULL
      AND v.estatus = 'Completada'
      AND ${buildSucursalFilter('v')}
      ${filtroDesdeFecha || filtroHastaFecha ? 'AND ' + buildDateFilter('v', 'fecha_venta') : ''}
    ORDER BY v.fecha_venta DESC
    LIMIT 50
  `);

  if (ventasSinCorte.length === 0) {
    regOk('Todas las ventas están ligadas a un corte de caja.');
  } else {
    regFail(`${ventasSinCorte.length} ventas sin corte de caja:`);
    ventasSinCorte.slice(0, 10).forEach(v =>
      console.log(`     └─ Folio: ${v.folio} | ${fmt(n(v.total_pagado))} | Sucursal: ${v.sucursal} | ${v.fecha_venta}`)
    );
    if (ventasSinCorte.length > 10) console.log(`     └─ ... y ${ventasSinCorte.length - 10} más`);
  }

  // Cortes cerrados: verificar que el total declarado sea coherente con la suma de ventas
  const cortes: any[] = await ds.query(`
    SELECT 
      c.id_corte, c.efectivo_declarado, c.fondo_inicial, c.fecha_apertura, c.fecha_cierre,
      s.nombre AS sucursal, u.nombre_completo AS cajero,
      COALESCE(SUM(CASE WHEN v.metodo_pago='Efectivo'     THEN v.total_pagado ELSE 0 END), 0) AS suma_efectivo,
      COALESCE(SUM(CASE WHEN v.metodo_pago='Tarjeta'      THEN v.total_pagado ELSE 0 END), 0) AS suma_tarjeta,
      COALESCE(SUM(CASE WHEN v.metodo_pago='Transferencia' THEN v.total_pagado ELSE 0 END), 0) AS suma_transferencia,
      COALESCE(SUM(v.total_pagado), 0) AS suma_total,
      COALESCE(SUM(g.monto), 0) AS suma_gastos
    FROM pos_cortes_caja c
    LEFT JOIN pos_ventas v ON v.id_corte = c.id_corte AND v.estatus = 'Completada'
    LEFT JOIN pos_gastos g ON g.id_corte = c.id_corte
    LEFT JOIN pos_sucursales s ON s.id_sucursal = c.id_sucursal
    LEFT JOIN pos_usuarios u ON u.id_usuario = c.id_usuario
    WHERE c.estatus = 'Cerrado'
      AND ${buildSucursalFilter('c')}
      ${filtroDesdeFecha || filtroHastaFecha ? 'AND ' + buildDateFilter('c', 'fecha_apertura') : ''}
    GROUP BY c.id_corte
    HAVING ABS(
      (c.fondo_inicial + COALESCE(SUM(CASE WHEN v.metodo_pago='Efectivo' THEN v.total_pagado ELSE 0 END), 0) - COALESCE(SUM(g.monto), 0))
      - c.efectivo_declarado
    ) > 1.00
    LIMIT 50
  `);

  if (cortes.length === 0) {
    regOk('Todos los cortes de caja cuadran con efectivo (diferencia < $1.00).');
  } else {
    regWarn(`${cortes.length} cortes con diferencia entre ventas y efectivo declarado:`);
    cortes.slice(0, 10).forEach(c => {
      const esperado = n(c.fondo_inicial) + n(c.suma_efectivo) - n(c.suma_gastos);
      const diferencia = n(c.efectivo_declarado) - esperado;
      console.log(`     └─ Corte #${c.id_corte} | ${c.cajero} | ${c.sucursal}`);
      console.log(`        Ventas efectivo: ${fmt(n(c.suma_efectivo))} | Gastos: ${fmt(n(c.suma_gastos))} | Esperado: ${fmt(esperado)} | Declarado: ${fmt(n(c.efectivo_declarado))} | DIFF: ${fmt(diferencia)}`);
    });
  }
}

// ── 2. VENTAS vs KARDEX (MOVIMIENTOS INVENTARIO) ─────────────
async function auditarVentasVsKardex() {
  title('AUDITORÍA 2 — Ventas vs Kardex (Movimientos de Inventario)');
  info('Verifica que cada venta haya generado salidas en el inventario.');

  const ventasSinKardex: any[] = await ds.query(`
    SELECT v.id_venta, v.folio, v.fecha_venta, s.nombre AS sucursal
    FROM pos_ventas v
    LEFT JOIN pos_sucursales s ON s.id_sucursal = v.id_sucursal
    WHERE v.estatus = 'Completada'
      AND ${buildSucursalFilter('v')}
      ${filtroDesdeFecha || filtroHastaFecha ? 'AND ' + buildDateFilter('v', 'fecha_venta') : ''}
      AND NOT EXISTS (
        SELECT 1 FROM pos_movimientos_inventario m
        WHERE m.id_sucursal = v.id_sucursal
          AND m.tipo_movimiento IN ('SALIDA', 'Venta', 'venta', 'salida')
          AND DATE(m.fecha) = DATE(v.fecha_venta)
      )
    LIMIT 50
  `);

  if (ventasSinKardex.length === 0) {
    regOk('Todos los días con ventas tienen movimientos de salida en el kardex.');
  } else {
    regWarn(`${ventasSinKardex.length} ventas en días sin movimientos de salida en kardex:`);
    ventasSinKardex.slice(0, 10).forEach(v =>
      console.log(`     └─ Folio: ${v.folio} | Sucursal: ${v.sucursal} | ${v.fecha_venta}`)
    );
  }

  // Verificar que no haya productos con stock negativo
  const productosNegativos: any[] = await ds.query(`
    SELECT p.id_producto, p.nombre, p.stock_actual, s.nombre AS sucursal
    FROM pos_productos p
    LEFT JOIN pos_sucursales s ON s.id_sucursal = p.id_sucursal
    WHERE p.stock_actual < 0
      AND ${buildSucursalFilter('p')}
    ORDER BY p.stock_actual ASC
    LIMIT 50
  `);

  if (productosNegativos.length === 0) {
    regOk('Ningún producto tiene stock negativo.');
  } else {
    regFail(`${productosNegativos.length} productos con stock NEGATIVO:`);
    productosNegativos.slice(0, 10).forEach(p =>
      console.log(`     └─ ${p.nombre} | Stock: ${n(p.stock_actual)} | Sucursal: ${p.sucursal}`)
    );
  }
}

// ── 3. COMPRAS vs KARDEX ─────────────────────────────────────
async function auditarComprasVsKardex() {
  title('AUDITORÍA 3 — Compras vs Kardex (Entradas de Inventario)');
  info('Verifica que cada compra haya generado entradas en el kardex.');

  const comprasSinKardex: any[] = await ds.query(`
    SELECT c.id_compra, c.folio, c.fecha_compra, s.nombre AS sucursal,
      COUNT(cd.id_detalle_compra) AS num_productos
    FROM pos_compras c
    LEFT JOIN pos_compras_detalle cd ON cd.id_compra = c.id_compra
    LEFT JOIN pos_sucursales s ON s.id_sucursal = c.id_sucursal
    WHERE 1=1
      AND ${buildSucursalFilter('c')}
      ${filtroDesdeFecha || filtroHastaFecha ? 'AND ' + buildDateFilter('c', 'fecha_compra') : ''}
      AND NOT EXISTS (
        SELECT 1 FROM pos_movimientos_inventario m
        WHERE m.id_sucursal = c.id_sucursal
          AND m.tipo_movimiento IN ('ENTRADA', 'Compra', 'compra', 'entrada')
          AND DATE(m.fecha) = DATE(c.fecha_compra)
      )
    GROUP BY c.id_compra
    LIMIT 50
  `);

  if (comprasSinKardex.length === 0) {
    regOk('Todas las compras tienen entradas correspondientes en el kardex.');
  } else {
    regWarn(`${comprasSinKardex.length} compras sin entradas en kardex el mismo día:`);
    comprasSinKardex.slice(0, 10).forEach(c =>
      console.log(`     └─ Folio: ${c.folio} | Sucursal: ${c.sucursal} | Productos: ${c.num_productos} | ${c.fecha_compra}`)
    );
  }
}

// ── 4. COTIZACIONES CONVERTIDAS vs VENTAS ───────────────────
async function auditarCotizacionesVsVentas() {
  title('AUDITORÍA 4 — Cotizaciones Convertidas vs Ventas');
  info('Verifica que cada cotización aprobada/facturada tenga su venta correspondiente.');

  const cotizacionesHuerfanas: any[] = await ds.query(`
    SELECT cot.id_cotizacion, cot.folio, cot.estatus, cot.total, s.nombre AS sucursal
    FROM pos_cotizaciones cot
    LEFT JOIN pos_sucursales s ON s.id_sucursal = cot.id_sucursal
    WHERE cot.estatus IN ('Aprobada', 'Facturada', 'Convertida')
      AND cot.id_venta IS NULL
      AND ${buildSucursalFilter('cot')}
      ${filtroDesdeFecha || filtroHastaFecha ? 'AND ' + buildDateFilter('cot', 'fecha') : ''}
    LIMIT 50
  `);

  if (cotizacionesHuerfanas.length === 0) {
    regOk('Todas las cotizaciones aprobadas/convertidas tienen venta generada.');
  } else {
    regFail(`${cotizacionesHuerfanas.length} cotizaciones Aprobadas/Convertidas SIN venta:`);
    cotizacionesHuerfanas.slice(0, 10).forEach(c =>
      console.log(`     └─ Folio: ${c.folio} | Estatus: ${c.estatus} | Total: ${fmt(n(c.total))} | ${c.sucursal}`)
    );
  }
}

// ── 5. GASTOS vs CORTES ──────────────────────────────────────
async function auditarGastosVsCortes() {
  title('AUDITORÍA 5 — Gastos sin Corte de Caja');
  info('Verifica que todos los gastos estén ligados a un turno de caja.');

  const gastosSinCorte: any[] = await ds.query(`
    SELECT g.id_gasto, g.concepto, g.monto, g.fecha, s.nombre AS sucursal
    FROM pos_gastos g
    LEFT JOIN pos_sucursales s ON s.id_sucursal = g.id_sucursal
    WHERE g.id_corte IS NULL
      AND ${buildSucursalFilter('g')}
      ${filtroDesdeFecha || filtroHastaFecha ? 'AND ' + buildDateFilter('g', 'fecha') : ''}
    LIMIT 50
  `);

  if (gastosSinCorte.length === 0) {
    regOk('Todos los gastos están ligados a un corte de caja.');
  } else {
    regFail(`${gastosSinCorte.length} gastos sin corte de caja:`);
    gastosSinCorte.slice(0, 10).forEach(g =>
      console.log(`     └─ Concepto: ${g.concepto} | Monto: ${fmt(n(g.monto))} | Sucursal: ${g.sucursal} | ${g.fecha}`)
    );
  }
}

// ── 6. TRASPASOS BALANCEADOS ─────────────────────────────────
async function auditarTraspasos() {
  title('AUDITORÍA 6 — Traspasos de Inventario Balanceados');
  info('Verifica que lo que sale de una sucursal entre a la otra en el kardex.');

  const traspasosSalida: any[] = await ds.query(`
    SELECT t.id_traspaso, t.folio,
      t.id_sucursal_origen, t.id_sucursal_destino,
      so.nombre AS origen, sd.nombre AS destino,
      COALESCE(SUM(td.cantidad), 0) AS cantidad_traspasada,
      COALESCE(
        (SELECT SUM(m.cantidad) FROM pos_movimientos_inventario m 
         WHERE m.id_sucursal = t.id_sucursal_origen 
           AND m.referencia LIKE CONCAT('%', t.folio, '%')
           AND m.tipo_movimiento LIKE '%Traspaso%OUT%'), 0
      ) AS kardex_salida,
      COALESCE(
        (SELECT SUM(m.cantidad) FROM pos_movimientos_inventario m 
         WHERE m.id_sucursal = t.id_sucursal_destino 
           AND m.referencia LIKE CONCAT('%', t.folio, '%')
           AND m.tipo_movimiento LIKE '%Traspaso%IN%'), 0
      ) AS kardex_entrada
    FROM pos_traspasos t
    LEFT JOIN pos_sucursales so ON so.id_sucursal = t.id_sucursal_origen
    LEFT JOIN pos_sucursales sd ON sd.id_sucursal = t.id_sucursal_destino
    LEFT JOIN pos_traspasos_detalle td ON td.id_traspaso = t.id_traspaso
    WHERE t.estatus = 'Completado'
      ${filtroDesdeFecha || filtroHastaFecha ? 'AND ' + buildDateFilter('t', 'fecha') : ''}
    GROUP BY t.id_traspaso
    HAVING kardex_salida = 0 OR kardex_entrada = 0
    LIMIT 50
  `);

  if (traspasosSalida.length === 0) {
    regOk('Todos los traspasos tienen sus movimientos en kardex (salida y entrada).');
  } else {
    regWarn(`${traspasosSalida.length} traspasos sin movimientos completos en kardex:`);
    traspasosSalida.slice(0, 10).forEach(t =>
      console.log(`     └─ Folio: ${t.folio} | ${t.origen} → ${t.destino} | Kardex OUT: ${t.kardex_salida} | IN: ${t.kardex_entrada}`)
    );
  }
}

// ── 7. RESUMEN FINANCIERO GENERAL ────────────────────────────
async function resumenFinanciero() {
  title('RESUMEN FINANCIERO GENERAL');
  info('Totales acumulados en el sistema.');

  const filtroFecha = (alias: string, col: string) =>
    filtroDesdeFecha || filtroHastaFecha ? 'AND ' + buildDateFilter(alias, col) : '';

  const [[ventas], [compras], [gastos]] = await Promise.all([
    ds.query(`
      SELECT 
        COUNT(*) AS total_ventas,
        COALESCE(SUM(total_pagado), 0) AS monto_ventas,
        COALESCE(SUM(CASE WHEN metodo_pago='Efectivo' THEN total_pagado ELSE 0 END), 0) AS efectivo,
        COALESCE(SUM(CASE WHEN metodo_pago='Tarjeta' THEN total_pagado ELSE 0 END), 0) AS tarjeta,
        COALESCE(SUM(CASE WHEN metodo_pago='Transferencia' THEN total_pagado ELSE 0 END), 0) AS transferencia
      FROM pos_ventas
      WHERE estatus = 'Completada'
        AND ${buildSucursalFilter('pos_ventas')}
        ${filtroFecha('pos_ventas', 'fecha_venta')}
    `),
    ds.query(`
      SELECT COUNT(*) AS total_compras, COALESCE(SUM(total), 0) AS monto_compras
      FROM pos_compras
      WHERE 1=1
        AND ${buildSucursalFilter('pos_compras')}
        ${filtroFecha('pos_compras', 'fecha_compra')}
    `),
    ds.query(`
      SELECT COUNT(*) AS total_gastos, COALESCE(SUM(monto), 0) AS monto_gastos
      FROM pos_gastos
      WHERE ${buildSucursalFilter('pos_gastos')}
        ${filtroFecha('pos_gastos', 'fecha')}
    `),
  ]);

  const ingresos = n(ventas.monto_ventas);
  const egresos = n(compras.monto_compras) + n(gastos.monto_gastos);
  const flujoNeto = ingresos - egresos;

  console.log(`\n  📊 Ingresos (Ventas):     ${BOLD}${fmt(ingresos)}${X}  (${ventas.total_ventas} transacciones)`);
  console.log(`     └─ Efectivo:       ${fmt(n(ventas.efectivo))}`);
  console.log(`     └─ Tarjeta:        ${fmt(n(ventas.tarjeta))}`);
  console.log(`     └─ Transferencia:  ${fmt(n(ventas.transferencia))}`);
  console.log(`\n  📉 Egresos (Compras):      ${fmt(n(compras.monto_compras))}  (${compras.total_compras} compras)`);
  console.log(`  📉 Egresos (Gastos):       ${fmt(n(gastos.monto_gastos))}  (${gastos.total_gastos} gastos)`);
  console.log(`  ──────────────────────────────────────`);
  const color = flujoNeto >= 0 ? G : R;
  console.log(`  💰 Flujo Neto:             ${color}${BOLD}${fmt(flujoNeto)}${X}`);
}

// ══════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════
async function main() {
  console.log(`\n${BOLD}${B}╔══════════════════════════════════════════════╗${X}`);
  console.log(`${BOLD}${B}║   🔍 AUDITORÍA FINANCIERA — AUP POS         ║${X}`);
  console.log(`${BOLD}${B}╚══════════════════════════════════════════════╝${X}`);

  if (filtroSucursal)   info(`Filtrando por Sucursal ID: ${filtroSucursal}`);
  if (filtroDesdeFecha) info(`Desde: ${filtroDesdeFecha}`);
  if (filtroHastaFecha) info(`Hasta: ${filtroHastaFecha}`);
  if (!filtroSucursal && !filtroDesdeFecha && !filtroHastaFecha) {
    info('Sin filtros — auditando TODA la base de datos');
  }

  try {
    await ds.initialize();
    console.log(`\n  ${G}Conexión a base de datos exitosa${X}`);
  } catch (e) {
    console.error(`${R}Error al conectar a la base de datos: ${e.message}${X}`);
    process.exit(1);
  }

  try {
    await auditarVentasVsCortes();
    await auditarVentasVsKardex();
    await auditarComprasVsKardex();
    await auditarCotizacionesVsVentas();
    await auditarGastosVsCortes();
    await auditarTraspasos();
    await resumenFinanciero();
  } catch (e) {
    console.error(`${R}Error durante auditoría: ${e.message}${X}`);
    console.error(e.stack);
  }

  // ── REPORTE FINAL ─────────────────────────────────────────
  title('RESULTADO FINAL DE AUDITORÍA');

  console.log(`\n  ${G}✔ OK:       ${totalOK}${X}`);
  console.log(`  ${Y}⚠  Alertas:  ${totalWarn}${X}`);
  console.log(`  ${R}✘ Fallos:   ${totalFail}${X}`);

  if (totalFail === 0 && totalWarn === 0) {
    console.log(`\n  ${G}${BOLD}🎉 ¡El sistema no tiene fugas de dinero! Todo cuadra. ✅${X}\n`);
  } else if (totalFail > 0) {
    console.log(`\n  ${R}${BOLD}❌ Se encontraron problemas que REQUIEREN ATENCIÓN antes de salir a producción.${X}\n`);
    erroresDetalle.filter(e => e.startsWith('✘')).forEach(e => console.log(`  ${R}${e}${X}`));
  } else {
    console.log(`\n  ${Y}${BOLD}⚠  Hay algunas advertencias. Revísalas antes de producción.${X}\n`);
    erroresDetalle.filter(e => e.startsWith('⚠')).forEach(e => console.log(`  ${Y}${e}${X}`));
  }

  await ds.destroy();
}

main();
