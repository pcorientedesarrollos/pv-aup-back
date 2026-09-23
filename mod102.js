const fs = require('fs');

// ========================
// Fix 1: pos.service.ts (backend) - link venta to corte de caja
// ========================
let backTs = fs.readFileSync('src/pos/pos.service.ts', 'utf8');

backTs = backTs.replace(
  `async convertirCotizacionAVenta(idCotizacion: number, idUsuario: number) {
    const cotizacion = await this.getCotizacionById(idCotizacion);
    if (cotizacion.estatus !== 'Aprobada' && cotizacion.estatus !== 'Borrador') {
      throw new BadRequestException('Solo se pueden convertir cotizaciones aprobadas o en borrador.');
    }

    const folioVenta = await this.generarFolioConsecutivo(this.ventaRepo, 'VTA');
    const nuevaVenta = this.ventaRepo.create({
      folio: folioVenta,
      subtotal: cotizacion.subtotal,
      descuento: cotizacion.descuento,
      totalIva: cotizacion.totalIva,
      totalPagado: cotizacion.total,
      estatus: 'Completada',
      metodoPago: 'Efectivo', 
      sucursal: cotizacion.sucursal,
      usuario: { idUsuario } as PosUsuario,
      cliente: cotizacion.cliente
    });`,
  `async convertirCotizacionAVenta(idCotizacion: number, idUsuario: number, metodoPago: string = 'Efectivo') {
    const cotizacion = await this.getCotizacionById(idCotizacion);
    if (cotizacion.estatus !== 'Aprobada' && cotizacion.estatus !== 'Borrador') {
      throw new BadRequestException('Solo se pueden convertir cotizaciones aprobadas o en borrador.');
    }

    // Buscar turno activo del usuario para vincularlo
    const usuario = await this.usuarioRepo.findOne({ where: { idUsuario }, relations: { sucursal: true } });
    const turnoActivo = usuario ? await this.corteRepo.findOne({
      where: { usuario: { sucursal: { idSucursal: usuario.sucursal?.idSucursal || 1 } }, estatus: 'Abierto' }
    }) : null;

    const folioVenta = await this.generarFolioConsecutivo(this.ventaRepo, 'VTA');
    const nuevaVenta = this.ventaRepo.create({
      folio: folioVenta,
      subtotal: cotizacion.subtotal,
      descuento: cotizacion.descuento,
      totalIva: cotizacion.totalIva,
      totalPagado: cotizacion.total,
      efectivo: metodoPago === 'Efectivo' ? cotizacion.total : 0,
      tarjeta: metodoPago === 'Tarjeta' ? cotizacion.total : 0,
      transferencia: metodoPago === 'Transferencia' ? cotizacion.total : 0,
      estatus: 'Completada',
      metodoPago: metodoPago,
      corte: turnoActivo || undefined,
      sucursal: cotizacion.sucursal,
      usuario: { idUsuario } as PosUsuario,
      cliente: cotizacion.cliente
    });`
);

fs.writeFileSync('src/pos/pos.service.ts', backTs, 'utf8');
console.log('Fixed backend: venta now linked to corte');
