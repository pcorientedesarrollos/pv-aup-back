import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UploadedFiles, Headers, Put, Query, BadRequestException, Res } from '@nestjs/common';

import { LoginDto } from './dto/auth.dto';
import { CrearSucursalDto, ActualizarSucursalDto } from './dto/sucursal.dto';
import { ClienteDto } from './dto/cliente.dto';
import { UsuarioDto } from './dto/usuario.dto';
import { CheckoutDto } from './dto/venta.dto';
import { InventarioDto, EditarMovimientoDto } from './dto/inventario.dto';
import { EmpresaDto } from './dto/empresa.dto';
import { CategoriaDto } from './dto/categoria.dto';
import { ConfiguracionDto } from './dto/configuracion.dto';
import { GenerarProformaDto } from './dto/proforma.dto';
import { PosService } from './pos.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { Public } from '../auth/public.decorator';

@Controller('pos')
export class PosController {
  @Get('tipo-cambio')
  getTipoCambio() {
    return this.posService.getTipoCambio();
  }

  constructor(private readonly posService: PosService) {}

  @Public()
  @Post('auth/login')
  login(@Body() payload: LoginDto) {
    return this.posService.login(payload);
  }

  @Public()
  @Get('empresa-por-usuario/:username')
  getEmpresaPorUsuario(@Param('username') username: string) {
    return this.posService.getEmpresaPorUsuario(username);
  }

  // ─── SUCURSALES ─────────────────────────────────────────────────
  @Get('sucursales')
  getSucursales(@Headers("x-empresa-id") idEmpresa: string) {
    return this.posService.getSucursales(idEmpresa ? Number(idEmpresa) : undefined);
  }

  @Post('sucursales')
  crearSucursal(@Headers("x-empresa-id") idEmpresa: string, @Body() payload: CrearSucursalDto) {
    if (idEmpresa) {
      if ((payload as any).sucursal) {
        (payload as any).sucursal.empresa = { idEmpresa: Number(idEmpresa) };
      } else {
        payload.empresa = { idEmpresa: Number(idEmpresa) };
      }
    }
    return this.posService.crearSucursal(payload);
  }

  @Put('sucursales/:id')
  actualizarSucursal(@Param("id") id: string, @Body() payload: ActualizarSucursalDto) {
    return this.posService.actualizarSucursal(Number(id), payload);
  }

  @Get('productos')
  getProductos(@Headers("x-sucursal-id") idSucursal: string) {
    return this.posService.getProductos(Number(idSucursal));
  }

  @Get('productos/:id/proveedores')
  getProveedoresByProducto(@Param('id') id: string) {
    return this.posService.getProveedoresByProducto(Number(id));
  }

  @Get('productos/:id/compras')
  getComprasByProducto(
    @Param('id') id: string,
    @Query('idProveedor') idProveedor?: string
  ) {
    return this.posService.getComprasByProducto(Number(id), idProveedor ? Number(idProveedor) : undefined);
  }

  @Patch('productos/:id/imagen')
  @UseInterceptors(FileInterceptor('imagen', {
    storage: diskStorage({
      destination: './uploads/productos',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      }
    })
  }))
  actualizarImagenProducto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any
  ) {
    const data: any = {};
    if (body.codigoBarras !== undefined) {
      data.codigoBarras = body.codigoBarras;
    }
    if (file) {
      data.imagenUrl = `/uploads/productos/${file.filename}`;
    }
    return this.posService.actualizarProducto(Number(id), data);
  }

  @Patch('productos/:id')
  actualizarProducto(@Param('id') id: string, @Body() body: any) {
    return this.posService.actualizarProductoCompleto(Number(id), body);
  }

  @Get('categorias')
  getCategorias(@Headers("x-sucursal-id") idSucursal: string) {
    return this.posService.getCategorias(Number(idSucursal));
  }

  @Get('clientes')
  getClientes(@Headers("x-sucursal-id") idSucursal: string) {
    return this.posService.getClientes(Number(idSucursal));
  }

  @Post('clientes/alta-rapida')
  crearCliente(@Headers("x-sucursal-id") idSucursal: string, @Body() payload: ClienteDto) {
    (payload as any).idSucursal = Number(idSucursal);
    return this.posService.crearCliente(payload);
  }

  @Patch('clientes/:id')
  actualizarCliente(@Param("id") id: string, @Body() payload: ClienteDto) {
    return this.posService.actualizarCliente(Number(id), payload);
  }

  @Delete('clientes/:id')
  eliminarCliente(@Param('id') id: string) {
    return this.posService.eliminarCliente(Number(id));
  }

  @Get('usuarios')
  getUsuarios(@Headers("x-sucursal-id") idSucursal: string) {
    return this.posService.getUsuarios(Number(idSucursal));
  }

  @Get('usuarios/global')
  getUsuariosGlobal() {
    return this.posService.getAllUsuariosGlobal();
  }

  @Post('usuarios')
  crearUsuario(@Headers("x-sucursal-id") idSucursal: string, @Body() payload: UsuarioDto) {
    if (!payload.idSucursal) {
      (payload as any).idSucursal = Number(idSucursal);
    }
    return this.posService.crearUsuario(payload);
  }

  @Patch('usuarios/:id')
  actualizarUsuario(@Param("id") id: string, @Body() payload: UsuarioDto) {
    return this.posService.actualizarUsuario(Number(id), payload);
  }

  @Post('abrir-turno')
  abrirTurno(@Body() payload: { montoApertura: number, idUsuario: number }) {
    return this.posService.abrirTurno(payload);
  }

  @Get('turno-activo/:idUsuario')
  getTurnoActivo(@Param('idUsuario') idUsuario: string) {
    return this.posService.getTurnoActivo(Number(idUsuario));
  }

  @Get('corte-actual/:idUsuario')
  async getCorteActual(@Param('idUsuario') idUsuario: string) {
    const turno = await this.posService.getTurnoActivo(Number(idUsuario));
    if (!turno) return null;
    return this.posService.getCorteDeCaja(turno.idCorte);
  }

  @Get('corte/:idCorte')
  getCorteDeCaja(@Param('idCorte') idCorte: string) {
    return this.posService.getCorteDeCaja(Number(idCorte));
  }

  @Get('cortes')
  getAllCortes(@Headers("x-sucursal-id") idSucursal: string) {
    return this.posService.getAllCortes(Number(idSucursal));
  }

  @Post('corte')
  realizarCorte(@Body() payload: { idCorte: number, efectivoEscaner: number }) {
    return this.posService.realizarCorte(payload.idCorte, payload.efectivoEscaner);
  }

  @Post('checkout')
  checkout(@Body() payload: CheckoutDto) {
    return this.posService.checkout(payload);
  }

  @Public()
  @Get('ventas')
  getVentas(
    @Headers("x-sucursal-id") idSucursal: string,
    @Query('folio') folio?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    return this.posService.getVentas(Number(idSucursal), folio, Number(limit) || 100, Number(offset) || 0);
  }

  // --- Inventario Unificado ---
  @Get('inventario')
  getMovimientosInventario(@Headers("x-sucursal-id") idSucursal: string) {
    return this.posService.getMovimientosInventario(Number(idSucursal));
  }

  @Post('inventario/entradas')
  registrarEntradaInventario(@Headers("x-sucursal-id") idSucursal: string, @Headers("x-usuario-id") idUsuarioHeader: string, @Body() payload: InventarioDto) {
    const idUsuario = idUsuarioHeader ? Number(idUsuarioHeader) : ((payload as any).idUsuario || 1);
    return this.posService.registrarEntradaInventario(payload, idUsuario, Number(idSucursal));
  }

  @Post('inventario/entradas/masivo')
  registrarEntradasInventarioMasivo(@Headers("x-sucursal-id") idSucursal: string, @Headers("x-usuario-id") idUsuarioHeader: string, @Body() body: any) {
    const idUsuario = idUsuarioHeader ? Number(idUsuarioHeader) : (body.idUsuario || 1);
    return this.posService.registrarEntradasInventarioMasivo(body.entradas, idUsuario, Number(idSucursal));
  }

  @Post('inventario/importar-xml')
  @UseInterceptors(FileInterceptor('xml'))
  importarXml(@Headers("x-sucursal-id") idSucursal: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Archivo XML no proporcionado');
    return this.posService.parsearXmlFactura(file.buffer.toString('utf-8'), Number(idSucursal));
  }

  @Post('inventario/importar-pdf')
  @UseInterceptors(FileInterceptor('pdf'))
  importarPdf(@Headers("x-sucursal-id") idSucursal: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Archivo PDF no proporcionado');
    return this.posService.parsearPdfFactura(file.buffer, Number(idSucursal));
  }

  @Patch('inventario/movimiento/:id')
  editarMovimiento(@Param("id") id: string, @Body() payload: EditarMovimientoDto) {
    return this.posService.editarMovimiento(Number(id), payload);
  }

  @Delete('inventario/movimiento/:id')
  anularMovimiento(@Param('id') id: string) {
    return this.posService.anularMovimiento(Number(id));
  }

  // ─── NUEVO PRODUCTO ──────────────────────────────────────────────
  @Post('productos')
  crearProducto(@Headers("x-sucursal-id") idSucursal: string, @Body() body: any) {
    body.idSucursal = Number(idSucursal);
    return this.posService.crearProducto(body);
  }

  @Post('productos/:id/codigos')
  agregarCodigoAdicional(@Param('id') id: string, @Body('codigoBarras') codigoBarras: string) {
    return this.posService.agregarCodigoAdicional(Number(id), codigoBarras);
  }

  @Delete('productos/:id/codigos/:idCodigo')
  eliminarCodigoAdicional(@Param('idCodigo') idCodigo: string) {
    return this.posService.eliminarCodigoAdicional(Number(idCodigo));
  }

  // ⚖️ AJUSTE DE STOCK ⚖️
  @Post('inventario/ajuste')
  ajustarStock(@Headers("x-sucursal-id") idSucursal: string, @Headers("x-usuario-id") idUsuarioHeader: string, @Body() body: any) {
    const idUsuario = idUsuarioHeader ? Number(idUsuarioHeader) : (body.idUsuario || 1);
    return this.posService.ajustarStock(body.idProducto, body.stockReal, body.motivo, idUsuario, Number(idSucursal));
  }

  // 🗑️ REGISTRO DE MERMAS 🗑️
  @Post('inventario/merma')
  registrarMerma(@Headers("x-sucursal-id") idSucursal: string, @Headers("x-usuario-id") idUsuarioHeader: string, @Body() body: any) {
    const idUsuario = idUsuarioHeader ? Number(idUsuarioHeader) : (body.idUsuario || 1);
    return this.posService.registrarMerma(body.idProducto, body.cantidad, body.motivo, idUsuario, Number(idSucursal));
  }

  // ─── DASHBOARD STATS ────────────────────────────────────────────
  @Get('dashboard/stats')
  getDashboardStats(@Headers("x-sucursal-id") idSucursal: string) {
    return this.posService.getDashboardStats(Number(idSucursal));
  }

  // ─── EMPRESAS ───────────────────────────────────────────────────
  @Get('empresas')
  getEmpresas(@Headers("x-empresa-id") idEmpresa: string) {
    return this.posService.getEmpresas(idEmpresa ? Number(idEmpresa) : undefined);
  }

  @Post('empresas')
  crearEmpresa(@Body() payload: EmpresaDto) {
    return this.posService.crearEmpresa(payload);
  }

  @Put('empresas/:id')
  actualizarEmpresa(@Param("id") id: string, @Body() payload: EmpresaDto) {
    return this.posService.actualizarEmpresa(Number(id), payload);
  }

  // ─── CATEGORIAS ─────────────────────────────────────────────────
  @Post('categorias')
  crearCategoria(@Headers("x-sucursal-id") idSucursal: string, @Body() payload: CategoriaDto) {
    (payload as any).idSucursal = Number(idSucursal);
    return this.posService.crearCategoria(payload);
  }

  @Put('categorias/:id')
  actualizarCategoria(@Param("id") id: string, @Body() payload: CategoriaDto) {
    return this.posService.actualizarCategoria(Number(id), payload);
  }

  // ─── CONFIGURACIONES ────────────────────────────────────────────
  @Get('configuracion')
  getConfiguracion(@Headers("x-sucursal-id") idSucursal: string) {
    if (!idSucursal) return null;
    return this.posService.getConfiguracionSucursal(Number(idSucursal));
  }

  @Patch('configuracion')
  actualizarConfiguracion(@Headers("x-sucursal-id") idSucursal: string, @Body() payload: ConfiguracionDto) {
    return this.posService.updateConfiguracionSucursal(Number(idSucursal), payload);
  }

  @Get('configuraciones-todas')
  getAllConfiguraciones() {
    return this.posService.getAllConfiguraciones();
  }

  // ─── UPLOADS ────────────────────────────────────────────────────
  // FACTURAS
  @Get('facturas')
  getFacturas(@Headers('x-sucursal-id') idSucursal: string) {
    return this.posService.getFacturas(Number(idSucursal));
  }


  @Post('facturar/:idVenta')
  facturarVenta(
    @Param('idVenta') idVenta: string,
    @Body() payload: { rfc: string, razonSocial: string, cp: string, regimen: string, usoCfdi: string, formaPago: string, metodoPago: string }
  ) {
    return this.posService.facturarVenta(Number(idVenta), payload);
  }

  @Post('facturas/:idFactura/cancelar')
  cancelarFactura(@Param('idFactura') idFactura: string, @Body() payload: { motivo: string, uuidSustitucion?: string }) {
    return this.posService.cancelarFactura(Number(idFactura), payload.motivo, payload.uuidSustitucion);
  }

  @Public()
  @Get('facturas/:idFacturama/pdf')
  async descargarFacturaPdf(@Param('idFacturama') idFacturama: string, @Res() res: any) {
    try {
      const data = await this.posService.descargarFacturaArchivo(idFacturama, 'pdf');
      if (data && data.Content) {
        const buffer = Buffer.from(data.Content, 'base64');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${idFacturama}.pdf"`);
        res.send(buffer);
      } else {
        res.status(404).send('PDF not found');
      }
    } catch (e: any) {
      const status = e.getStatus ? e.getStatus() : (e.status || 500);
      res.status(status).send(e.message || 'Error downloading PDF');
    }
  }

  @Public()
  @Get('facturas/:idFacturama/xml')
  async descargarFacturaXml(@Param('idFacturama') idFacturama: string, @Res() res: any) {
    try {
      const data = await this.posService.descargarFacturaArchivo(idFacturama, 'xml');
      if (data && data.Content) {
        const buffer = Buffer.from(data.Content, 'base64');
        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Content-Disposition', `attachment; filename="${idFacturama}.xml"`);
        res.send(buffer);
      } else {
        res.status(404).send('XML not found');
      }
    } catch (e: any) {
      const status = e.getStatus ? e.getStatus() : (e.status || 500);
      res.status(status).send(e.message || 'Error downloading XML');
    }
  }

  @Public()
  @Get('facturas/:idFactura/paquete-cancelacion')
  async descargarPaqueteCancelacion(@Param('idFactura') idFactura: string, @Res() res: any) {
    try {
      const zipBuffer = await this.posService.descargarPaqueteCancelacion(Number(idFactura));
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="Acuse-Factura-PUR-${idFactura}.zip"`);
      res.send(zipBuffer);
    } catch (error: any) {
      console.error(error);
      const status = error.getStatus ? error.getStatus() : (error.status || 500);
      res.status(status).send('Error al generar el paquete de cancelación: ' + error.message);
    }
  }

  // -------------------------
  // MÓDULO CATÁLOGOS SAT
  // -------------------------
  @Get('catalogo-sat/productos')
  async buscarProductosSAT(@Query('q') query: string) {
    return this.posService.buscarProductosSAT(query);
  }

  @Get('catalogo-sat/unidades')
  async buscarUnidadesSAT(@Query('q') query: string) {
    return this.posService.buscarUnidadesSAT(query);
  }

  // -------------------------
  // MÓDULO PROFORMAS
  // -------------------------

  @Get('proformas')
  getProformas(@Headers('x-sucursal-id') idSucursal: string) {
    return this.posService.getProformas(idSucursal ? Number(idSucursal) : undefined);
  }

  @Post('proforma')
  generarProforma(@Body() payload: GenerarProformaDto, @Headers("x-sucursal-id") idSucursal: string) {
    return this.posService.generarProforma(payload, idSucursal ? Number(idSucursal) : undefined);
  }

  // -------------------------
  // MÓDULO COTIZACIONES
  // -------------------------

  @Get('cotizaciones')
  getCotizaciones(@Headers('x-sucursal-id') idSucursal: string) {
    return this.posService.getCotizaciones(idSucursal ? Number(idSucursal) : undefined);
  }

  @Post('cotizaciones')
  crearCotizacion(
    @Body() body: any, 
    @Headers('x-sucursal-id') idSucursal: string,
    @Headers('x-usuario-id') idUsuario: string
  ) {
    if (idSucursal) body.idSucursal = Number(idSucursal);
    if (idUsuario) body.idUsuario = Number(idUsuario);
    return this.posService.crearCotizacion(body);
  }

  @Patch('cotizaciones/:id/estatus')
  cambiarEstatusCotizacion(@Param('id') id: string, @Body('estatus') estatus: string) {
    return this.posService.cambiarEstatusCotizacion(Number(id), estatus);
  }

  @Delete('cotizaciones/:id')
  eliminarCotizacion(@Param('id') id: string) {
    return this.posService.eliminarCotizacion(Number(id));
  }

  @Patch('cotizaciones/:id/convertir')
  convertirCotizacionAVenta(@Param('id') id: string, @Headers('x-usuario-id') idUsuario: string) {
    if (!idUsuario) throw new BadRequestException('Se requiere ID de usuario en headers para convertir cotización a venta.');
    return this.posService.convertirCotizacionAVenta(Number(id), Number(idUsuario));
  }

  @Post('cotizaciones/:id/facturar')
  facturarCotizacion(@Param('id') id: string, @Body() body: any) {
    return this.posService.facturarCotizacion(Number(id), body);
  }

  @Post('upload-logo')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `logo-${uniqueSuffix}${extname(file.originalname)}`);
      }
    })
  }))
  uploadLogo(@UploadedFile() file: Express.Multer.File) {
    return { url: `/uploads/${file.filename}` };
  }

  // "? HERRAMIENTAS / CSF "?
  @Post('utils/parse-csf')
  @UseInterceptors(FileInterceptor('file')) // memory storage by default
  async parseCsf(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { success: false, error: 'No se subió ningún archivo' };
    }
    return this.posService.parseCsf(file.buffer);
  }

  @Get('utils/buscar-rfc/:rfc')
  async buscarRfc(@Param('rfc') rfc: string) {
    if (!rfc || rfc.length < 12) {
      return { success: false, error: 'RFC inválido' };
    }
    return this.posService.buscarRfc(rfc);
  }

  // ═══════════════════════════════════════════════════════
  // PROVEEDORES
  // ═══════════════════════════════════════════════════════

  @Get('proveedores')
  getProveedores(@Headers('x-sucursal-id') idSucursal: string) {
    return this.posService.getProveedores(idSucursal ? Number(idSucursal) : undefined);
  }

  @Post('proveedores')
  crearProveedor(@Body() body: any, @Headers('x-sucursal-id') idSucursal: string) {
    return this.posService.crearProveedor(body, idSucursal ? Number(idSucursal) : undefined);
  }

  @Put('proveedores/:id')
  actualizarProveedor(@Param('id') id: string, @Body() body: any) {
    return this.posService.actualizarProveedor(Number(id), body);
  }

  @Delete('proveedores/:id')
  eliminarProveedor(@Param('id') id: string) {
    return this.posService.eliminarProveedor(Number(id));
  }

  // ═══════════════════════════════════════════════════════
  // COMPRAS
  // ═══════════════════════════════════════════════════════

  @Get('compras')
  getCompras(
    @Headers('x-sucursal-id') idSucursal: string,
    @Query('idProveedor') idProveedor?: string
  ) {
    return this.posService.getCompras(
      idSucursal ? Number(idSucursal) : undefined,
      idProveedor ? Number(idProveedor) : undefined
    );
  }

  @Get('compras/:id')
  getCompra(@Param('id') id: string) {
    return this.posService.getCompra(Number(id));
  }

  @Post('compras')
  crearCompra(@Body() body: any, @Headers('x-sucursal-id') idSucursal: string, @Headers('x-usuario-id') idUsuario: string) {
    return this.posService.crearCompra(body, idSucursal ? Number(idSucursal) : undefined, idUsuario ? Number(idUsuario) : undefined);
  }

  @Patch('compras/:id/factura')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'pdf', maxCount: 1 },
    { name: 'xml', maxCount: 1 },
  ], {
    storage: diskStorage({
      destination: './uploads/compras',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `compra-factura-${uniqueSuffix}${ext}`);
      }
    })
  }))
  async subirFacturaCompra(
    @Param('id') id: string,
    @UploadedFiles() files: { pdf?: Express.Multer.File[], xml?: Express.Multer.File[] }
  ) {
    const pdfPath = files?.pdf?.[0] ? `/uploads/compras/${files.pdf[0].filename}` : undefined;
    const xmlPath = files?.xml?.[0] ? `/uploads/compras/${files.xml[0].filename}` : undefined;
    return this.posService.subirFacturaCompra(Number(id), pdfPath, xmlPath);
  }

  // ═══════════════════════════════════════════════════════
  // DEVOLUCIONES
  // ═══════════════════════════════════════════════════════

  @Get('devoluciones')
  getDevoluciones(@Headers('x-sucursal-id') idSucursal: string) {
    return this.posService.getDevoluciones(idSucursal ? Number(idSucursal) : undefined);
  }

  @Get('devoluciones/:id')
  getDevolucion(@Param('id') id: string) {
    return this.posService.getDevolucion(Number(id));
  }

  @Post('devoluciones')
  crearDevolucion(@Body() body: any, @Headers('x-sucursal-id') idSucursal: string, @Headers('x-usuario-id') idUsuario: string) {
    return this.posService.crearDevolucion(body, idSucursal ? Number(idSucursal) : undefined, idUsuario ? Number(idUsuario) : undefined);
  }

  @Get('proxy/descargar-xml')
  async proxyDescargarXml(@Query('url') url: string, @Res() res: any) {
    if (!url) return res.status(400).send('URL no proporcionada');
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al obtener el archivo');
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileName = url.split('/').pop()?.split('?')[0] || 'factura.xml';
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', 'application/xml');
      res.send(buffer);
    } catch (e) {
//       void('Error proxying the file', e);
      res.status(500).send('Error proxying the file');
    }
  }

  // ─── IMPORTACIÓN MASIVA ──────────────────────────────────────────────────────

  @Public()
  @Get('importar/plantilla/:tipo')
  descargarPlantilla(@Param('tipo') tipo: string, @Res() res: any) {
    if (!['productos', 'clientes', 'proveedores'].includes(tipo)) {
      throw new BadRequestException('Tipo inválido. Usa: productos, clientes o proveedores');
    }
    const buffer = this.posService.generarPlantillaExcel(tipo as any);
    res.setHeader('Content-Disposition', `attachment; filename="plantilla_${tipo}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  }

  @Post('importar/productos')
  @UseInterceptors(FileInterceptor('archivo'))
  importarProductos(
    @UploadedFile() archivo: Express.Multer.File,
    @Headers('x-sucursal-id') idSucursal: string
  ) {
    if (!archivo) throw new BadRequestException('No se recibió ningún archivo');
    return this.posService.importarProductos(archivo.buffer, idSucursal ? Number(idSucursal) : undefined);
  }

  @Post('importar/clientes')
  @UseInterceptors(FileInterceptor('archivo'))
  importarClientes(
    @UploadedFile() archivo: Express.Multer.File,
    @Headers('x-sucursal-id') idSucursal: string
  ) {
    if (!archivo) throw new BadRequestException('No se recibió ningún archivo');
    return this.posService.importarClientes(archivo.buffer, idSucursal ? Number(idSucursal) : undefined);
  }

  @Post('importar/proveedores')
  @UseInterceptors(FileInterceptor('archivo'))
  importarProveedores(
    @UploadedFile() archivo: Express.Multer.File,
    @Headers('x-sucursal-id') idSucursal: string
  ) {
    if (!archivo) throw new BadRequestException('No se recibió ningún archivo');
    return this.posService.importarProveedores(archivo.buffer, idSucursal ? Number(idSucursal) : undefined);
  }
}
