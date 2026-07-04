import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not } from 'typeorm';

import { PosSucursal } from './entities/pos-sucursal.entity';
import { PosProducto } from './entities/pos-producto.entity';
import { PosCategoria } from './entities/pos-categoria.entity';
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

@Injectable()
export class PosService {
  constructor(
    @InjectRepository(PosSucursal) private sucursalRepo: Repository<PosSucursal>,
    @InjectRepository(PosProducto) private productoRepo: Repository<PosProducto>,
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
      const nuevoUsuario = this.usuarioRepo.create({
        sucursal: { idSucursal: saved.idSucursal },
        nombreUsuario: payload.usuario.nombreUsuario,
        nombreCompleto: payload.usuario.nombreCompleto || payload.usuario.nombreUsuario,
        contrasenaHash: payload.usuario.contrasena, // En un sistema real debería estar hasheada
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
    if (!user || user.contrasenaHash !== payload.password) {
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
      relations: { categoria: true, sucursal: { empresa: true } }
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
    stockMinimo?: number;
    imagenUrl?: string;
    claveProdServ?: string;
    claveUnidad?: string;
  }) {
    const updates: any = {};
    if (data.nombre !== undefined) updates.nombre = data.nombre;
    if (data.codigoBarras !== undefined) updates.codigoBarras = data.codigoBarras;
    if (data.precioUnitario !== undefined) updates.precioUnitario = data.precioUnitario;
    if (data.precioPublico !== undefined) updates.precioPublico = data.precioPublico;
    if (data.precioMayoreo !== undefined) updates.precioMayoreo = data.precioMayoreo;
    if (data.stockMinimo !== undefined) updates.stockMinimo = data.stockMinimo;
    if (data.imagenUrl !== undefined) updates.imagenUrl = data.imagenUrl;
    if (data.claveProdServ !== undefined) updates.claveProdServ = data.claveProdServ;
    if (data.claveUnidad !== undefined) updates.claveUnidad = data.claveUnidad;
    if (Object.keys(updates).length > 0) {
      await this.productoRepo.update(id, updates);
    }
    return this.productoRepo.findOne({ where: { idProducto: id }, relations: { categoria: true } });
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

    const result: any[] = [];
    for (const cat of categorias) {
      const totalProductos = await this.productoRepo.count({
        where: { categoria: { idCategoria: cat.idCategoria }, activo: true }
      });
      result.push({ ...cat, totalProductos });
    }

    return result;
  }

  async getClientes(idSucursal?: number) {
    const where = idSucursal ? { sucursal: { idSucursal } } : {};
    return this.clienteRepo.find({ where, relations: { sucursal: { empresa: true } } });
  }

  async crearCliente(payload: any) {
    const nuevo = this.clienteRepo.create({ ...payload, sucursal: { idSucursal: payload.idSucursal } });
    return this.clienteRepo.save(nuevo);
  }

  async actualizarCliente(id: number, payload: any) {
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
      contrasenaHash: payload.password, // Plain for now
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
    if (payload.password) usuario.contrasenaHash = payload.password;
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
        subtotal: payload.totalPagado,
      };

      if (cliente) {
        ventaData.cliente = cliente;
      }

      const venta = queryRunner.manager.create(PosVenta, ventaData);
      const savedVenta = await queryRunner.manager.save(venta);

      for (const item of payload.detalles) {
        const producto = await queryRunner.manager.findOne(PosProducto, { where: { idProducto: item.idProducto } });
        if (!producto) throw new BadRequestException(`Producto ${item.idProducto} no encontrado`);

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

  async getVentas(idSucursal?: number) {
    const where = idSucursal ? { usuario: { sucursal: { idSucursal } } } : {};
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
      }
    });
  }

  // --- Inventario Unificado ---
  async getMovimientosInventario(idSucursal?: number) {
    const where = idSucursal ? [
      { sucursal: { idSucursal } },
      { usuario: { sucursal: { idSucursal } } }
    ] : {};
    return this.movimientoRepo.find({
      where,
      relations: { producto: { categoria: true }, usuario: { sucursal: { empresa: true } } },
      order: { fecha: 'DESC' }
    });
  }

  async registrarEntradaInventario(payload: { idProducto: number; cantidad: number; referencia?: string; tipoMovimiento?: string; costoUnitario?: number; actualizarCosto?: boolean }, idUsuario: number, idSucursal?: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const producto = await queryRunner.manager.findOne(PosProducto, { where: { idProducto: payload.idProducto } });
      if (!producto) throw new BadRequestException('Producto no encontrado');

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
    stockMinimo?: number;
    imagenUrl?: string;
    claveProdServ?: string;
    claveUnidad?: string;
  }) {
    const payload: any = {
      nombre: data.nombre.trim().toUpperCase(),
      codigoBarras: data.codigoBarras || null,
      precioUnitario: data.precioUnitario || 0,
      precioPublico: data.precioPublico || data.precioUnitario || 0,
      precioMayoreo: data.precioMayoreo || null,
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
    const dias: { fecha: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() - i);
      const inicio = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const fin = new Date(inicio);
      fin.setDate(inicio.getDate() + 1);

      const res = await this.ventaRepo
        .createQueryBuilder('v')
        .where('v.fechaVenta >= :inicio AND v.fechaVenta < :fin', { inicio, fin })
        .leftJoin('v.usuario', 'u').andWhere('u.id_sucursal = :idSucursal', { idSucursal })
        .andWhere("v.estatus != 'Cancelada'")
        .select('SUM(v.totalPagado) as total')
        .getRawOne();

      dias.push({
        fecha: inicio.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' }),
        total: Number(res?.total || 0),
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
    
    // Validar que no esté facturada
    const existe = await this.facturaRepo.findOne({ where: { venta: { idVenta } } });
    if (existe && existe.estatus === 'Emitida') {
      throw new BadRequestException('Esta venta ya fue facturada');
    }

    if (!apiKey) throw new BadRequestException('No se proporcionó la API Key de Facturapi');

    const cleanApiKey = apiKey.trim();
    const facturapi = new Facturapi(cleanApiKey);

    try {
      // 1. Crear el cliente en Facturapi (o buscarlo)
      const clienteFacturapi = await facturapi.customers.create({
        legal_name: payload.razonSocial,
        tax_id: payload.rfc,
        tax_system: payload.regimen,
        address: {
          zip: payload.cp
        }
      });

      // 2. Mapear los items
      const items = venta.detalles.map(det => {
        return {
          quantity: Number(det.cantidad),
          product: {
            description: det.producto.nombre,
            product_key: det.producto.claveProdServ || '01010101',
            unit_key: det.producto.claveUnidad || 'H87',
            price: Number(det.precioUnitario),
            taxes: [
              {
                type: 'IVA',
                rate: 0.16
              }
            ]
          }
        };
      });

      // 3. Crear la Factura
      const invoice = await facturapi.invoices.create({
        customer: clienteFacturapi.id,
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
      nuevaFactura.urlPdf = `http://localhost:3000/uploads/factura_${invoice.id}.pdf`;
      nuevaFactura.urlXml = `http://localhost:3000/uploads/factura_${invoice.id}.xml`;

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
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.join(__dirname, '..', '..', 'src', 'pos', 'data', 'c_ClaveProdServ.json');
        const fileData = fs.readFileSync(dataPath, 'utf8');
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
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.join(__dirname, '..', '..', 'src', 'pos', 'data', 'c_ClaveUnidad.json');
        const fileData = fs.readFileSync(dataPath, 'utf8');
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

    const urlPdf = `http://localhost:3000/uploads/proforma_${venta.idVenta}.pdf`;

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

      require('fs').writeFileSync('debug_csf.txt', text);

      return { success: !!rfc, rfc, nombre, cp, regimenFiscal, rawText: text.substring(0, 500) };
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

  async crearProveedor(payload: any, idSucursal?: number) {
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

  async getCompras(idSucursal?: number) {
    const where: any = {};
    if (idSucursal) where.sucursal = { idSucursal };
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
      // Generar folio
      const count = await this.compraRepo.count();
      const folio = `COMP-${String(count + 1).padStart(5, '0')}`;

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
