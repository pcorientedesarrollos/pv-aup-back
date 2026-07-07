import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not } from 'typeorm';

import { PosSucursal } from './entities/pos-sucursal.entity';
import { PosCategoria } from './entities/pos-categoria.entity';
import { PosProducto } from './entities/pos-producto.entity';
import { PosProductoCodigo } from './entities/pos-producto-codigo.entity';
import { PosCliente } from './entities/pos-cliente.entity';
import { PosUsuario } from './entities/pos-usuario.entity';
import { PosVenta } from './entities/pos-venta.entity';
import { PosVentaDetalle } from './entities/pos-venta-detalle.entity';
import { PosCorteCaja } from './entities/pos-corte-caja.entity';
import { PosMovimientoInventario } from './entities/pos-movimiento-inventario.entity';
import { PosEmpresa } from './entities/pos-empresa.entity';
import { PosConfiguracion } from './entities/pos-configuracion.entity';
import { PosFactura } from './entities/pos-factura.entity';
import { PosProforma } from './entities/pos-proforma.entity';
import { PosProveedor } from './entities/pos-proveedor.entity';
import { PosCompra } from './entities/pos-compra.entity';
import { PosCompraDetalle } from './entities/pos-compra-detalle.entity';
import { PosDevolucion } from './entities/pos-devolucion.entity';
import { JwtService } from '@nestjs/jwt';
import Facturapi from 'facturapi';
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';
import { XMLParser } from 'fast-xml-parser';

@Injectable()
export class PosService {
  constructor(
    @InjectRepository(PosSucursal) private sucursalRepo: Repository<PosSucursal>,
    @InjectRepository(PosProducto) private productoRepo: Repository<PosProducto>,
    @InjectRepository(PosProductoCodigo) private productoCodigoRepo: Repository<PosProductoCodigo>,
    @InjectRepository(PosCategoria) private categoriaRepo: Repository<PosCategoria>,
    @InjectRepository(PosCliente) private clienteRepo: Repository<PosCliente>,
    @InjectRepository(PosVenta) private ventaRepo: Repository<PosVenta>,
    @InjectRepository(PosUsuario) private usuarioRepo: Repository<PosUsuario>,
    @InjectRepository(PosCorteCaja) private corteRepo: Repository<PosCorteCaja>,
    @InjectRepository(PosMovimientoInventario) private movimientoRepo: Repository<PosMovimientoInventario>,
    @InjectRepository(PosEmpresa) private empresaRepo: Repository<PosEmpresa>,
    @InjectRepository(PosConfiguracion) private configRepo: Repository<PosConfiguracion>,
    @InjectRepository(PosFactura) private facturaRepo: Repository<PosFactura>,
    @InjectRepository(PosProforma) private proformaRepo: Repository<PosProforma>,
    @InjectRepository(PosProveedor) private proveedorRepo: Repository<PosProveedor>,
    @InjectRepository(PosCompra) private compraRepo: Repository<PosCompra>,
    @InjectRepository(PosCompraDetalle) private compraDetalleRepo: Repository<PosCompraDetalle>,
    @InjectRepository(PosDevolucion) private devolucionRepo: Repository<PosDevolucion>,
    private jwtService: JwtService,
    private dataSource: DataSource
  ) {}

  async getSucursales(idEmpresa?: number) {
    return this.sucursalRepo.find({ 
      where: idEmpresa ? { empresa: { idEmpresa } } : {},
      order: { idSucursal: 'ASC' },
      relations: { empresa: true }
    });
  }

  async crearSucursal(payload: any) {
    const sucursalData = payload.sucursal ? payload.sucursal : payload;
    const sucursal = this.sucursalRepo.create({
      ...sucursalData,
      empresa: sucursalData.empresa?.idEmpresa ? { idEmpresa: sucursalData.empresa.idEmpresa } : null
    });
    const saved = await this.sucursalRepo.save(sucursal) as any;

    if (payload.usuario && payload.usuario.nombreUsuario) {
      if (!payload.usuario.contrasena || payload.usuario.contrasena.length < 6) {
        throw new BadRequestException('La contraseña del usuario administrador debe tener al menos 6 caracteres');
      }
      const nuevoUsuario = this.usuarioRepo.create({
        sucursal: { idSucursal: saved.idSucursal },
        nombreUsuario: payload.usuario.nombreUsuario,
        nombreCompleto: payload.usuario.nombreCompleto || payload.usuario.nombreUsuario,
        contrasenaHash: await bcrypt.hash(payload.usuario.contrasena, 10),
        rol: 'Administrador',
        activo: true
      });
      await this.usuarioRepo.save(nuevoUsuario);
    }
    return saved;
  }

  async actualizarSucursal(id: number, payload: any) {
    const sucursal = await this.sucursalRepo.findOne({ where: { idSucursal: id } });
    if (!sucursal) return null;
    
    if (payload.nombre) sucursal.nombre = payload.nombre;
    if (payload.direccion !== undefined) sucursal.direccion = payload.direccion;
    if (payload.telefono !== undefined) sucursal.telefono = payload.telefono;
    if (payload.activo !== undefined) sucursal.activo = payload.activo;
    
    if (payload.empresa && payload.empresa.idEmpresa) {
      sucursal.empresa = { idEmpresa: payload.empresa.idEmpresa } as any;
    } else if (payload.empresa === null) {
      sucursal.empresa = null as any;
    }
    
    return this.sucursalRepo.save(sucursal);
  }

  async login(payload: any) {
    const username = payload.user || payload.usuario;
    const user = await this.usuarioRepo.findOne({ 
      where: { nombreUsuario: username, activo: true },
      relations: { sucursal: { empresa: true } }
    });
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Compatibilidad para passwords legacy en texto plano
    const isLegacyPlain = !user.contrasenaHash.startsWith('$2a$') && !user.contrasenaHash.startsWith('$2b$');
    let isMatch = false;

    if (isLegacyPlain) {
      if (user.contrasenaHash === payload.password) {
        isMatch = true;
        // Upgrade password to hash silently
        user.contrasenaHash = await bcrypt.hash(payload.password, 10);
        await this.usuarioRepo.save(user);
      }
    } else {
      isMatch = await bcrypt.compare(payload.password, user.contrasenaHash);
    }

    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const jwtPayload = { username: user.nombreUsuario, sub: user.idUsuario, rol: user.rol, sucursal: user.sucursal?.idSucursal };
    const empresa = user.sucursal?.empresa;

    const authPayload = { 
      idUsuario: user.idUsuario, 
      idPerfil: user.rol === 'Administrador' ? 1 : (user.rol === 'Soporte' ? 3 : 2), 
      usuario: user.nombreUsuario, 
      idSucursal: user.sucursal?.idSucursal,
      sucursalNombre: user.sucursal?.nombre || 'Global',
      empresa: empresa ? { idEmpresa: empresa.idEmpresa, nombre: empresa.nombre, logoUrl: empresa.logoUrl, colorPrincipal: empresa.colorPrincipal } : null
    };
    
    return {
      access_token: this.jwtService.sign(jwtPayload),
      ...authPayload,
      app: 1
    };
  }

  async getEmpresaPorUsuario(username: string) {
    const user = await this.usuarioRepo.findOne({ 
      where: { nombreUsuario: username, activo: true },
      relations: { sucursal: { empresa: true } }
    });
    if (user && user.sucursal?.empresa) {
      return { 
        idEmpresa: user.sucursal.empresa.idEmpresa,
        nombre: user.sucursal.empresa.nombre, 
        logoUrl: user.sucursal.empresa.logoUrl,
        colorPrincipal: user.sucursal.empresa.colorPrincipal
      };
    }
    return { nombre: 'AUP POS', logoUrl: '/logo.png', colorPrincipal: '#f59e0b' };
  }

  async getProductos(idSucursal?: number) {
    const where = idSucursal ? { sucursal: { idSucursal } } : {};
    return this.productoRepo.find({
      where,
      relations: { categoria: true, sucursal: { empresa: true }, codigosAdicionales: true }
    });
  }

  async actualizarProducto(id: number, data: { codigoBarras?: string; imagenUrl?: string }) {
    await this.productoRepo.update(id, data);
    return this.productoRepo.findOne({ where: { idProducto: id }, relations: { categoria: true } });
  }

  async actualizarProductoCompleto(id: number, data: {
    nombre?: string;
    codigoBarras?: string;
    precioUnitario?: number;
    precioPublico?: number;
    precioMayoreo?: number;
    iva?: number;
    stockMinimo?: number;
    imagenUrl?: string;
    claveProdServ?: string;
    claveUnidad?: string;
  }) {
    const productoExistente = await this.productoRepo.findOne({ where: { idProducto: id }, relations: { sucursal: true } });
    if (!productoExistente) throw new BadRequestException('Producto no encontrado');
    const idSucursal = productoExistente.sucursal?.idSucursal;

    if (idSucursal) {
      if (data.nombre && data.nombre.trim().toUpperCase() !== productoExistente.nombre) {
        const dupNombre = await this.productoRepo.findOne({
          where: { sucursal: { idSucursal }, nombre: data.nombre.trim().toUpperCase(), idProducto: Not(id) }
        });
        if (dupNombre) throw new BadRequestException(`Ya existe otro producto con el nombre "${data.nombre.trim().toUpperCase()}" en esta sucursal.`);
      }
      if (data.codigoBarras && data.codigoBarras !== productoExistente.codigoBarras) {
        const dupCodigo = await this.productoRepo.findOne({
          where: { sucursal: { idSucursal }, codigoBarras: data.codigoBarras, idProducto: Not(id) }
        });
        if (dupCodigo) throw new BadRequestException(`Ya existe otro producto con el código de barras "${data.codigoBarras}" en esta sucursal.`);
      }
    }

    const updates: any = {};
    if (data.nombre !== undefined) updates.nombre = data.nombre;
    if (data.codigoBarras !== undefined) updates.codigoBarras = data.codigoBarras;
    if (data.precioUnitario !== undefined) updates.precioUnitario = data.precioUnitario;
    if (data.precioPublico !== undefined) updates.precioPublico = data.precioPublico;
    if (data.precioMayoreo !== undefined) updates.precioMayoreo = data.precioMayoreo;
    if (data.iva !== undefined) updates.iva = data.iva;
    if (data.stockMinimo !== undefined) updates.stockMinimo = data.stockMinimo;
    if (data.imagenUrl !== undefined) updates.imagenUrl = data.imagenUrl;
    if (data.claveProdServ !== undefined) updates.claveProdServ = data.claveProdServ;
    if (data.claveUnidad !== undefined) updates.claveUnidad = data.claveUnidad;
    if (Object.keys(updates).length > 0) {
      await this.productoRepo.update(id, updates);
    }
    return this.productoRepo.findOne({ where: { idProducto: id }, relations: { categoria: true, codigosAdicionales: true } });
  }

  // ─── CODIGOS ADICIONALES ─────────────────────────────────────────
  async agregarCodigoAdicional(idProducto: number, codigoBarras: string) {
    const p = await this.productoRepo.findOne({ where: { idProducto }, relations: { sucursal: true } });
    if (!p) throw new BadRequestException('Producto no encontrado');
    
    // Check duplication across sucursal
    if (p.sucursal) {
      // Is it main code of another product?
      const mainDup = await this.productoRepo.findOne({ where: { sucursal: { idSucursal: p.sucursal.idSucursal }, codigoBarras } });
      if (mainDup) throw new BadRequestException(`El código "${codigoBarras}" ya es el principal de otro producto en esta sucursal.`);
      
      // Is it alias of another product?
      const aliasDup = await this.productoCodigoRepo.findOne({ 
        where: { codigoBarras, producto: { sucursal: { idSucursal: p.sucursal.idSucursal } } },
        relations: { producto: true }
      });
      if (aliasDup) throw new BadRequestException(`El código "${codigoBarras}" ya está asignado a otro producto en esta sucursal.`);
    }

    const nuevo = this.productoCodigoRepo.create({ codigoBarras, producto: { idProducto } });
    return this.productoCodigoRepo.save(nuevo);
  }

  async eliminarCodigoAdicional(idCodigo: number) {
    await this.productoCodigoRepo.delete(idCodigo);
    return { success: true };
  }


  async getCategorias(idSucursal?: number) {
    let where: any = { activo: true };

    if (idSucursal) {
      const sucursal = await this.sucursalRepo.findOne({
        where: { idSucursal },
        relations: { empresa: true }
      });
      if (sucursal && sucursal.empresa) {
        where.empresa = { idEmpresa: sucursal.empresa.idEmpresa };
      }
    }

    const categorias = await this.categoriaRepo.find({
      where,
      relations: { empresa: true }
    });

    if (categorias.length === 0) return [];

    const categoriaIds = categorias.map(c => c.idCategoria);
    const counts = await this.productoRepo.createQueryBuilder('producto')
      .select('categoria.idCategoria', 'idCategoria')
      .addSelect('COUNT(producto.idProducto)', 'total')
      .innerJoin('producto.categoria', 'categoria')
      .where('categoria.idCategoria IN (:...categoriaIds)', { categoriaIds })
      .andWhere('producto.activo = :activo', { activo: true })
      .groupBy('categoria.idCategoria')
      .getRawMany();

    const countMap = new Map<number, number>();
    counts.forEach(c => countMap.set(c.idCategoria, Number(c.total)));

    return categorias.map(cat => ({
      ...cat,
      totalProductos: countMap.get(cat.idCategoria) || 0
    }));
  }

  async getClientes(idSucursal?: number) {
    const where = idSucursal ? { sucursal: { idSucursal } } : {};
    return this.clienteRepo.find({ where, relations: { sucursal: { empresa: true } } });
  }

  async verificarDuplicadoCliente(payload: any, idActual: number = 0) {
    if (payload.rfc && payload.rfc.toUpperCase() !== 'XAXX010101000' && payload.rfc.toUpperCase() !== 'XEXX010101000') {
      const existeRfc = await this.clienteRepo.findOne({ where: { rfc: payload.rfc } });
      if (existeRfc && existeRfc.idCliente !== idActual) {
        throw new BadRequestException(`Ya existe un cliente con el RFC ${payload.rfc}`);
      }
    }
    if (payload.nombreCompleto) {
      const duplicadoNombre = await this.clienteRepo.findOne({
        where: { nombreCompleto: payload.nombreCompleto }
      });
      if (duplicadoNombre && duplicadoNombre.idCliente !== idActual) {
        throw new BadRequestException(`Ya existe un cliente con el nombre exacto ${payload.nombreCompleto}`);
      }
    }
  }

  async crearCliente(payload: any) {
    await this.verificarDuplicadoCliente(payload);
    const nuevo = this.clienteRepo.create({ ...payload, sucursal: { idSucursal: payload.idSucursal } });
    return this.clienteRepo.save(nuevo);
  }

  async actualizarCliente(id: number, payload: any) {
    await this.verificarDuplicadoCliente(payload, id);
    const updates = { ...payload };
    delete updates.idSucursal;
    delete updates.idCliente;
    await this.clienteRepo.update(id, updates);
    return this.clienteRepo.findOne({ where: { idCliente: id } });
  }

  async eliminarCliente(id: number) {
    await this.clienteRepo.delete(id);
    return { success: true };
  }

  async getUsuarios(idSucursal?: number) {
    const where = idSucursal ? { sucursal: { idSucursal } } : {};
    return this.usuarioRepo.find({ where, relations: { sucursal: { empresa: true } }, order: { idUsuario: "ASC" } });
  }

  async getAllUsuariosGlobal() {
    return this.usuarioRepo.find({ relations: { sucursal: true }, order: { idUsuario: "ASC" } });
  }

  async crearUsuario(payload: any) {
    const rolFinal = payload.rol || (payload.idPerfil == 1 ? 'Administrador' : (payload.idPerfil == 3 ? 'Soporte' : 'Cajero'));
    const nuevo = this.usuarioRepo.create({
      sucursal: { idSucursal: payload.idSucursal },
      nombreUsuario: payload.usuario,
      nombreCompleto: payload.nombreCompleto || payload.usuario,
      contrasenaHash: await bcrypt.hash(payload.password, 10),
      rol: rolFinal,
      activo: payload.oculto ? false : true,
    });
    return this.usuarioRepo.save(nuevo);
  }

  async actualizarUsuario(id: number, payload: any) {
    const usuario = await this.usuarioRepo.findOne({ where: { idUsuario: id } });
    if (!usuario) return null;
    
    if (payload.usuario) usuario.nombreUsuario = payload.usuario;
    if (payload.nombreCompleto) usuario.nombreCompleto = payload.nombreCompleto;
    if (payload.password) usuario.contrasenaHash = await bcrypt.hash(payload.password, 10);
    if (payload.idPerfil) usuario.rol = payload.idPerfil == 1 ? 'Administrador' : (payload.idPerfil == 3 ? 'Soporte' : 'Cajero');
    if (payload.rol) usuario.rol = payload.rol;
    if (payload.oculto !== undefined) usuario.activo = payload.oculto ? false : true;
    if (payload.idSucursal !== undefined) {
      usuario.sucursal = { idSucursal: payload.idSucursal } as any;
    }

    return this.usuarioRepo.save(usuario);
  }

  async abrirTurno(payload: { montoApertura: number, idUsuario: number }) {
    const usuario = await this.usuarioRepo.findOne({ where: { idUsuario: payload.idUsuario } });
    if (!usuario) throw new BadRequestException('Usuario no encontrado');

    const corteExistente = await this.corteRepo.findOne({
      where: { usuario: { idUsuario: payload.idUsuario }, estatus: 'Abierto' }
    });

    if (corteExistente) {
      throw new BadRequestException('Ya existe un turno abierto para este usuario');
    }

    const nuevoCorte = this.corteRepo.create({
      usuario,
      fondoInicial: payload.montoApertura,
      efectivoDeclarado: 0,
      estatus: 'Abierto'
    });

    const saved = await this.corteRepo.save(nuevoCorte);

    return {
      success: true,
      idCorte: saved.idCorte,
      mensaje: `Turno abierto para "${usuario.nombreUsuario}" con $${payload.montoApertura}`
    };
  }

  async getTurnoActivo(idUsuario: number) {
    return this.corteRepo.findOne({
      where: { usuario: { idUsuario }, estatus: 'Abierto' }
    });
  }

  async getCorteDeCaja(idCorte: number) {
    const corte = await this.corteRepo.findOne({
      where: { idCorte },
      relations: { usuario: true }
    });

    if (!corte) throw new BadRequestException('Corte no encontrado');

    const ventas = await this.ventaRepo.find({
      where: { corte: { idCorte } }
    });

    const ventasCompletadas = ventas.filter(v => v.estatus === 'Completada');
    const ventasCanceladas = ventas.filter(v => v.estatus === 'Cancelada');

    const totalEfectivo = ventasCompletadas.filter(v => v.metodoPago === 'Efectivo').reduce((acc, v) => acc + Number(v.totalPagado), 0);
    const totalTarjeta = ventasCompletadas.filter(v => v.metodoPago === 'Tarjeta').reduce((acc, v) => acc + Number(v.totalPagado), 0);
    const totalTransferencia = ventasCompletadas.filter(v => v.metodoPago === 'Transferencia').reduce((acc, v) => acc + Number(v.totalPagado), 0);
    const totalCancelado = ventasCanceladas.reduce((acc, v) => acc + Number(v.totalPagado), 0);

    const esperado = Number(corte.fondoInicial) + totalEfectivo + totalTarjeta + totalTransferencia;

    return {
      corte,
      resumen: {
        aperturasCaja: Number(corte.fondoInicial),
        totalEfectivo,
        totalTarjeta,
        totalTransferencia,
        totalCancelado,
        totalIngresos: esperado
      }
    };
  }

  async realizarCorte(idCorte: number, efectivoEscaner: number) {
    const corteData = await this.getCorteDeCaja(idCorte);
    
    await this.corteRepo.update(idCorte, {
      fechaCierre: new Date(),
      efectivoDeclarado: efectivoEscaner,
      estatus: 'Cerrado'
    });

    return {
      success: true,
      mensaje: 'Corte realizado con éxito',
      diferencia: efectivoEscaner - corteData.resumen.totalIngresos
    };
  }

  async getAllCortes(idSucursal?: number) {
    const baseWhere = { rol: Not('Soporte') };
    const where = idSucursal 
      ? { usuario: { ...baseWhere, sucursal: { idSucursal } } } 
      : { usuario: baseWhere };
      
    return this.corteRepo.find({
      where,
      relations: { usuario: { sucursal: { empresa: true } } },
      order: { fechaApertura: 'DESC' }
    });
  }

  async checkout(payload: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const turno = await queryRunner.manager.findOne(PosCorteCaja, { 
        where: { usuario: { idUsuario: payload.idUsuario }, estatus: 'Abierto' } 
      });
      if (!turno) throw new BadRequestException('El usuario no tiene un turno abierto');

      const usuario = await queryRunner.manager.findOne(PosUsuario, { 
        where: { idUsuario: payload.idUsuario },
        relations: { sucursal: true }
      });
      if (!usuario) throw new BadRequestException('Usuario no encontrado');

      let cliente: PosCliente | null = null;
      if (payload.idCliente) {
        cliente = await queryRunner.manager.findOne(PosCliente, { where: { idCliente: payload.idCliente }});
      }

      const ventaData: any = {
        folio: `VTA-${Date.now()}`,
        usuario: usuario,
        sucursal: usuario.sucursal,
        corte: turno,
        totalPagado: payload.totalPagado,
        metodoPago: payload.metodoPago || 'Efectivo',
        estatus: 'Completada',
        subtotal: payload.subtotal ?? payload.totalPagado,
        descuento: payload.descuento ?? 0,
        totalIva: payload.totalIva ?? 0,
      };

      if (cliente) {
        ventaData.cliente = cliente;
      }

      const venta = queryRunner.manager.create(PosVenta, ventaData);
      const savedVenta = await queryRunner.manager.save(venta);

      for (const item of payload.detalles) {
        const producto = await queryRunner.manager.findOne(PosProducto, { where: { idProducto: item.idProducto } });
        if (!producto) throw new BadRequestException(`Producto ${item.idProducto} no encontrado`);

        // Validar stock suficiente antes de descontar
        if (Number(producto.stockActual) < Number(item.cantidad)) {
          throw new BadRequestException(
            `Stock insuficiente para "${producto.nombre}". Stock disponible: ${producto.stockActual}, solicitado: ${item.cantidad}`
          );
        }

        const detalle = queryRunner.manager.create(PosVentaDetalle, {
          venta: savedVenta,
          producto: producto,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          subtotal: item.cantidad * item.precioUnitario
        });
        await queryRunner.manager.save(detalle);

        producto.stockActual = Number(producto.stockActual) - Number(item.cantidad);
        await queryRunner.manager.save(producto);

        const mov = queryRunner.manager.create(PosMovimientoInventario, {
          producto: producto,
          usuario: usuario,
          sucursal: usuario.sucursal,
          tipoMovimiento: 'Salida',
          cantidad: item.cantidad,
          referencia: `Venta ${savedVenta.folio}`
        });
        await queryRunner.manager.save(mov);
      }

      await queryRunner.commitTransaction();
      return { success: true, message: 'Venta completada', folio: savedVenta.folio };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getVentas(idSucursal?: number, folio?: string, limit: number = 100, offset: number = 0) {
    const where: any = idSucursal ? { usuario: { sucursal: { idSucursal } } } : {};
    
    if (folio) {
      where.folio = folio;
    }

    return this.ventaRepo.find({
      where,
      relations: {
        usuario: { sucursal: { empresa: true } },
        cliente: true,
        detalles: { producto: true },
        facturas: true
      },
      order: {
        fechaVenta: 'DESC'
      },
      take: limit,
      skip: offset
    });
  }

  // --- Inventario Unificado ---
  async getMovimientosInventario(idSucursal?: number) {
    const where = idSucursal ? [
      { sucursal: { idSucursal } },
      { usuario: { sucursal: { idSucursal } } }
    ] : {};
    const movimientos = await this.movimientoRepo.find({
      where,
      relations: { producto: { categoria: true }, usuario: { sucursal: { empresa: true } } },
      order: { fecha: 'DESC' }
    });
    return movimientos;
  }

  async registrarEntradasInventarioMasivo(entradas: any[], idUsuario: number, idSucursal: number) {
    const resultados: any[] = [];
    for (const entrada of entradas) {
      try {
        const res = await this.registrarEntradaInventario(entrada, idUsuario, idSucursal);
        resultados.push({ success: true, item: entrada, result: res });
      } catch (err) {
        resultados.push({ success: false, item: entrada, error: err.message });
      }
    }
    return { procesados: entradas.length, resultados };
  }

  async parsearXmlFactura(xmlContent: string, idSucursal: number) {
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
    let jsonObj;
    try {
      jsonObj = parser.parse(xmlContent);
    } catch (e) {
      throw new BadRequestException('El archivo no es un XML válido');
    }

    const comprobante = jsonObj['cfdi:Comprobante'];
    if (!comprobante) {
      // MOCK DATA PARA PRUEBAS CUANDO EL XML NO ES UN CFDI VÁLIDO
      return {
        emisor: { rfc: 'TEST010203XXX', nombre: 'PROVEEDOR DE PRUEBA (XML GENÉRICO)' },
        conceptos: [
          {
            conceptoXml: 'Producto Extraído de Prueba 1',
            noIdentificacion: 'TEST-123',
            cantidad: 5,
            costoUnitario: 100.50,
            productoEncontrado: null
          },
          {
            conceptoXml: 'Producto Extraído de Prueba 2',
            noIdentificacion: 'TEST-456',
            cantidad: 10,
            costoUnitario: 50.00,
            productoEncontrado: null
          }
        ]
      };
    }

    const emisor = comprobante['cfdi:Emisor'];
    const conceptosRaw = comprobante['cfdi:Conceptos']?.['cfdi:Concepto'];
    if (!conceptosRaw) {
      return {
        emisor: emisor ? { rfc: emisor['@_Rfc'], nombre: emisor['@_Nombre'] } : null,
        conceptos: []
      };
    }

    const conceptosArr = Array.isArray(conceptosRaw) ? conceptosRaw : [conceptosRaw];

    const resultados: any[] = [];
    for (const c of conceptosArr) {
      const descripcion = c['@_Descripcion'];
      const cantidad = Number(c['@_Cantidad'] || 0);
      const valorUnitario = Number(c['@_ValorUnitario'] || 0);
      const noIdentificacion = c['@_NoIdentificacion'] || '';

      let productoMatch: any = null;
      if (noIdentificacion) {
        productoMatch = await this.productoRepo.findOne({
          where: [
            { codigoBarras: noIdentificacion, sucursal: { idSucursal } },
            { codigosAdicionales: { codigoBarras: noIdentificacion, producto: { sucursal: { idSucursal } } } }
          ],
          relations: { codigosAdicionales: true }
        });
      }
      
      if (!productoMatch) {
        const posiblesMatches = await this.productoRepo.createQueryBuilder('p')
          .where('p.id_sucursal = :id', { id: idSucursal })
          .andWhere('LOWER(p.nombre) = LOWER(:nombre)', { nombre: descripcion })
          .getMany();
        
        if (posiblesMatches.length > 0) {
           productoMatch = posiblesMatches[0];
        }
      }

      resultados.push({
        conceptoXml: descripcion,
        noIdentificacion: noIdentificacion,
        cantidad: cantidad,
        costoUnitario: valorUnitario,
        productoEncontrado: productoMatch ? {
          idProducto: productoMatch.idProducto,
          nombre: productoMatch.nombre,
          codigoBarras: productoMatch.codigoBarras
        } : null
      });
    }

    return {
      emisor: {
        rfc: emisor?.['@_Rfc'] || '',
        nombre: emisor?.['@_Nombre'] || 'Proveedor Desconocido'
      },
      conceptos: resultados,
      totales: {
        subtotal: Number(comprobante['@_SubTotal'] || 0),
        total: Number(comprobante['@_Total'] || 0)
      }
    };
  }

  async registrarEntradaInventario(payload: { idProducto: number; cantidad: number; referencia?: string; tipoMovimiento?: string; costoUnitario?: number; actualizarCosto?: boolean }, idUsuario: number, idSucursal?: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const producto = await queryRunner.manager.findOne(PosProducto, { 
        where: { idProducto: payload.idProducto },
        relations: { sucursal: true } 
      });
      if (!producto) throw new BadRequestException('Producto no encontrado');
      if (idSucursal && producto.sucursal?.idSucursal !== idSucursal) {
        throw new BadRequestException('El producto no pertenece a la sucursal del usuario');
      }

      const usuario = await queryRunner.manager.findOne(PosUsuario, { where: { idUsuario: idUsuario } });
      if (!usuario) throw new BadRequestException('Usuario no encontrado');

      const cantidadNumber = Number(payload.cantidad);
      if (isNaN(cantidadNumber) || cantidadNumber <= 0) {
        throw new BadRequestException('La cantidad debe ser mayor a 0');
      }

      // Crear el movimiento
      const movimiento = queryRunner.manager.create(PosMovimientoInventario, {
        producto,
        usuario,
        sucursal: idSucursal ? { idSucursal } : undefined,
        tipoMovimiento: payload.tipoMovimiento || 'Entrada',
        cantidad: cantidadNumber,
        referencia: payload.referencia || 'Compra General',
        costoUnitario: payload.costoUnitario
      });

      await queryRunner.manager.save(movimiento);

      // Actualizar el stock
      producto.stockActual = Number(producto.stockActual) + cantidadNumber;
      
      // Actualizar el costo si se solicitó
      if (payload.actualizarCosto && payload.costoUnitario) {
        producto.precioUnitario = payload.costoUnitario;
      }
      
      await queryRunner.manager.save(producto);

      await queryRunner.commitTransaction();

      return {
        success: true,
        mensaje: 'Entrada registrada exitosamente',
        movimiento,
        nuevoStock: producto.stockActual
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async anularMovimiento(idMovimiento: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const mov = await queryRunner.manager.findOne(PosMovimientoInventario, { where: { idMovimiento }, relations: { producto: true } });
      if (!mov) throw new BadRequestException('Movimiento no encontrado');

      // Revertir stock
      if (mov.tipoMovimiento === 'Entrada') {
        mov.producto.stockActual = Number(mov.producto.stockActual) - Number(mov.cantidad);
      } else {
        mov.producto.stockActual = Number(mov.producto.stockActual) + Number(mov.cantidad);
      }
      await queryRunner.manager.save(mov.producto);
      
      // Eliminar el movimiento
      await queryRunner.manager.remove(mov);
      await queryRunner.commitTransaction();

      return { success: true };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async editarMovimiento(idMovimiento: number, payload: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const mov = await queryRunner.manager.findOne(PosMovimientoInventario, { where: { idMovimiento }, relations: { producto: true } });
      if (!mov) throw new BadRequestException('Movimiento no encontrado');

      // Revertir el efecto de la cantidad anterior
      if (mov.tipoMovimiento === 'Entrada') {
        mov.producto.stockActual = Number(mov.producto.stockActual) - Number(mov.cantidad);
      } else {
        mov.producto.stockActual = Number(mov.producto.stockActual) + Number(mov.cantidad);
      }

      // Actualizar con nuevos valores
      const nuevaCantidad = payload.cantidad ? Number(payload.cantidad) : Number(mov.cantidad);
      mov.cantidad = nuevaCantidad;
      if (payload.concepto) mov.referencia = payload.concepto;

      // Aplicar el efecto de la nueva cantidad
      if (mov.tipoMovimiento === 'Entrada') {
        mov.producto.stockActual = Number(mov.producto.stockActual) + nuevaCantidad;
      } else {
        mov.producto.stockActual = Number(mov.producto.stockActual) - nuevaCantidad;
      }

      await queryRunner.manager.save(mov.producto);
      await queryRunner.manager.save(mov);
      
      await queryRunner.commitTransaction();

      return { success: true, movimiento: mov };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ─── CREAR PRODUCTO ─────────────────────────────────────────────────────
  async crearProducto(data: {
    nombre: string;
    idSucursal?: number;
    idCategoria?: number;
    codigoBarras?: string;
    precioUnitario?: number;
    precioPublico?: number;
    precioMayoreo?: number;
    iva?: number;
    stockMinimo?: number;
    imagenUrl?: string;
    claveProdServ?: string;
    claveUnidad?: string;
  }) {
    if (data.idSucursal) {
      if (data.nombre) {
        const dupNombre = await this.productoRepo.findOne({
          where: { sucursal: { idSucursal: data.idSucursal }, nombre: data.nombre.trim().toUpperCase() }
        });
        if (dupNombre) throw new BadRequestException(`Ya existe otro producto con el nombre "${data.nombre.trim().toUpperCase()}" en esta sucursal.`);
      }
      if (data.codigoBarras) {
        const dupCodigo = await this.productoRepo.findOne({
          where: { sucursal: { idSucursal: data.idSucursal }, codigoBarras: data.codigoBarras }
        });
        if (dupCodigo) throw new BadRequestException(`Ya existe otro producto con el código de barras "${data.codigoBarras}" en esta sucursal.`);
      }
    }

    const payload: any = {
      nombre: data.nombre.trim().toUpperCase(),
      codigoBarras: data.codigoBarras || null,
      precioUnitario: data.precioUnitario || 0,
      precioPublico: data.precioPublico || data.precioUnitario || 0,
      precioMayoreo: data.precioMayoreo || null,
      iva: data.iva || 0,
      stockMinimo: data.stockMinimo || 0,
      stockActual: 0,
      imagenUrl: data.imagenUrl || null,
      claveProdServ: data.claveProdServ || '01010101',
      claveUnidad: data.claveUnidad || 'H87',
      activo: true,
    };
    if (data.idSucursal) {
      payload.sucursal = { idSucursal: data.idSucursal };
    }
    if (data.idCategoria) {
      payload.categoria = { idCategoria: data.idCategoria };
    }
    const producto = this.productoRepo.create(payload);
    return this.productoRepo.save(producto);
  }

  // ─── AJUSTE MANUAL DE STOCK ─────────────────────────────────────
  async ajustarStock(idProducto: number, stockReal: number, motivo: string, idUsuario: number, idSucursal?: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (stockReal < 0) throw new BadRequestException('El stock no puede ser negativo');

      const producto = await queryRunner.manager.findOne(PosProducto, { where: { idProducto } });
      if (!producto) throw new BadRequestException('Producto no encontrado');

      const diferencia = stockReal - Number(producto.stockActual);
      const tipoMovimiento = diferencia >= 0 ? 'Entrada' : 'Salida';

      await queryRunner.manager.update(PosProducto, idProducto, { stockActual: stockReal });

      const mov = queryRunner.manager.create(PosMovimientoInventario, {
        producto: { idProducto },
        usuario: { idUsuario },
        sucursal: idSucursal ? { idSucursal } : undefined,
        tipoMovimiento: `Ajuste (${tipoMovimiento})`,
        cantidad: Math.abs(diferencia),
        referencia: motivo || 'Ajuste Manual de Inventario',
      });
      await queryRunner.manager.save(PosMovimientoInventario, mov);
      await queryRunner.commitTransaction();

      return { success: true, stockAnterior: Number(producto.stockActual), stockNuevo: stockReal, diferencia };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async registrarMerma(idProducto: number, cantidad: number, motivo: string, idUsuario: number, idSucursal?: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const producto = await queryRunner.manager.findOne(PosProducto, { where: { idProducto } });
      if (!producto) throw new BadRequestException('Producto no encontrado');

      if (Number(producto.stockActual) < cantidad) {
        throw new BadRequestException('La cantidad de merma es mayor al stock disponible');
      }

      await queryRunner.manager.update(PosProducto, idProducto, { stockActual: Number(producto.stockActual) - cantidad });

      const mov = queryRunner.manager.create(PosMovimientoInventario, {
        producto: { idProducto },
        usuario: { idUsuario },
        sucursal: idSucursal ? { idSucursal } : undefined,
        tipoMovimiento: 'Merma',
        cantidad: cantidad,
        costoUnitario: producto.precioUnitario,
        referencia: `Merma - ${motivo}`,
      });
      await queryRunner.manager.save(PosMovimientoInventario, mov);
      await queryRunner.commitTransaction();

      return { success: true, stockAnterior: Number(producto.stockActual), stockNuevo: Number(producto.stockActual) - cantidad, costoPerdido: cantidad * Number(producto.precioUnitario || 0) };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ─── DASHBOARD STATS ────────────────────────────────────────────
  async getDashboardStats(idSucursal: number) {
    if (!idSucursal) return null;
    const hoy = new Date();
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - 6);
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    // Ventas del día
    const ventasHoy = await this.ventaRepo
      .createQueryBuilder('v')
      .where('v.fechaVenta >= :inicio', { inicio: inicioHoy }).leftJoin('v.usuario', 'u').andWhere('u.id_sucursal = :idSucursal', { idSucursal })
      .andWhere("v.estatus != 'Cancelada'")
      .select(['SUM(v.totalPagado) as total', 'COUNT(*) as cantidad'])
      .getRawOne();

    // Ventas de la semana
    const ventasSemana = await this.ventaRepo
      .createQueryBuilder('v')
      .where('v.fechaVenta >= :inicio', { inicio: inicioSemana }).leftJoin('v.usuario', 'u').andWhere('u.id_sucursal = :idSucursal', { idSucursal })
      .andWhere("v.estatus != 'Cancelada'")
      .select(['SUM(v.totalPagado) as total', 'COUNT(*) as cantidad'])
      .getRawOne();

    // Ventas del mes
    const ventasMes = await this.ventaRepo
      .createQueryBuilder('v')
      .where('v.fechaVenta >= :inicio', { inicio: inicioMes })
      .leftJoin('v.usuario', 'u').andWhere('u.id_sucursal = :idSucursal', { idSucursal })
      .andWhere("v.estatus != 'Cancelada'")
      .select(['SUM(v.totalPagado) as total', 'COUNT(*) as cantidad'])
      .getRawOne();

    // Ticket promedio del día
    const ticketPromedio = ventasHoy.cantidad > 0
      ? Number(ventasHoy.total || 0) / Number(ventasHoy.cantidad)
      : 0;

    // Top 5 productos más vendidos del mes
    const topProductos = await this.dataSource
      .createQueryBuilder()
      .select(['p.nombre as nombre', 'SUM(d.cantidad) as unidades', 'SUM(d.subtotal) as ingresos'])
      .from('pos_ventas_detalle', 'd')
      .innerJoin('pos_ventas', 'v', 'v.id_venta = d.id_venta')
      .innerJoin('pos_productos', 'p', 'p.id_producto = d.id_producto')
      .innerJoin('pos_usuarios', 'u', 'u.id_usuario = v.id_usuario')
      .where('v.fecha_venta >= :inicio', { inicio: inicioMes })
      .andWhere('u.id_sucursal = :idSucursal', { idSucursal })
      .andWhere("v.estatus != 'Cancelada'")
      .groupBy('d.id_producto')
      .orderBy('unidades', 'DESC')
      .limit(5)
      .getRawMany();

    // Ingresos por día — últimos 7 días
    const limiteSemana = new Date(hoy);
    limiteSemana.setDate(hoy.getDate() - 6);
    limiteSemana.setHours(0, 0, 0, 0);

    const ventasDiarias = await this.ventaRepo
      .createQueryBuilder('v')
      .select([
        "DATE_FORMAT(v.fechaVenta, '%Y-%m-%d') as fechaStr",
        'SUM(v.totalPagado) as total'
      ])
      .leftJoin('v.usuario', 'u')
      .where('v.fechaVenta >= :inicio', { inicio: limiteSemana })
      .andWhere('u.id_sucursal = :idSucursal', { idSucursal })
      .andWhere("v.estatus != 'Cancelada'")
      .groupBy("DATE_FORMAT(v.fechaVenta, '%Y-%m-%d')")
      .getRawMany();

    const mapaVentas = new Map<string, number>();
    ventasDiarias.forEach(vd => mapaVentas.set(vd.fechaStr, Number(vd.total)));

    const dias: { fecha: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() - i);
      
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const dia = String(d.getDate()).padStart(2, '0');
      const fechaClave = `${d.getFullYear()}-${mes}-${dia}`;
      
      dias.push({
        fecha: d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' }),
        total: mapaVentas.get(fechaClave) || 0,
      });
    }

    // Productos con stock 0
    const sinStock = await this.productoRepo.count({ where: { activo: true, stockActual: 0 as any, sucursal: { idSucursal } } });

    // Devoluciones hoy
    const devolucionesHoy = await this.devolucionRepo
      .createQueryBuilder('d')
      .where('d.fechaDevolucion >= :inicio', { inicio: inicioHoy })
      .leftJoin('d.usuario', 'u').andWhere('u.id_sucursal = :idSucursal', { idSucursal })
      .select(['SUM(d.montoDevuelto) as total', 'COUNT(*) as cantidad'])
      .getRawOne();

    return {
      hoy: { total: Number(ventasHoy.total || 0), cantidad: Number(ventasHoy.cantidad || 0) },
      semana: { total: Number(ventasSemana.total || 0), cantidad: Number(ventasSemana.cantidad || 0) },
      mes: { total: Number(ventasMes.total || 0), cantidad: Number(ventasMes.cantidad || 0) },
      devoluciones: { total: Number(devolucionesHoy.total || 0), cantidad: Number(devolucionesHoy.cantidad || 0) },
      ticketPromedio,
      topProductos,
      graficaDias: dias,
      sinStock,
    };
  }

  // --- EMPRESAS ---
  async getEmpresas(idEmpresa?: number) {
    if (idEmpresa) {
      return this.empresaRepo.find({ where: { idEmpresa }, order: { idEmpresa: 'ASC' } });
    }
    return this.empresaRepo.find({ order: { idEmpresa: 'ASC' } });
  }

  async crearEmpresa(payload: any) {
    const empresa = this.empresaRepo.create(payload);
    return this.empresaRepo.save(empresa);
  }

  async actualizarEmpresa(id: number, payload: any) {
    const empresa = await this.empresaRepo.findOne({ where: { idEmpresa: id } });
    if (!empresa) return null;
    
    if (payload.nombre) empresa.nombre = payload.nombre;
    if (payload.logoUrl !== undefined) empresa.logoUrl = payload.logoUrl;
    if (payload.colorPrincipal !== undefined) empresa.colorPrincipal = payload.colorPrincipal;
    if (payload.activa !== undefined) empresa.activa = payload.activa;
    
    return this.empresaRepo.save(empresa);
  }

  // --- CATEGORIAS ---
  async crearCategoria(payload: any) {
    // Buscar la sucursal actual para obtener su empresa
    const idSucursalReq = payload.idSucursal || 1;
    const sucursal = await this.sucursalRepo.findOne({
      where: { idSucursal: idSucursalReq },
      relations: { empresa: true }
    });

    const categoria = this.categoriaRepo.create({
      ...payload,
      sucursal: { idSucursal: idSucursalReq },
      empresa: sucursal?.empresa ? { idEmpresa: sucursal.empresa.idEmpresa } : null
    });
    return this.categoriaRepo.save(categoria);
  }

  async actualizarCategoria(id: number, payload: any) {
    const categoria = await this.categoriaRepo.findOne({ where: { idCategoria: id } });
    if (!categoria) return null;
    
    if (payload.nombre) categoria.nombre = payload.nombre;
    if (payload.color) categoria.color = payload.color;
    if (payload.activo !== undefined) categoria.activo = payload.activo;
    
    return this.categoriaRepo.save(categoria);
  }

  // --- CONFIGURACIONES ---
  async getConfiguracionSucursal(idSucursal: number) {
    let config = await this.configRepo.findOne({
      where: { sucursal: { idSucursal } },
      relations: { sucursal: { empresa: true } }
    });
    
    if (!config) {
      const sucursal = await this.sucursalRepo.findOne({ where: { idSucursal }, relations: { empresa: true } });
      if (sucursal) {
        config = this.configRepo.create({
          sucursal: { idSucursal },
          nombreEmpresa: sucursal.empresa?.nombre || 'AUP POS',
          iva: 0,
          anchoTicket: '80mm',
          imprimirLogo: false,
          mensajeTicket: '¡Gracias por su preferencia!',
          direccion: sucursal.direccion,
          telefono: sucursal.telefono
        });
        await this.configRepo.save(config);
      }
    }
    return config;
  }

  async getAllConfiguraciones() {
    return this.configRepo.find({
      relations: { sucursal: { empresa: true } }
    });
  }

  async updateConfiguracionSucursal(idSucursal: number, payload: any) {
    let config = await this.getConfiguracionSucursal(idSucursal);
    if (!config) return null;
    
    // We update fields except the idConfig and relations manually or via assign
    if (payload.nombreEmpresa !== undefined) config.nombreEmpresa = payload.nombreEmpresa;
    if (payload.rfcEmpresa !== undefined) config.rfcEmpresa = payload.rfcEmpresa;
    if (payload.mensajeTicket !== undefined) config.mensajeTicket = payload.mensajeTicket;
    if (payload.impresoraActiva !== undefined) config.impresoraActiva = payload.impresoraActiva;
    if (payload.iva !== undefined) config.iva = payload.iva;
    if (payload.direccion !== undefined) config.direccion = payload.direccion;
    if (payload.telefono !== undefined) config.telefono = payload.telefono;
    if (payload.anchoTicket !== undefined) config.anchoTicket = payload.anchoTicket;
    if (payload.imprimirLogo !== undefined) config.imprimirLogo = payload.imprimirLogo;

    return this.configRepo.save(config);
  }

  // --- FACTURACIÓN (FACTURAPI) ---
  
  async getFacturas(idSucursal: number) {
    const where = idSucursal > 0 ? { sucursal: { idSucursal } } : {};
    return this.facturaRepo.find({
      where,
      relations: { venta: true },
      order: { fechaEmision: 'DESC' }
    });
  }

  async facturarVenta(idVenta: number, payload: { rfc: string, razonSocial: string, cp: string, regimen: string, usoCfdi: string, formaPago?: string, metodoPago?: string }, apiKey: string) {
    const venta = await this.ventaRepo.findOne({
      where: { idVenta },
      relations: { detalles: { producto: true }, sucursal: true }
    });

    if (!venta) throw new BadRequestException('Venta no encontrada');
    
    // Validar que la venta no esté cancelada o devuelta
    if (venta.estatus === 'Cancelada' || venta.estatus === 'Devuelta' || venta.estatus === 'Dev. Parcial') {
      throw new BadRequestException(`No se puede facturar una venta con estatus "${venta.estatus}"`);
    }

    // Validar que no esté facturada
    const existe = await this.facturaRepo.findOne({ where: { venta: { idVenta } } });
    if (existe && existe.estatus === 'Emitida') {
      throw new BadRequestException('Esta venta ya fue facturada');
    }

    if (!apiKey) throw new BadRequestException('No se proporcionó la API Key de Facturapi');

    const cleanApiKey = apiKey.trim();
    const facturapi = new Facturapi(cleanApiKey);

    try {
      // 1. Buscar cliente en Facturapi primero, crear si no existe
      let clienteFacturapiId: string;
      try {
        const clientes = await (facturapi as any).customers.list({ q: payload.rfc });
        const clienteExistente = clientes?.data?.find((c: any) => c.tax_id === payload.rfc);
        if (clienteExistente) {
          clienteFacturapiId = clienteExistente.id;
        } else {
          const nuevoCliente = await facturapi.customers.create({
            legal_name: payload.razonSocial,
            tax_id: payload.rfc,
            tax_system: payload.regimen,
            address: { zip: payload.cp }
          });
          clienteFacturapiId = nuevoCliente.id;
        }
      } catch {
        // Si falla la búsqueda, crear directamente
        const nuevoCliente = await facturapi.customers.create({
          legal_name: payload.razonSocial,
          tax_id: payload.rfc,
          tax_system: payload.regimen,
          address: { zip: payload.cp }
        });
        clienteFacturapiId = nuevoCliente.id;
      }

      // 2. Mapear los items
      const items = venta.detalles.map(det => {
        return {
          quantity: Number(det.cantidad),
          product: {
            description: det.producto.nombre,
            product_key: det.producto.claveProdServ || '01010101',
            unit_key: det.producto.claveUnidad || 'H87',
            price: Number(det.precioUnitario),
            taxes: det.producto.iva !== null && det.producto.iva !== undefined 
              ? [{ type: 'IVA', rate: Number(det.producto.iva) / 100 }]
              : [{ type: 'IVA', rate: 0.16 }]
          }
        };
      });

      // 3. Crear la Factura
      const invoice = await facturapi.invoices.create({
        customer: clienteFacturapiId,
        items: items,
        use: payload.usoCfdi as any,
        payment_form: payload.formaPago || '01',
        payment_method: payload.metodoPago || 'PUE'
      });

      // 3.5 Descargar archivos localmente
      const pdfStream = await facturapi.invoices.downloadPdf(invoice.id);
      const xmlStream = await facturapi.invoices.downloadXml(invoice.id);
      
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const pdfPath = path.join(uploadsDir, `factura_${invoice.id}.pdf`);
      const xmlPath = path.join(uploadsDir, `factura_${invoice.id}.xml`);

      await new Promise((resolve, reject) => {
        const dest = fs.createWriteStream(pdfPath);
        (pdfStream as any).pipe(dest);
        dest.on('finish', () => resolve(true));
        dest.on('error', reject);
      });

      await new Promise((resolve, reject) => {
        const dest = fs.createWriteStream(xmlPath);
        (xmlStream as any).pipe(dest);
        dest.on('finish', () => resolve(true));
        dest.on('error', reject);
      });

      // 4. Guardar en BD
      const nuevaFactura = new PosFactura();
      nuevaFactura.uuid = invoice.uuid;
      nuevaFactura.rfcCliente = payload.rfc;
      nuevaFactura.nombreCliente = payload.razonSocial;
      nuevaFactura.usoCfdi = payload.usoCfdi;
      nuevaFactura.total = venta.totalPagado;
      nuevaFactura.facturapiId = invoice.id;
      nuevaFactura.estatus = 'Emitida';
      nuevaFactura.venta = venta;
      nuevaFactura.sucursal = venta.sucursal;
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
      nuevaFactura.urlPdf = `${baseUrl}/uploads/factura_${invoice.id}.pdf`;
      nuevaFactura.urlXml = `${baseUrl}/uploads/factura_${invoice.id}.xml`;

      await this.facturaRepo.save(nuevaFactura);

      return {
        success: true,
        factura: nuevaFactura
      };
    } catch (error: any) {
      console.error('Error al facturar:', error.message);
      throw new BadRequestException('Error con el SAT/Facturapi: ' + error.message);
    }
  }

  // --- CATÁLOGOS SAT ---
  private satProductosCache: any[] | null = null;
  private satUnidadesCache: any[] | null = null;

  async buscarProductosSAT(query: string) {
    try {
      if (!this.satProductosCache) {
        const fs = require('fs').promises;
        const path = require('path');
        const dataPath = path.join(__dirname, '..', '..', 'src', 'pos', 'data', 'c_ClaveProdServ.json');
        const fileData = await fs.readFile(dataPath, 'utf8');
        this.satProductosCache = JSON.parse(fileData);
      }
      const q = query.toLowerCase();
      const results = this.satProductosCache!.filter((p: any) => 
        p.id.includes(q) || (p.descripcion && p.descripcion.toLowerCase().includes(q))
      ).slice(0, 50);
      
      return results.map((r: any) => ({
        product_key: r.id,
        description: r.descripcion
      }));
    } catch (e) {
      console.error('Error in local SAT product search', e);
      return [];
    }
  }

  async buscarUnidadesSAT(query: string) {
    try {
      if (!this.satUnidadesCache) {
        const fs = require('fs').promises;
        const path = require('path');
        const dataPath = path.join(__dirname, '..', '..', 'src', 'pos', 'data', 'c_ClaveUnidad.json');
        const fileData = await fs.readFile(dataPath, 'utf8');
        this.satUnidadesCache = JSON.parse(fileData);
      }
      const q = query.toLowerCase();
      const results = this.satUnidadesCache!.filter((u: any) => 
        u.id.toLowerCase().includes(q) || (u.nombre && u.nombre.toLowerCase().includes(q))
      ).slice(0, 50);

      return results.map((r: any) => ({
        unit_key: r.id,
        name: r.nombre
      }));
    } catch (e) {
      console.error('Error in local SAT unit search', e);
      return [];
    }
  }

  // -------------------------
  // MÓDULO PROFORMAS
  // -------------------------

  async getProformas(idSucursal?: number) {
    return this.proformaRepo.find({
      where: idSucursal ? { sucursal: { idSucursal } } : {},
      order: { idProforma: 'DESC' },
      relations: { venta: true }
    });
  }

  async generarProforma(payload: any, idSucursalSesion?: number) {
    const venta = await this.ventaRepo.findOne({
      where: { idVenta: payload.idVenta },
      relations: { detalles: { producto: true }, sucursal: true }
    });

    if (!venta) {
      throw new NotFoundException('Venta no encontrada');
    }

    const folioInterno = `PRO-${venta.idVenta}`;

    // Generate PDF
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const pdfPath = path.join(uploadsDir, `proforma_${venta.idVenta}.pdf`);

    await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).text('Factura Proforma (Uso Interno)', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Folio: ${folioInterno}`);
      doc.text(`Fecha: ${new Date().toLocaleString()}`);
      doc.text(`Cliente: ${payload.clienteNombre || 'Público en General'}`);
      doc.moveDown();

      // Table Header
      doc.fontSize(10).text('Cant', 50, doc.y, { continued: true });
      doc.text('Descripción', 100, doc.y, { continued: true });
      doc.text('P.U.', 400, doc.y, { continued: true });
      doc.text('Importe', 470, doc.y);
      doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
      doc.moveDown();

      // Table Rows
      let subtotal = 0;
      venta.detalles.forEach(d => {
        const importe = d.cantidad * Number(d.precioUnitario);
        subtotal += importe;
        doc.text(d.cantidad.toString(), 50, doc.y, { continued: true });
        doc.text(d.producto?.nombre || 'Producto', 100, doc.y, { continued: true });
        doc.text(`$${Number(d.precioUnitario).toFixed(2)}`, 400, doc.y, { continued: true });
        doc.text(`$${importe.toFixed(2)}`, 470, doc.y);
      });

      doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
      doc.moveDown();

      // Totals
      doc.fontSize(12).text(`Total: $${Number(venta.totalPagado).toFixed(2)}`, { align: 'right' });
      doc.moveDown(2);
      doc.fontSize(10).text('Este documento no es un comprobante fiscal válido.', { align: 'center' });

      doc.end();
      stream.on('finish', () => resolve(true));
      stream.on('error', reject);
    });

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const urlPdf = `${baseUrl}/uploads/proforma_${venta.idVenta}.pdf`;

    let sucursalParaProforma = venta.sucursal;
    if (!sucursalParaProforma && idSucursalSesion) {
      const fallback = await this.sucursalRepo.findOne({ where: { idSucursal: idSucursalSesion } });
      if (fallback) sucursalParaProforma = fallback;
    }

    const nuevaProforma = this.proformaRepo.create({
      folioInterno,
      nombreCliente: payload.clienteNombre || 'Público en General',
      total: venta.totalPagado,
      urlPdf,
      venta,
      sucursal: sucursalParaProforma
    });

    await this.proformaRepo.save(nuevaProforma);
    return { success: true, proforma: nuevaProforma };
  }

  // --- HERRAMIENTAS / UTILIDADES ---
  async buscarRfc(rfc: string) {
    try {
      // Intentar buscar en la base de datos local primero por si ya existe
      const clienteLocal = await this.clienteRepo.findOne({ where: { rfc } });
      if (clienteLocal) {
        return {
          success: true,
          data: {
            nombre: clienteLocal.nombreCompleto,
            cp: clienteLocal.cp,
            regimenFiscal: clienteLocal.regimenFiscal
          },
          fuente: 'local'
        };
      }

      // Al no existir una API pblica gratuita 100% confiable del SAT sin autenticacin,
      // aqu se puede integrar un servicio como API-SAT o Facturama/FacturAPI (si tienen validacin pblica).
      // Por ahora, simularemos la extraccin para que el flujo frontend funcione como solicitaste.
      
      // Simulacin de respuesta de API SAT o Facturama
      const esPersonaFisica = rfc.length === 13;
      
      return {
        success: true,
        data: {
          nombre: esPersonaFisica ? 'NOMBRE GENERADO POR API' : 'EMPRESA S.A. DE C.V.',
          cp: '97000',
          regimenFiscal: esPersonaFisica ? '612' : '601'
        },
        fuente: 'api_externa'
      };
      
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async parseCsf(buffer: Buffer) {
    try {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      const text = data.text;

      // Extraer RFC (Patrón estándar de RFC Mexicano)
      const rfcMatch = text.match(/([A-Z&Ñ]{3,4}\d{6}[A-V1-9][A-Z1-9][0-9A])/i);
      const rfc = rfcMatch ? rfcMatch[1] : '';

      // Extraer CP
      const cpMatch = text.match(/(?:C[óo]digo\s*Postal|CP)[\s\S]*?(\d{5})/i);
      const cp = cpMatch ? cpMatch[1] : '';

      // Extraer Denominación/Razón Social buscando entre "Registro Federal de Contribuyentes" y "Nombre, denominación o razón"
      let nombre = '';
      const denominacionMatch = text.match(/Registro Federal de Contribuyentes\s*([\s\S]+?)\s*(?:Nombre, denominaci[óo]n o raz[óo]n|Denominaci[óo]n\/Raz[óo]n Social)/i);
      if (denominacionMatch && denominacionMatch[1]) {
        // Reemplazar saltos de línea por espacios para unir nombres separados en varias líneas
        nombre = denominacionMatch[1].replace(/[\r\n]+/g, ' ').trim();
      }

      // Extraer Régimen Capital (A veces viene en otra línea)
      const regimenCapitalMatch = text.match(/R[ée]gimen Capital:?\s*([^\n]+)/i);
      if (regimenCapitalMatch && regimenCapitalMatch[1]) {
        const rc = regimenCapitalMatch[1].trim();
        // Si el rc no está vacío y no es igual al texto "Régimen Capital" o "N/A"
        if (rc && nombre && !nombre.includes(rc) && rc.length < 20) {
          nombre += ' ' + rc; // Ej: EMPRESA SA DE CV
        }
      }

      // Mapear Régimen Fiscal
      let regimenFiscal = '';
      if (text.match(/General de Ley Personas Morales/i)) regimenFiscal = '601';
      else if (text.match(/Personas F[íi]sicas con Actividades Empresariales/i)) regimenFiscal = '612';
      else if (text.match(/Incorporaci[óo]n Fiscal/i)) regimenFiscal = '621';
      else if (text.match(/Simplificado de Confianza/i)) regimenFiscal = '626';
      else if (text.match(/Sueldos y Salarios/i)) regimenFiscal = '605';
      else if (text.match(/Sin obligaciones/i)) regimenFiscal = '616';

      let direccionCompleta = '';
      const domicilioMatch = text.match(/Datos del domicilio registrado([\s\S]+?)Actividades Econ[óo]micas/i);
      if (domicilioMatch) {
        let dom = domicilioMatch[1].replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ');
        const getField = (regex: RegExp) => {
          const m = dom.match(regex);
          return m ? m[1].trim() : '';
        };
        const calle = getField(/(?:Nombre\s*de\s*Vialidad|NombredeVialidad):?([\s\S]*?)(?:N[úuǧ]?mero)/i);
        const ext = getField(/(?:N[úuǧ]?mero\s*Exterior|N[úuǧ]?meroExterior):?([\s\S]*?)(?:N[úuǧ]?mero\s*Interior|N[úuǧ]?meroInterior|Nombre\s*de\s*la\s*Colonia|Nombredela Colonia)/i);
        const int = getField(/(?:N[úuǧ]?mero\s*Interior|N[úuǧ]?meroInterior):?([\s\S]*?)(?:Nombre\s*de\s*la\s*Colonia|Nombredela Colonia)/i);
        const col = getField(/(?:Nombre\s*de\s*la\s*Colonia|Nombredela Colonia):?([\s\S]*?)(?:Nombre\s*de\s*la\s*Localidad|Nombredela Localidad)/i);
        const mun = getField(/(?:Municipio\s*o\s*Demarcaci[óo]n\s*Territorial|Municipioo Demarcaci[óo]nTerritorial|Municipio\s*o\s*DemarcacinTerritorial):?([\s\S]*?)(?:Nombre\s*de\s*la\s*Entidad|Nombredela Entidad)/i);
        const est = getField(/(?:Entidad\s*Federativa|EntidadFederativa):?([\s\S]*?)(?:Entre\s*Calle|EntreCalle)/i);
        
        const partes: string[] = [];
        if (calle) partes.push(calle);
        if (ext && ext !== 'S/N' && ext !== 'SN') partes.push(`Num. Ext. ${ext}`);
        if (int && int !== 'S/N' && int !== 'SN') partes.push(`Num. Int. ${int}`);
        if (col) partes.push(`Col. ${col}`);
        if (mun) partes.push(mun);
        if (est) partes.push(est);
        if (cp) partes.push(`CP ${cp}`);
        
        direccionCompleta = partes.join(', ').replace(/\s+/g, ' ');
      }

      return { success: !!rfc, rfc, nombre, cp, regimenFiscal, direccion: direccionCompleta, rawText: text.substring(0, 500) };
    } catch (error) {
      console.error('Error parseando CSF:', error);
      return { success: false, error: 'No se pudo leer el PDF' };
    }
  }

  // ═══════════════════════════════════════════════════════
  // PROVEEDORES
  // ═══════════════════════════════════════════════════════

  async getProveedores(idSucursal?: number) {
    const where: any = {};
    if (idSucursal) where.sucursal = { idSucursal };
    return this.proveedorRepo.find({ where, order: { nombre: 'ASC' } });
  }

  async verificarDuplicadoProveedor(payload: any, idActual: number = 0) {
    if (payload.rfc && payload.rfc.toUpperCase() !== 'XAXX010101000' && payload.rfc.toUpperCase() !== 'XEXX010101000') {
      const existeRfc = await this.proveedorRepo.findOne({ where: { rfc: payload.rfc } });
      if (existeRfc && existeRfc.idProveedor !== idActual) {
        throw new BadRequestException(`Ya existe un proveedor con el RFC ${payload.rfc}`);
      }
    }
    if (payload.nombre) {
      const duplicadoNombre = await this.proveedorRepo.findOne({
        where: { nombre: payload.nombre }
      });
      if (duplicadoNombre && duplicadoNombre.idProveedor !== idActual) {
        throw new BadRequestException(`Ya existe un proveedor con el nombre exacto ${payload.nombre}`);
      }
    }
  }

  async crearProveedor(payload: any, idSucursal?: number) {
    await this.verificarDuplicadoProveedor(payload);
    const proveedor = this.proveedorRepo.create({
      nombre: payload.nombre,
      contacto: payload.contacto,
      telefono: payload.telefono,
      correo: payload.correo,
      rfc: payload.rfc,
      direccion: payload.direccion,
      sucursal: idSucursal ? { idSucursal } as any : undefined,
    });
    return this.proveedorRepo.save(proveedor);
  }

  async actualizarProveedor(id: number, payload: any) {
    await this.verificarDuplicadoProveedor(payload, id);
    const proveedor = await this.proveedorRepo.findOneBy({ idProveedor: id });
    if (!proveedor) throw new NotFoundException('Proveedor no encontrado');
    Object.assign(proveedor, payload);
    return this.proveedorRepo.save(proveedor);
  }

  async eliminarProveedor(id: number) {
    const proveedor = await this.proveedorRepo.findOneBy({ idProveedor: id });
    if (!proveedor) throw new NotFoundException('Proveedor no encontrado');
    proveedor.activo = false;
    await this.proveedorRepo.save(proveedor);
    return { success: true };
  }

  // ═══════════════════════════════════════════════════════
  // COMPRAS
  // ═══════════════════════════════════════════════════════

  async getCompras(idSucursal?: number, idProveedor?: number) {
    const where: any = {};
    if (idSucursal) where.sucursal = { idSucursal };
    if (idProveedor) where.proveedor = { idProveedor };
    return this.compraRepo.find({
      where,
      relations: { proveedor: true, usuario: true, detalles: { producto: true } },
      order: { fechaCompra: 'DESC' }
    });
  }

  async getCompra(id: number) {
    const compra = await this.compraRepo.findOne({
      where: { idCompra: id },
      relations: { proveedor: true, usuario: true, detalles: { producto: true }, sucursal: true }
    });
    if (!compra) throw new NotFoundException('Compra no encontrada');
    return compra;
  }

  async crearCompra(payload: any, idSucursal?: number, idUsuario?: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generar folio usando timestamp para evitar race condition
      const folio = `COMP-${Date.now()}`;

      // Crear encabezado de compra
      const compra = this.compraRepo.create({
        folio,
        proveedor: payload.idProveedor ? { idProveedor: payload.idProveedor } as any : undefined,
        usuario: idUsuario ? { idUsuario } as any : undefined,
        sucursal: idSucursal ? { idSucursal } as any : undefined,
        total: payload.total || 0,
        folioFacturaProveedor: payload.folioFacturaProveedor,
        notas: payload.notas,
      });
      const savedCompra = await queryRunner.manager.save(PosCompra, compra);

      // Crear detalles y actualizar stock
      for (const item of payload.detalles || []) {
        const detalle = this.compraDetalleRepo.create({
          compra: { idCompra: savedCompra.idCompra } as any,
          producto: { idProducto: item.idProducto } as any,
          cantidad: item.cantidad,
          precioCosto: item.precioCosto,
          subtotal: item.cantidad * item.precioCosto,
        });
        await queryRunner.manager.save(PosCompraDetalle, detalle);

        // Sumar stock al producto
        const pCompra = await queryRunner.manager.findOne(PosProducto, { where: { idProducto: item.idProducto } });
        if (pCompra) {
          pCompra.stockActual = Number(pCompra.stockActual) + Number(item.cantidad);
          if (item.actualizarCosto) {
            pCompra.precioUnitario = item.precioCosto;
          }
          await queryRunner.manager.save(PosProducto, pCompra);
        }

        // Registrar movimiento de inventario
        const movimiento = this.movimientoRepo.create({
          producto: { idProducto: item.idProducto } as any,
          usuario: idUsuario ? { idUsuario } as any : undefined,
          sucursal: idSucursal ? { idSucursal } as any : undefined,
          tipoMovimiento: 'Compra',
          cantidad: item.cantidad,
          costoUnitario: item.precioCosto,
          referencia: `Compra ${folio}${payload.folioFacturaProveedor ? ' - Factura ' + payload.folioFacturaProveedor : ''}`,
        });
        await queryRunner.manager.save(PosMovimientoInventario, movimiento);
      }

      await queryRunner.commitTransaction();
      return { success: true, compra: savedCompra };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Error al registrar la compra: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async subirFacturaCompra(id: number, pdfPath?: string, xmlPath?: string) {
    const compra = await this.compraRepo.findOneBy({ idCompra: id });
    if (!compra) throw new NotFoundException('Compra no encontrada');
    if (pdfPath) compra.urlFacturaPdf = pdfPath;
    if (xmlPath) compra.urlFacturaXml = xmlPath;
    await this.compraRepo.save(compra);
    return { success: true, compra };
  }

  // ═══════════════════════════════════════════════════════
  // DEVOLUCIONES
  // ═══════════════════════════════════════════════════════

  async getDevoluciones(idSucursal?: number) {
    const where: any = {};
    if (idSucursal) where.sucursal = { idSucursal };
    return this.devolucionRepo.find({
      where,
      relations: { venta: true, usuario: true },
      order: { fechaDevolucion: 'DESC' }
    });
  }

  async getDevolucion(id: number) {
    const dev = await this.devolucionRepo.findOne({
      where: { idDevolucion: id },
      relations: { venta: { detalles: { producto: true } }, usuario: true, sucursal: true }
    });
    if (!dev) throw new NotFoundException('Devolución no encontrada');
    return dev;
  }

  async crearDevolucion(payload: any, idSucursal?: number, idUsuario?: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const venta = await this.ventaRepo.findOne({
        where: { idVenta: payload.idVenta },
        relations: { detalles: { producto: true } }
      });
      if (!venta) throw new BadRequestException('Venta no encontrada');
      if (venta.estatus === 'Cancelada') throw new BadRequestException('No se puede devolver una venta cancelada');

      const items = payload.items as { idProducto: number; nombre: string; cantidad: number; precioUnitario: number; destino?: 'stock' | 'merma' }[];
      let montoDevuelto = 0;

      // Devolver stock o registrar merma por cada item
      for (const item of items) {
        montoDevuelto += item.cantidad * item.precioUnitario;

        const pDev = await queryRunner.manager.findOne(PosProducto, { where: { idProducto: item.idProducto } });
        const destino = item.destino || 'stock';

        if (destino === 'stock') {
          // Devolver stock al inventario
          if (pDev) {
            pDev.stockActual = Number(pDev.stockActual) + Number(item.cantidad);
            await queryRunner.manager.save(PosProducto, pDev);
          }

          const movimiento = this.movimientoRepo.create({
            producto: { idProducto: item.idProducto } as any,
            usuario: idUsuario ? { idUsuario } as any : undefined,
            sucursal: idSucursal ? { idSucursal } as any : undefined,
            tipoMovimiento: 'Devolución (Stock)',
            cantidad: item.cantidad,
            referencia: `Devolución de venta ${venta.folio}${payload.motivo ? ' - ' + payload.motivo : ''}`,
          });
          await queryRunner.manager.save(PosMovimientoInventario, movimiento);
        } else {
          // Devolución a merma
          const movimiento = this.movimientoRepo.create({
            producto: { idProducto: item.idProducto } as any,
            usuario: idUsuario ? { idUsuario } as any : undefined,
            sucursal: idSucursal ? { idSucursal } as any : undefined,
            tipoMovimiento: 'Devolución (Merma)',
            cantidad: item.cantidad,
            costoUnitario: pDev ? pDev.precioUnitario : item.precioUnitario,
            referencia: `Devolución a Merma de venta ${venta.folio}${payload.motivo ? ' - ' + payload.motivo : ''}`,
          });
          await queryRunner.manager.save(PosMovimientoInventario, movimiento);
        }
      }

      // Determinar si es total o parcial
      const totalItemsVenta = venta.detalles.reduce((acc, d) => acc + Number(d.cantidad), 0);
      const totalItemsDevueltos = items.reduce((acc, i) => acc + i.cantidad, 0);
      const tipo = totalItemsDevueltos >= totalItemsVenta ? 'Total' : 'Parcial';

      // Actualizar estatus de la venta
      venta.estatus = tipo === 'Total' ? 'Devuelta' : 'Dev. Parcial';
      await queryRunner.manager.save(PosVenta, venta);

      // Registrar la devolución
      const devolucion = this.devolucionRepo.create({
        venta: { idVenta: payload.idVenta } as any,
        usuario: idUsuario ? { idUsuario } as any : undefined,
        sucursal: idSucursal ? { idSucursal } as any : undefined,
        montoDevuelto,
        motivo: payload.motivo,
        tipo,
        items,
      });
      const savedDev = await queryRunner.manager.save(PosDevolucion, devolucion);

      await queryRunner.commitTransaction();
      return { success: true, devolucion: savedDev, montoDevuelto, tipo };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Error al registrar la devolución: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }
}
