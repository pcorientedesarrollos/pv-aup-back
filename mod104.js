const fs = require('fs');

let controllerPath = 'src/pos/pos.controller.ts';
let ts = fs.readFileSync(controllerPath, 'utf8');

ts = ts.replace(
  `@Patch('cotizaciones/:id/convertir')
  convertirCotizacionAVenta(@Param('id') id: string, @Headers('x-usuario-id') idUsuario: string) {
    if (!idUsuario) throw new BadRequestException('Se requiere ID de usuario en headers para convertir cotizaciÃ³n a venta.');
    return this.posService.convertirCotizacionAVenta(Number(id), Number(idUsuario));
  }`,
  `@Patch('cotizaciones/:id/convertir')
  convertirCotizacionAVenta(@Param('id') id: string, @Headers('x-usuario-id') idUsuario: string, @Body('metodoPago') metodoPago: string) {
    if (!idUsuario) throw new BadRequestException('Se requiere ID de usuario en headers para convertir cotizaciÃ³n a venta.');
    return this.posService.convertirCotizacionAVenta(Number(id), Number(idUsuario), metodoPago || 'Efectivo');
  }`
);

fs.writeFileSync(controllerPath, ts, 'utf8');
console.log('Fixed backend controller to receive metodoPago');
