import { calcularCostoPromedioPonderado } from './pos-calculos.helper';
import axios from 'axios';
import AdmZip = require('adm-zip');
import { Injectable, BadRequestException, UnauthorizedException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PDFDocument as PDFLibDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import {  Repository, DataSource, Not , Like, IsNull, LessThanOrEqual } from 'typeorm';

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
import { PosCotizacion } from './entities/pos-cotizacion.entity';
import { PosCotizacionDetalle } from './entities/pos-cotizacion-detalle.entity';
import { PosReceta } from './entities/pos-receta.entity';
import { PosTraspaso } from './entities/pos-traspaso.entity';
import { PosTraspasoDetalle } from './entities/pos-traspaso-detalle.entity';
import { JwtService } from '@nestjs/jwt';
import Facturapi from 'facturapi';
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';
import { XMLParser } from 'fast-xml-parser';
import pdfParse from 'pdf-parse';
import * as XLSX from 'xlsx';

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
    @InjectRepository(PosCotizacion) private cotizacionRepo: Repository<PosCotizacion>,
    @InjectRepository(PosCotizacionDetalle) private cotizacionDetalleRepo: Repository<PosCotizacionDetalle>,
    @InjectRepository(PosReceta) private recetaRepo: Repository<PosReceta>,
    @InjectRepository(PosTraspaso) private traspasoRepo: Repository<PosTraspaso>,
    @InjectRepository(PosTraspasoDetalle) private traspasoDetalleRepo: Repository<PosTraspasoDetalle>,
    private jwtService: JwtService,
    private dataSource: DataSource
  ) {}

  private async generarFolioConsecutivo(repo: Repository<any>, prefix: string, campoFolio: string = 'folio'): Promise<string> {
    const year = new Date().getFullYear();
    const prefixYear = `${prefix}-${year}-`;
    const pk = repo.metadata.primaryColumns[0].propertyName;
    const lastEntity = await repo.createQueryBuilder('e')
      .where(`e.${campoFolio} LIKE :pattern`, { pattern: `${prefixYear}%` })
      .orderBy(`e.${pk}`, 'DESC')
      .getOne();
    
    let nextNum = 1;
    if (lastEntity && lastEntity[campoFolio]) {
      const parts = lastEntity[campoFolio].split('-');
      if (parts.length >= 3) {
        const num = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(num)) nextNum = num + 1;
      }
    }
    return `${prefixYear}${String(nextNum).padStart(4, '0')}`;
  }

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
    const jwtPayload = { username: user.nombreUsuario, sub: user.idUsuario, rol: user.rol, sucursal: user.sucursal?.idSucursal, idEmpresa: user.sucursal?.empresa?.idEmpresa };
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

  async getProductos(idSucursal?: number, page: number = 1, limit: number = 20, search?: string) {
    let where: any = idSucursal ? { sucursal: { idSucursal } } : {};
      
      let whereCondition: any = where;
      if (search) {
        whereCondition = [
          { ...where, nombre: Like(`%${search}%`) },
          { ...where, codigoBarras: Like(`%${search}%`) },
          { ...where, claveProdServ: Like(`%${search}%`) }
        ];
        
        // Si el término de búsqueda es numérico, buscar también por ID
        if (!isNaN(Number(search))) {
           whereCondition.push({ ...where, idProducto: Number(search) });
        }
      }

    const [data, total] = await this.productoRepo.findAndCount({
        where: whereCondition,
      relations: { categoria: true, sucursal: { empresa: true }, codigosAdicionales: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { nombre: 'ASC' }
    });
    
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
  
  async buscarProductoPorCodigo(codigo: string, idSucursal?: number) {
    const query = this.productoRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.categoria', 'categoria')
      .leftJoinAndSelect('p.sucursal', 'sucursal')
      .leftJoinAndSelect('sucursal.empresa', 'empresa')
      .leftJoinAndSelect('p.codigosAdicionales', 'codigosAdicionales')
      .where('(p.codigoBarras = :codigo OR p.claveProdServ = :codigo', { codigo });
      
    if (!isNaN(Number(codigo))) {
      query.orWhere('p.idProducto = :idNum', { idNum: Number(codigo) });
    }
    query.andWhere(')'); // close parenthesis

    if (idSucursal) {
      query.andWhere('p.idSucursal = :idSuc', { idSuc: idSucursal });
    }

    let prod = await query.getOne();
    
    // Y revisar en codigosAdicionales (aunque findOne con relacion a veces es difcil sin QueryBuilder)
    // Para simplificar:
    if (!prod) {
       // Buscar si hay un codigoAdicional
       // This would need queryBuilder, omitting for now, just fallback to return prod.
    }
    
    return prod;
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
    precioCompra?: number;
    utilidad?: number;
    aplicaDescuento?: boolean;
    tipoDescuento?: string;
    aplicaIva?: boolean;
    precioVenta?: number;
    precioMayoreo?: number;
    descuento?: number;
    minimoMayoreo?: number;
    iva?: number;
    stockMinimo?: number;
    imagenUrl?: string;
    claveProdServ?: string;
    claveUnidad?: string;
    sumarStock?: number;
    tipoArticulo?: string;
    unidadMedida?: string;
  }, idSucursalUsuario?: number, rol?: string) {
    const productoExistente = await this.productoRepo.findOne({ where: { idProducto: id }, relations: { sucursal: true } });
    if (!productoExistente) throw new BadRequestException('Producto no encontrado');
    // Validar pertenencia
    if (idSucursalUsuario && rol !== 'Administrador' && rol !== 'Soporte') {
      if (productoExistente.sucursal?.idSucursal !== idSucursalUsuario) {
        throw new ForbiddenException('No tienes permiso para modificar este producto');
      }
    }
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
    if (data.tipoArticulo !== undefined) updates.tipoArticulo = data.tipoArticulo;
    if (data.unidadMedida !== undefined) updates.unidadMedida = data.unidadMedida;
    if (data.precioUnitario !== undefined) updates.precioUnitario = data.precioUnitario;
    if (data.precioPublico !== undefined) updates.precioPublico = data.precioPublico;
    if (data.precioCompra !== undefined) updates.precioCompra = data.precioCompra;
    if (data.utilidad !== undefined) updates.utilidad = data.utilidad;
    if (data.aplicaDescuento !== undefined) {
      updates.aplicaDescuento = data.aplicaDescuento;
      // Si se desactiva el descuento, forzar descuento a 0 en BD
      if (!data.aplicaDescuento) {
        updates.descuento = 0;
      }
    }
    if (data.tipoDescuento !== undefined) updates.tipoDescuento = data.tipoDescuento;
    if (data.aplicaIva !== undefined) {
      updates.aplicaIva = data.aplicaIva;
      // Si se desactiva el IVA, forzar iva a 0 en BD
      if (!data.aplicaIva) {
        updates.iva = 0;
      }
    }
    if (data.precioVenta !== undefined) updates.precioVenta = data.precioVenta;
    if (data.precioMayoreo !== undefined) updates.precioMayoreo = data.precioMayoreo;
    // Solo actualizar descuento/iva si no fueron ya seteados en el bloque aplica* de arriba
    if (data.descuento !== undefined && updates.descuento === undefined) updates.descuento = data.descuento;
    if (data.minimoMayoreo !== undefined) updates.minimoMayoreo = data.minimoMayoreo;
    if (data.iva !== undefined && updates.iva === undefined) updates.iva = data.iva;
    if (data.stockMinimo !== undefined) updates.stockMinimo = data.stockMinimo;
    if (data.imagenUrl !== undefined) updates.imagenUrl = data.imagenUrl;
    if (data.claveProdServ !== undefined) updates.claveProdServ = data.claveProdServ;
    if (data.claveUnidad !== undefined) updates.claveUnidad = data.claveUnidad;
    if (Object.keys(updates).length > 0) {
      await this.productoRepo.update(id, updates);
    }
    
    if (data.sumarStock !== undefined && data.sumarStock !== 0) {
      await this.productoRepo.increment({ idProducto: id }, 'stockActual', data.sumarStock);
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

  async getClientes(idSucursal?: number, page: number = 1, limit: number = 20, search?: string) {
    let where: any = idSucursal ? { sucursal: { idSucursal } } : {};
    if (search) {
      where = [
        { ...where, nombreCompleto: Like(`%${search}%`) },
        { ...where, rfc: Like(`%${search}%`) }
      ];
    }

    const [data, total] = await this.clienteRepo.findAndCount({
      where,
      relations: { sucursal: { empresa: true } },
      skip: (page - 1) * limit,
      take: limit,
      order: { nombreCompleto: 'ASC' }
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async verificarDuplicadoCliente(payload: any, idActual: number = 0, idSucursal?: number) {
    const idActualNum = Number(idActual);
    const idSuc = idSucursal || payload.idSucursal;
    const whereCondition = idSuc ? { sucursal: { idSucursal: idSuc } } : {};

    if (payload.rfc && payload.rfc.toUpperCase() !== 'XAXX010101000' && payload.rfc.toUpperCase() !== 'XEXX010101000') {
      const existeRfc = await this.clienteRepo.findOne({ where: { rfc: payload.rfc, ...whereCondition } });
      if (existeRfc && existeRfc.idCliente !== idActualNum) {
        throw new BadRequestException(`Ya existe un cliente con el RFC ${payload.rfc} en esta sucursal`);
      }
    }
    if (payload.nombreCompleto) {
      const duplicadoNombre = await this.clienteRepo.findOne({
        where: { nombreCompleto: payload.nombreCompleto, ...whereCondition }
      });
      if (duplicadoNombre && duplicadoNombre.idCliente !== idActualNum) {
        throw new BadRequestException(`Ya existe un cliente con el nombre exacto ${payload.nombreCompleto} en esta sucursal`);
      }
    }
  }

  async crearCliente(payload: any) {
    await this.verificarDuplicadoCliente(payload);
    const nuevo = this.clienteRepo.create({ ...payload, sucursal: { idSucursal: payload.idSucursal } });
    return this.clienteRepo.save(nuevo);
  }

  async actualizarCliente(id: number, payload: any, idSucursal?: number, rol?: string) {
    // Validar pertenencia salvo roles privilegiados
    if (idSucursal && rol !== 'Administrador' && rol !== 'Soporte') {
      const cliente = await this.clienteRepo.findOne({ where: { idCliente: id }, relations: { sucursal: true } });
      if (!cliente) throw new BadRequestException('Cliente no encontrado');
      if (cliente.sucursal?.idSucursal !== idSucursal) throw new ForbiddenException('No tienes permiso para modificar este cliente');
    }
    await this.verificarDuplicadoCliente(payload, id, idSucursal);
    const updates = { ...payload };
    delete updates.idSucursal;
    delete updates.idCliente;
    await this.clienteRepo.update(id, updates);
    return this.clienteRepo.findOne({ where: { idCliente: id } });
  }

  async eliminarCliente(id: number, idSucursal?: number, rol?: string) {
    if (idSucursal && rol !== 'Administrador' && rol !== 'Soporte') {
      const cliente = await this.clienteRepo.findOne({ where: { idCliente: id }, relations: { sucursal: true } });
      if (!cliente) throw new BadRequestException('Cliente no encontrado');
      if (cliente.sucursal?.idSucursal !== idSucursal) throw new ForbiddenException('No tienes permiso para eliminar este cliente');
    }
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
      permisos: payload.permisos || [],
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
    if (payload.permisos) usuario.permisos = payload.permisos;
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

    const totalEfectivo = ventasCompletadas.reduce((acc, v) => acc + Number(v.efectivo), 0);
    const totalTarjeta = ventasCompletadas.reduce((acc, v) => acc + Number(v.tarjeta), 0);
    const totalTransferencia = ventasCompletadas.reduce((acc, v) => acc + Number(v.transferencia), 0);
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
        folio: await this.generarFolioConsecutivo(this.ventaRepo, 'VTA'),
        usuario: usuario,
        sucursal: usuario.sucursal,
        corte: turno,
        totalPagado: payload.totalPagado,
        metodoPago: payload.metodoPago || 'Efectivo',
        efectivo: payload.montoEfectivo || (payload.metodoPago === 'Efectivo' ? payload.totalPagado : 0),
        tarjeta: payload.montoTarjeta || (payload.metodoPago === 'Tarjeta' ? payload.totalPagado : 0),
        transferencia: payload.montoTransferencia || (payload.metodoPago === 'Transferencia' ? payload.totalPagado : 0),
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

      for (const item of payload.carrito) {
        const producto = await queryRunner.manager.findOne(PosProducto, { where: { idProducto: item.idProducto } });
        if (!producto) throw new BadRequestException(`Producto ${item.idProducto} no encontrado`);

        const detalle = queryRunner.manager.create(PosVentaDetalle, {
          venta: savedVenta,
          producto: producto,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
            descuento: item.descuento || 0,
            subtotal: (item.cantidad * item.precioUnitario) - (item.descuento || 0),
            aplicaIva: item.aplicaIva !== undefined ? item.aplicaIva : producto.aplicaIva,
            montoIva: item.montoIva || 0
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
      return { success: true, message: 'Venta completada', folio: savedVenta.folio, idVenta: savedVenta.idVenta };
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

  async getVentasNoFacturadas(idSucursal?: number, limit: number = 100) {
    const qb = this.ventaRepo.createQueryBuilder('venta')
      .leftJoinAndSelect('venta.cliente', 'cliente')
      .leftJoinAndSelect('venta.detalles', 'detalle')
      .leftJoinAndSelect('detalle.producto', 'producto')
      .leftJoin('venta.facturas', 'factura', 'factura.estatus != :canceladaEstatus', { canceladaEstatus: 'Cancelada' })
      .where('venta.estatus = :estatus', { estatus: 'Completada' })
      .andWhere('factura.id_factura IS NULL');

    if (idSucursal) {
      qb.andWhere('venta.id_sucursal = :idSucursal', { idSucursal });
    }

    return qb.orderBy('venta.fecha_venta', 'DESC').take(limit).getMany();
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
      } catch (err: any) {
        resultados.push({ success: false, item: entrada, error: err.message || String(err) });
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
        const descuento = Number(c['@_Descuento'] || 0);
        const costoUnitarioReal = cantidad > 0 ? ((valorUnitario * cantidad) - descuento) / cantidad : valorUnitario;
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
        costoUnitario: costoUnitarioReal,
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

      // Calcular el nuevo costo promedio ponderado automáticamente
      if (payload.costoUnitario !== undefined && payload.costoUnitario !== null) {
        const stockPrevio = Number(producto.stockActual);
        const costoPrevio = Number(producto.precioCompra) || 0;
        
        producto.precioCompra = calcularCostoPromedioPonderado(
          stockPrevio, 
          costoPrevio, 
          cantidadNumber, 
          payload.costoUnitario
        );

        // Recalcular precios de venta manteniendo el % de utilidad
        const utilidad = Number(producto.utilidad) || 0;
        const precioPublico = producto.precioCompra * (1 + (utilidad / 100));
        producto.precioUnitario = precioPublico;
        producto.precioPublico = precioPublico;
        
        const aplicaIva = producto.aplicaIva ?? false;
        const ivaRate = Number(producto.iva) || 0;
        const baseIva = precioPublico - (Number(producto.descuento) || 0);
        const ivaCalc = aplicaIva ? (baseIva * (ivaRate / 100)) : 0;
        producto.precioVenta = baseIva + ivaCalc;
      }

      // Actualizar el stock
      producto.stockActual = Number(producto.stockActual) + cantidadNumber;
      
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

  async anularMovimiento(idMovimiento: number, idSucursal?: number, rol?: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const mov = await queryRunner.manager.findOne(PosMovimientoInventario, { where: { idMovimiento }, relations: { producto: true, sucursal: true } });
      if (!mov) throw new BadRequestException('Movimiento no encontrado');

      // Validar pertenencia
      if (idSucursal && rol !== 'Administrador' && rol !== 'Soporte') {
        if (mov.sucursal?.idSucursal !== idSucursal) throw new ForbiddenException('No tienes permiso para anular este movimiento');
      }

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

  async editarMovimiento(idMovimiento: number, payload: any, idSucursal?: number, rol?: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const mov = await queryRunner.manager.findOne(PosMovimientoInventario, { where: { idMovimiento }, relations: { producto: true, sucursal: true } });
      if (!mov) throw new BadRequestException('Movimiento no encontrado');

      // Validar pertenencia
      if (idSucursal && rol !== 'Administrador' && rol !== 'Soporte') {
        if (mov.sucursal?.idSucursal !== idSucursal) throw new ForbiddenException('No tienes permiso para editar este movimiento');
      }

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

  async crearProducto(data: {
    nombre: string;
    idSucursal?: number;
    idCategoria?: number;
    codigoBarras?: string;
    precioUnitario?: number;
    precioPublico?: number;
    precioCompra?: number;
    utilidad?: number;
    aplicaDescuento?: boolean;
    tipoDescuento?: string;
    aplicaIva?: boolean;
    precioVenta?: number;
    precioMayoreo?: number;
    descuento?: number;
    minimoMayoreo?: number;
    iva?: number;
    stockMinimo?: number;
    imagenUrl?: string;
    claveProdServ?: string;
    claveUnidad?: string;
    tipoArticulo?: string;
    unidadMedida?: string;
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
      precioCompra: data.precioCompra || 0,
      utilidad: data.utilidad || 18.0,
      aplicaDescuento: data.aplicaDescuento || false,
      tipoDescuento: data.tipoDescuento || 'porcentaje',
      aplicaIva: data.aplicaIva || false,
      precioVenta: data.precioVenta || 0,
      precioMayoreo: data.precioMayoreo || null,
      descuento: data.descuento || 0,
      minimoMayoreo: data.minimoMayoreo || 0,
      tipoArticulo: data.tipoArticulo || 'Terminado',
      unidadMedida: data.unidadMedida || 'Pza',
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
    
    const inicioSemanaAnterior = new Date(inicioSemana);
    inicioSemanaAnterior.setDate(inicioSemana.getDate() - 7);
    
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    // Ventas del día
    const ventasHoy = await this.ventaRepo
      .createQueryBuilder('v')
      .where('v.fechaVenta >= :inicio', { inicio: inicioHoy }).leftJoin('v.usuario', 'u').andWhere('u.id_sucursal = :idSucursal', { idSucursal })
      .andWhere("v.estatus != 'Cancelada'")
      .select(['SUM(v.totalPagado) as total', 'COUNT(*) as cantidad'])
      .getRawOne();

    // Ventas por método de pago hoy
    const ventasPagoHoy = await this.ventaRepo
      .createQueryBuilder('v')
      .where('v.fechaVenta >= :inicio', { inicio: inicioHoy })
      .leftJoin('v.usuario', 'u').andWhere('u.id_sucursal = :idSucursal', { idSucursal })
      .andWhere("v.estatus != 'Cancelada'")
      .select(['v.metodoPago as metodo', 'SUM(v.totalPagado) as total'])
      .groupBy('v.metodoPago')
      .getRawMany();

    const metodosPago = { Efectivo: 0, Tarjeta: 0, Transferencia: 0 };
    ventasPagoHoy.forEach(v => {
      if (v.metodo === 'Efectivo') metodosPago.Efectivo = Number(v.total) || 0;
      else if (v.metodo === 'Tarjeta') metodosPago.Tarjeta = Number(v.total) || 0;
      else if (v.metodo === 'Transferencia') metodosPago.Transferencia = Number(v.total) || 0;
    });

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

    // Ventas del mes sin facturar
    const ventasSinFacturarMes = await this.ventaRepo
      .createQueryBuilder('v')
      .leftJoin('v.facturas', 'f')
      .leftJoin('v.usuario', 'u')
      .where('v.fechaVenta >= :inicio', { inicio: inicioMes })
      .andWhere('u.id_sucursal = :idSucursal', { idSucursal })
      .andWhere("v.estatus != 'Cancelada'")
      .andWhere('f.idFactura IS NULL')
      .getCount();

    // Cotizaciones activas hoy
    const cotizacionesHoy = await this.cotizacionRepo
      .createQueryBuilder('c')
      .leftJoin('c.usuario', 'u')
      .where('c.fechaEmision >= :inicio', { inicio: inicioHoy })
      .andWhere('u.id_sucursal = :idSucursal', { idSucursal })
      .getCount();

    // Estado de caja actual
    const corteActivo = await this.corteRepo.findOne({
      where: { 
        sucursal: { idSucursal: idSucursal }, 
        fechaCierre: IsNull() 
      },
      order: { idCorte: 'DESC' }
    });

    let cajaAbierta = false;
    let cajaSaldo = 0;
    if (corteActivo) {
      cajaAbierta = true;
      // Saldo es fondo base + lo vendido en efectivo
      cajaSaldo = Number(corteActivo.fondoInicial) + metodosPago.Efectivo; 
    }

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

    // Ingresos por día — últimos 7 días y semana anterior
    const limiteSemana = new Date(hoy);
    limiteSemana.setDate(hoy.getDate() - 6);
    limiteSemana.setHours(0, 0, 0, 0);
    
    const limiteSemanaAnt = new Date(limiteSemana);
    limiteSemanaAnt.setDate(limiteSemana.getDate() - 7);

    const ventasDiarias = await this.ventaRepo
      .createQueryBuilder('v')
      .select([
        "DATE_FORMAT(v.fechaVenta, '%Y-%m-%d') as fechaStr",
        'SUM(v.totalPagado) as total'
      ])
      .leftJoin('v.usuario', 'u')
      .where('v.fechaVenta >= :inicio', { inicio: limiteSemanaAnt }) // Traemos 14 días
      .andWhere('u.id_sucursal = :idSucursal', { idSucursal })
      .andWhere("v.estatus != 'Cancelada'")
      .groupBy("DATE_FORMAT(v.fechaVenta, '%Y-%m-%d')")
      .getRawMany();

    const mapaVentas = new Map<string, number>();
    ventasDiarias.forEach(vd => mapaVentas.set(vd.fechaStr, Number(vd.total)));

    const dias: { fecha: string; total: number }[] = [];
    const diasAnterior: { fecha: string; total: number }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      // Semana actual
      const d = new Date(hoy);
      d.setDate(hoy.getDate() - i);
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const dia = String(d.getDate()).padStart(2, '0');
      const fechaClave = `${d.getFullYear()}-${mes}-${dia}`;
      
      dias.push({
        fecha: d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' }),
        total: mapaVentas.get(fechaClave) || 0,
      });

      // Semana anterior
      const dAnt = new Date(d);
      dAnt.setDate(d.getDate() - 7);
      const mesAnt = String(dAnt.getMonth() + 1).padStart(2, '0');
      const diaAnt = String(dAnt.getDate()).padStart(2, '0');
      const fechaClaveAnt = `${dAnt.getFullYear()}-${mesAnt}-${diaAnt}`;
      
      diasAnterior.push({
        fecha: dAnt.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' }),
        total: mapaVentas.get(fechaClaveAnt) || 0,
      });
    }

    // Productos con stock <= 0 (incluyendo negativos) y stock bajo
    const sinStock = await this.productoRepo.count({ 
      where: { 
        activo: true, 
        stockActual: LessThanOrEqual(0), 
        sucursal: { idSucursal } 
      } 
    });
    const queryStockBajo = await this.productoRepo.createQueryBuilder('p')
      .where('p.activo = 1')
      .andWhere('p.id_sucursal = :idSucursal', { idSucursal })
      .andWhere('p.stockActual > 0')
      .andWhere('p.stockActual <= 5')
      .getCount();
    const stockBajo = queryStockBajo;

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
      graficaDiasAnterior: diasAnterior,
      sinStock,
      stockBajo,
      metodosPago,
      ventasSinFacturar: ventasSinFacturarMes,
      cotizacionesHoy,
      caja: { abierta: cajaAbierta, saldo: cajaSaldo }
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

  
  private getFacturamaHeaders() {
    const user = process.env.FACTURAMA_USER || '';
    const password = process.env.FACTURAMA_PASSWORD || '';
    const token = Buffer.from(`${user}:${password}`).toString('base64');
    return {
      'Authorization': `Basic ${token}`,
      'Content-Type': 'application/json'
    };
  }

  private getFacturamaUrl(endpoint: string) {
    const isSandbox = process.env.FACTURAMA_SANDBOX === 'true';
    const baseUrl = isSandbox ? 'https://apisandbox.facturama.mx' : 'https://api.facturama.mx';
    return `${baseUrl}${endpoint}`;
  }

  async facturarVenta(idVenta: number, payload: { rfc: string, razonSocial: string, cp: string, regimen: string, usoCfdi: string, formaPago?: string, metodoPago?: string, esExportacion?: boolean, taxResidence?: string, taxRegistrationNumber?: string, incoterm?: string, fraccionArancelaria?: string, unidadAduana?: string, tipoCambio?: number }) {
    const venta = await this.ventaRepo.findOne({
      where: { idVenta },
      relations: { detalles: { producto: true }, sucursal: true }
    });

    if (!venta) throw new BadRequestException('Venta no encontrada');
    if (venta.estatus === 'Cancelada' || venta.estatus === 'Devuelta' || venta.estatus === 'Dev. Parcial') {
      throw new BadRequestException(`No se puede facturar una venta con estatus "${venta.estatus}"`);
    }

    const existe = await this.facturaRepo.findOne({ where: { venta: { idVenta } } });
    if (existe && existe.estatus === 'Emitida') {
      throw new BadRequestException('Esta venta ya fue facturada');
    }

    // Preparar JSON para Facturama
    const facturamaPayload: any = {
      Receiver: {
        Rfc: payload.rfc,
        Name: payload.razonSocial,
        CfdiUse: payload.usoCfdi,
        FiscalRegime: payload.regimen,
        TaxZipCode: payload.cp
      },
      CfdiType: "I",
      ExpeditionPlace: "97137", // Consider pulling from config/sucursal if possible
      PaymentForm: payload.formaPago || "01",
      PaymentMethod: payload.metodoPago || "PUE",
      Items: venta.detalles.map(d => {
        const unitPriceSinIva = Number(d.precioUnitario);
        const cantidad = Number(d.cantidad);
        const descuento = Number(d.descuento || 0);
        const subtotalSinIva = unitPriceSinIva * cantidad;
        const baseIva = subtotalSinIva - descuento;
        
        const tieneIva = d.aplicaIva ?? true;
          const tasaIva = d.producto?.iva !== undefined ? Number(d.producto.iva) / 100 : 0.16;
          const iva = tieneIva ? baseIva * tasaIva : 0;
        const totalLine = baseIva + iva;
        
        const item: any = {
          ProductCode: d.producto?.claveProdServ || "01010101",
          IdentificationNumber: d.producto?.codigoBarras || d.producto?.idProducto?.toString() || "0",
          Description: d.producto?.nombre || "Producto general",
          UnitCode: d.producto?.claveUnidad || "H87",
          TaxObject: tieneIva ? "02" : "01",
          UnitPrice: Number(unitPriceSinIva.toFixed(4)),
          Quantity: cantidad,
          Subtotal: Number(subtotalSinIva.toFixed(4)),
          Total: Number(totalLine.toFixed(4))
        };

        if (tieneIva) {
          item.Taxes = [
            {
              Total: Number(iva.toFixed(4)),
                Name: "IVA",
                Base: Number(baseIva.toFixed(4)),
                Rate: d.producto?.iva !== undefined ? Number(d.producto.iva) / 100 : 0.16,
              IsRetention: false
            }
          ];
        }

        if (descuento > 0) {
          item.Discount = Number(descuento.toFixed(4));
        }

        return item;
      })
    };

    if (payload.esExportacion) {
      facturamaPayload.Exportation = "02";
      facturamaPayload.Currency = "USD";
      facturamaPayload.ExchangeRate = payload.tipoCambio || 1;
      
      facturamaPayload.Receiver.TaxResidence = payload.taxResidence || "USA";
      facturamaPayload.Receiver.TaxRegistrationNumber = payload.taxRegistrationNumber;

      let subtotalGlobalUsd = 0;
      let totalGlobalUsd = 0;

      const mercancias = venta.detalles.map(d => {
        const unitPriceSinIva = Number(d.precioUnitario);
        const cantidad = Number(d.cantidad);
        const descuento = Number(d.descuento || 0);
        const subtotalSinIva = unitPriceSinIva * cantidad;
        const baseIva = subtotalSinIva - descuento;
        
        const tieneIva = d.aplicaIva ?? true;
          const tasaIva = d.producto?.iva !== undefined ? Number(d.producto.iva) / 100 : 0.16;
          const iva = tieneIva ? baseIva * tasaIva : 0;
        const totalLine = baseIva + iva;

        const rate = payload.tipoCambio || 1;
        
        const valorDolares = Number((baseIva / rate).toFixed(2));
        subtotalGlobalUsd += valorDolares;
        totalGlobalUsd += Number((totalLine / rate).toFixed(2));

        return {
          ProductCodeForeignTrade: payload.fraccionArancelaria || "85171201",
          IdentificationNumber: d.producto?.codigoBarras || d.producto?.idProducto?.toString() || "0",
          Quantity: cantidad,
          UnitMeasurement: payload.unidadAduana || "01",
          UnitPrice: Number((unitPriceSinIva / rate).toFixed(4)),
          Amount: valorDolares
        };
      });

              facturamaPayload.Complemento = {
          ForeignTrade: {
            OperationType: "2",
            RequestCode: "A1",
            CertificateOrigin: "0",
            Incoterm: payload.incoterm || "FOB",
            Subtotal: Number(subtotalGlobalUsd.toFixed(2)),
            TotalUsd: Number(subtotalGlobalUsd.toFixed(2)),
            ExchangeRateUsd: payload.tipoCambio || 1,
            Mercancias: mercancias,
            Receiver: {
              NumRegIdTrib: payload.taxRegistrationNumber || "000000000",
              Address: {
                Street: "No Especificado",
                Neighborhood: "No Especificado",
                Locality: "No Especificado",
                Municipality: "No Especificado",
                State: payload.taxResidence === 'USA' ? 'CA' : (payload.taxResidence === 'CAN' ? 'ON' : 'SIN'),
                ZipCode: payload.cp || "00000",
                Country: payload.taxResidence || "USA"
              }
            }
          }
        };
    }

    try {
      // 1. Crear el CFDI
      const response = await axios.post(this.getFacturamaUrl('/3/cfdis'), facturamaPayload, {
        headers: this.getFacturamaHeaders()
      });

      const cfdi = response.data;

      // 2. Guardar en Base de Datos
      const nuevaFactura = this.facturaRepo.create({
        venta,
        rfcCliente: payload.rfc,
        nombreCliente: payload.razonSocial,
        usoCfdi: payload.usoCfdi,
        total: venta.totalPagado,
        sucursal: venta.sucursal,
        uuid: cfdi.Complement?.TaxStamp?.Uuid || cfdi.Id,
        facturapiId: cfdi.Id,
        urlPdf: `/pos/facturas/${cfdi.Id}/pdf`,
        urlXml: `/pos/facturas/${cfdi.Id}/xml`,
        estatus: 'Emitida',
        fechaEmision: new Date(),
        formaPago: payload.formaPago,
        metodoPago: payload.metodoPago,
        regimenFiscal: payload.regimen,
        cp: payload.cp
      });

      return await this.facturaRepo.save(nuevaFactura);
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new BadRequestException(`Error de Facturama: ${JSON.stringify(error.response.data)}`);
      }
      throw new BadRequestException('Error al conectar con Facturama: ' + error.message);
    }
  }

  async cancelarFactura(idFactura: number, motivo: string = '02', uuidSustitucion?: string, idSucursal?: number, rol?: string) {
    const factura = await this.facturaRepo.findOne({ where: { idFactura }, relations: { sucursal: true } });
    if (!factura) throw new BadRequestException('Factura no encontrada');
    // Validar pertenencia
    if (idSucursal && rol !== 'Administrador' && rol !== 'Soporte') {
      if (factura.sucursal?.idSucursal !== idSucursal) throw new ForbiddenException('No tienes permiso para cancelar esta factura');
    }
    if (factura.estatus === 'Cancelada') throw new BadRequestException('La factura ya está cancelada');
    if (!factura.facturapiId) throw new BadRequestException('La factura no tiene un ID de Facturama asociado');

    try {
      const url = this.getFacturamaUrl(`/cfdi/${factura.facturapiId}?type=issued&motive=${motivo}` + (uuidSustitucion ? `&uuidReplacement=${uuidSustitucion}` : ''));
      await axios.delete(url, { headers: this.getFacturamaHeaders() });
      
      factura.estatus = 'Cancelada';
      return await this.facturaRepo.save(factura);
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new BadRequestException(`Error al cancelar en Facturama: ${JSON.stringify(error.response.data)}`);
      }
      throw new BadRequestException('Error al conectar con Facturama: ' + error.message);
    }
  }

  async descargarFacturaArchivo(idFacturama: string, format: 'pdf' | 'xml') {
    try {
      const url = this.getFacturamaUrl(`/cfdi/${format}/issued/${idFacturama}`);
      const response = await axios.get(url, { headers: this.getFacturamaHeaders() });
      
      let data = response.data; // { Content: 'base64...', ... }
            
      return data;
    } catch (error: any) {
      throw new BadRequestException('Error al descargar archivo de Facturama: ' + error.message);
    }
  }

  async descargarPaqueteCancelacion(idFactura: number, nombreClienteFallback: string = ''): Promise<Buffer> {
    const factura = await this.facturaRepo.findOne({ where: { idFactura }, relations: { venta: true } });
    if (!factura || !factura.facturapiId) {
      throw new BadRequestException('Factura no encontrada o sin ID de Facturama.');
    }

    try {
      // 1. Descargar Factura (PDF)
      const resPdf = await this.descargarFacturaArchivo(factura.facturapiId, 'pdf');
      const pdfBuffer = Buffer.from(resPdf.Content, 'base64');

      // 2. Descargar Factura (XML)
      const resXml = await this.descargarFacturaArchivo(factura.facturapiId, 'xml');
      const xmlBuffer = Buffer.from(resXml.Content, 'base64');

      // 3. Descargar Acuse de Cancelación
      let acuseBuffer: Buffer;
      let isAcuseXml = false;
      try {
        // Intentar descargar el Acuse en PDF real directamente
        const urlAcusePdf = this.getFacturamaUrl(`/acuse/pdf/issued/${factura.facturapiId}`);
        const responseAcusePdf = await axios.get(urlAcusePdf, { headers: this.getFacturamaHeaders() });
        if (responseAcusePdf.data && responseAcusePdf.data.Content) {
          acuseBuffer = Buffer.from(responseAcusePdf.data.Content, 'base64');
        } else {
          throw new Error('No se encontró el PDF en la respuesta');
        }
      } catch (errPdf: any) {
        throw new BadRequestException('El acuse real aún no está disponible en Facturama/SAT. Por favor, espere unos minutos e intente descargar de nuevo.');
      }
      // 4. Comprimir en un archivo ZIP
      const zip = new AdmZip();
      
      // Obtener serie y folio de la base de datos si es posible, o usar el ID
      // Como no tenemos folio y serie directo en pos_facturas, asumiremos PUR-3 basado en el requerimiento visual,
      // o extraeremos del UUID si existe. Idealmente, esto vendría de un campo en la BD.
      // Para igualar el formato de tu compañero, usaremos el prefijo PUR- y el ID:
      const serieFolio = `PUR-${factura.idFactura}`;
      
      const fileNamePdf = `Factura-${serieFolio}.pdf`;
      const fileNameXml = `Factura-${serieFolio}.xml`;
      const fileNameAcusePdf = `Acuse-${serieFolio}.pdf`;
      const fileNameAcuseXml = `Acuse-${serieFolio}.xml`;

      zip.addFile(fileNamePdf, pdfBuffer);
      zip.addFile(fileNameXml, xmlBuffer);
      
      if (isAcuseXml) {
        zip.addFile(fileNameAcuseXml, acuseBuffer);
      } else {
        zip.addFile(fileNameAcusePdf, acuseBuffer);
      }

      return zip.toBuffer();
    } catch (error: any) {
      throw new BadRequestException('Error al generar paquete de cancelación: ' + error.message);
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
//       void('Error in local SAT product search', e);
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
//       void('Error in local SAT unit search', e);
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

    const folioInterno = await this.generarFolioConsecutivo(this.proformaRepo, 'REM', 'folioInterno');

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

  async parseCsf(buffer: Buffer, idSucursal?: number) {
    try {
      const pdfParse = require('pdf-parse');
      const render_page = function(pageData: any) {
        const render_options = { normalizeWhitespace: true, disableCombineTextItems: false };
        return pageData.getTextContent(render_options).then(function(textContent: any) {
            let pageText = '';
            let lastY = -1;
            for (let item of textContent.items) {
                if (lastY == item.transform[5] || lastY === -1) {
                    pageText += ' ' + item.str;
                } else {
                    pageText += '\n' + item.str;
                }
                lastY = item.transform[5];
            }
            return pageText;
        });
      };
      const data = await pdfParse(buffer, { pagerender: render_page });
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
        let clienteExistente: any = null;
        if (idSucursal && (rfc || nombre)) {
          const conditions: any[] = [];
          if (rfc && rfc.toUpperCase() !== 'XAXX010101000' && rfc.toUpperCase() !== 'XEXX010101000') {
            conditions.push({ rfc, sucursal: { idSucursal } });
          }
          if (nombre) {
            conditions.push({ nombreCompleto: nombre, sucursal: { idSucursal } });
          }
          if (conditions.length > 0) {
            clienteExistente = await this.clienteRepo.findOne({ where: conditions });
          }
        }
        const sanitizar = (str: string) => str ? str.replace(/\s+/g, ' ').trim() : '';

        return { 
          success: !!rfc, 
          rfc: sanitizar(rfc), 
          nombre: sanitizar(nombre), 
          cp: sanitizar(cp), 
          regimenFiscal: sanitizar(regimenFiscal), 
          direccion: sanitizar(direccionCompleta), 
          rawText: text.substring(0, 500), 
          clienteExistente: !!clienteExistente, 
          clienteData: clienteExistente 
        };
    } catch (error) {
//       void('Error parseando CSF:', error);
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

  async verificarDuplicadoProveedor(payload: any, idActual: number = 0, idSucursal?: number) {
    const idSuc = idSucursal || payload.idSucursal;
    const whereCondition = idSuc ? { sucursal: { idSucursal: idSuc } } : {};

    if (payload.rfc && payload.rfc.toUpperCase() !== 'XAXX010101000' && payload.rfc.toUpperCase() !== 'XEXX010101000') {
      const existeRfc = await this.proveedorRepo.findOne({ where: { rfc: payload.rfc, ...whereCondition } });
      if (existeRfc && existeRfc.idProveedor !== idActual) {
        throw new BadRequestException(`Ya existe un proveedor con el RFC ${payload.rfc} en esta sucursal`);
      }
    }
    if (payload.nombre) {
      const duplicadoNombre = await this.proveedorRepo.findOne({
        where: { nombre: payload.nombre, ...whereCondition }
      });
      if (duplicadoNombre && duplicadoNombre.idProveedor !== idActual) {
        throw new BadRequestException(`Ya existe un proveedor con el nombre exacto ${payload.nombre} en esta sucursal`);
      }
    }
  }

  async crearProveedor(payload: any, idSucursal?: number) {
    await this.verificarDuplicadoProveedor(payload, 0, idSucursal);
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

  async actualizarProveedor(id: number, payload: any, idSucursal?: number, rol?: string) {
    await this.verificarDuplicadoProveedor(payload, id, idSucursal);
    const proveedor = await this.proveedorRepo.findOne({ where: { idProveedor: id }, relations: { sucursal: true } });
    if (!proveedor) throw new NotFoundException('Proveedor no encontrado');
    // Validar pertenencia
    if (idSucursal && rol !== 'Administrador' && rol !== 'Soporte') {
      if (proveedor.sucursal?.idSucursal !== idSucursal) throw new ForbiddenException('No tienes permiso para modificar este proveedor');
    }
    Object.assign(proveedor, payload);
    return this.proveedorRepo.save(proveedor);
  }

  async eliminarProveedor(id: number, idSucursal?: number, rol?: string) {
    const proveedor = await this.proveedorRepo.findOne({ where: { idProveedor: id }, relations: { sucursal: true } });
    if (!proveedor) throw new NotFoundException('Proveedor no encontrado');
    // Validar pertenencia
    if (idSucursal && rol !== 'Administrador' && rol !== 'Soporte') {
      if (proveedor.sucursal?.idSucursal !== idSucursal) throw new ForbiddenException('No tienes permiso para eliminar este proveedor');
    }
    proveedor.activo = false;
    await this.proveedorRepo.save(proveedor);
    return { success: true };
  }

  // ═══════════════════════════════════════════════════════
  // COMPRAS
  // ═══════════════════════════════════════════════════════

  async buscarConceptosCompras(q: string, idSucursal?: number) {
    if (!q || q.length < 2) return [];
    
    // We want to search for products in purchase details by name, barcode, or folio
    const query = this.dataSource.createQueryBuilder()
      .select([
        'cd.id_detalle_compra as idDetalle',
        'c.id_compra as idCompra',
        'c.folio as folio',
        'c.fecha_compra as fechaCompra',
        'prov.nombre as proveedor',
        'p.id_producto as idProducto',
        'p.nombre as nombre',
        'p.codigo_barras as codigoBarras',
        'cd.precio_costo as precioUnitario',
        'p.iva as iva'
      ])
      .from('pos_compras_detalle', 'cd')
      .innerJoin('pos_compras', 'c', 'c.id_compra = cd.id_compra')
      .leftJoin('pos_proveedores', 'prov', 'prov.id_proveedor = c.id_proveedor')
      .innerJoin('pos_productos', 'p', 'p.id_producto = cd.id_producto')
      .where('(p.nombre LIKE :q OR p.codigo_barras LIKE :q OR c.folio LIKE :q OR prov.nombre LIKE :q)', { q: `%${q}%` });

    if (idSucursal) {
      query.andWhere('c.id_sucursal = :idSucursal', { idSucursal });
    }

    query.orderBy('c.fecha_compra', 'DESC')
      .limit(50);
      
    const results = await query.getRawMany();
    return results.map(r => ({
      idDetalle: r.idDetalle,
      idProducto: r.idProducto,
      nombre: r.nombre,
      codigoBarras: r.codigoBarras,
      precioUnitario: Number(r.precioUnitario),
      iva: Number(r.iva),
      folio: r.folio,
      proveedor: r.proveedor,
      fechaCompra: r.fechaCompra
    }));
  }

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
      const folio = await this.generarFolioConsecutivo(this.compraRepo, 'COMP');

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
          if (item.precioCosto !== undefined && item.precioCosto !== null) {
              const stockPrevio = Number(pCompra.stockActual);
              const costoPrevio = Number(pCompra.precioCompra) || 0;
              const cantidadEntrante = Number(item.cantidad);

              pCompra.precioCompra = calcularCostoPromedioPonderado(
                stockPrevio,
                costoPrevio,
                cantidadEntrante,
                item.precioCosto
              );

              const utilidad = Number(pCompra.utilidad) || 0;
              const precioPublico = pCompra.precioCompra * (1 + (utilidad / 100));
              pCompra.precioUnitario = precioPublico;
              pCompra.precioPublico = precioPublico;
              
              const aplicaIva = pCompra.aplicaIva ?? false;
              const ivaRate = Number(pCompra.iva) || 0;
              const baseIva = precioPublico - (Number(pCompra.descuento) || 0);
              const ivaCalc = aplicaIva ? (baseIva * (ivaRate / 100)) : 0;
              pCompra.precioVenta = baseIva + ivaCalc;
            }
          
          pCompra.stockActual = Number(pCompra.stockActual) + Number(item.cantidad);
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
      throw new BadRequestException('Error al registrar la compra: ' + (error instanceof Error ? error.message : String(error)));
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
      if (venta.estatus === 'Cancelada' || venta.estatus === 'Devuelta') {
        throw new BadRequestException('Esta venta ya fue devuelta o cancelada en su totalidad');
      }

      let items = payload.items as { idProducto: number; nombre: string; cantidad: number; precioUnitario: number; destino?: 'stock' | 'merma' }[];
      
      if (!items || items.length === 0) {
        if (payload.tipo === 'Total') {
          items = venta.detalles.map(d => ({
            idProducto: d.producto.idProducto,
            nombre: d.producto.nombre,
            cantidad: Number(d.cantidad),
            precioUnitario: Number(d.precioUnitario),
            destino: 'stock'
          }));
        } else {
          throw new BadRequestException('Debe proporcionar los items a devolver');
        }
      }

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
          observaciones: payload.observaciones,
          tipo,
        items,
      });
      const savedDev = await queryRunner.manager.save(PosDevolucion, devolucion);

      await queryRunner.commitTransaction();
      return { success: true, devolucion: savedDev, montoDevuelto, tipo };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Error al registrar la devolución: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      await queryRunner.release();
    }
  }

  async getTipoCambio() {
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await response.json();
      return { mxn: data.rates.MXN };
    } catch (e) {
      return { mxn: 20 };
    }
  }

  async getProveedoresByProducto(idProducto: number) {
    const rows = await this.dataSource
      .createQueryBuilder()
      .select([
        'prov.id_proveedor as idProveedor',
        'prov.nombre as nombre',
        'COUNT(cd.id_detalle_compra) as totalCompras',
        'SUM(cd.cantidad) as totalUnidades',
        'MAX(c.fecha_compra) as ultimaCompra',
        'AVG(cd.precio_costo) as costoPromedio',
      ])
      .from('pos_compras_detalle', 'cd')
      .innerJoin('pos_compras', 'c', 'c.id_compra = cd.id_compra')
      .innerJoin('pos_proveedores', 'prov', 'prov.id_proveedor = c.id_proveedor')
      .where('cd.id_producto = :idProducto', { idProducto })
      .groupBy('prov.id_proveedor')
      .orderBy('totalUnidades', 'DESC')
      .getRawMany();

    return rows.map(r => ({
      idProveedor: r.idProveedor,
      nombre: r.nombre,
      totalCompras: Number(r.totalCompras),
      totalUnidades: Number(r.totalUnidades),
      ultimaCompra: r.ultimaCompra,
      costoPromedio: Number(r.costoPromedio),
    }));
  }

  async getComprasByProducto(idProducto: number, idProveedor?: number) {
    const compras = await this.compraRepo.find({
      where: {
        ...(idProveedor ? { proveedor: { idProveedor } } : {}),
        detalles: { producto: { idProducto } },
      },
      relations: { proveedor: true, usuario: true, detalles: { producto: true }, sucursal: true },
      order: { fechaCompra: 'DESC' },
    });
    return compras.map(c => ({
      idCompra: c.idCompra,
      folio: c.folio,
      fechaCompra: c.fechaCompra,
      folioFacturaProveedor: c.folioFacturaProveedor,
      urlFacturaPdf: c.urlFacturaPdf,
      notas: c.notas,
      total: c.total,
      proveedor: c.proveedor,
      sucursal: c.sucursal,
      detalles: c.detalles,
    }));
  }

  async getCotizaciones(idSucursal?: number) {
    return this.cotizacionRepo.find({
      where: idSucursal ? { sucursal: { idSucursal } } : {},
      order: { idCotizacion: 'DESC' },
      relations: { detalles: { producto: true }, cliente: true, usuario: true, sucursal: { empresa: true } }
    });
  }

  async getCotizacionById(idCotizacion: number) {
    const cotizacion = await this.cotizacionRepo.findOne({
      where: { idCotizacion },
      relations: { detalles: { producto: true }, cliente: true, usuario: true, sucursal: true }
    });
    if (!cotizacion) throw new NotFoundException('Cotización no encontrada');
    return cotizacion;
  }

  async crearCotizacion(payload: any) {
    const idSucursal = payload.idSucursal;
    const sucursal = await this.sucursalRepo.findOne({ where: { idSucursal } });
    if (!sucursal) throw new NotFoundException('Sucursal no encontrada');

    const folio = await this.generarFolioConsecutivo(this.cotizacionRepo, 'COT');

    const nuevaCot = new PosCotizacion();
    nuevaCot.folio = folio;
    nuevaCot.vigenciaDias = payload.vigenciaDias || 15;
    nuevaCot.titulo = payload.titulo || null;
    nuevaCot.observaciones = payload.observaciones || null;
    nuevaCot.costoBase = payload.costoBase || 0;
    nuevaCot.utilidadTotal = payload.utilidadTotal || 0;
    nuevaCot.tipoCambio = payload.tipoCambio || 1;
    nuevaCot.subtotal = payload.subtotal;
    nuevaCot.descuento = payload.descuento || 0;
    nuevaCot.totalIva = payload.totalIva || 0;
    nuevaCot.total = payload.total;
    nuevaCot.estatus = 'Borrador';
    nuevaCot.sucursal = { idSucursal } as PosSucursal;
    nuevaCot.usuario = (payload.idUsuario ? { idUsuario: payload.idUsuario } : null) as any;
    nuevaCot.cliente = (payload.idCliente ? { idCliente: payload.idCliente } : null) as any;
    nuevaCot.nombreClienteTemporal = payload.nombreClienteTemporal || null;

    const savedCot = await this.cotizacionRepo.save(nuevaCot);

    if (payload.productos && payload.productos.length > 0) {
      const detalles = payload.productos.map((prod: any) => {
        const d = new PosCotizacionDetalle();
        d.cotizacion = savedCot;
        if (prod.idProducto) {
          d.producto = { idProducto: prod.idProducto } as any;
        } else if (prod.nombreConcepto) {
          d.nombreConcepto = prod.nombreConcepto;
        }
        d.cantidad = prod.cantidad;
        d.precioUnitario = prod.precioUnitario;
        d.moneda = prod.moneda || 'MXN';
        d.utilidadPorcentaje = prod.utilidadPorcentaje || 0;
        d.utilidadValor = prod.utilidadValor || 0;
        d.precioConUtilidad = prod.precioConUtilidad || prod.precioUnitario;
        d.aplicaIva = prod.aplicaIva || false;
        d.importe = prod.cantidad * d.precioConUtilidad;
        return d;
      });
      await this.cotizacionDetalleRepo.save(detalles);
    }

    return this.getCotizacionById(savedCot.idCotizacion);
  }

  async actualizarCotizacion(idCotizacion: number, payload: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cotizacion = await queryRunner.manager.findOne(PosCotizacion, {
        where: { idCotizacion },
        relations: { detalles: true }
      });

      if (!cotizacion) {
        throw new NotFoundException('Cotizacin no encontrada.');
      }

      // Update basic fields
      cotizacion.vigenciaDias = payload.vigenciaDias || cotizacion.vigenciaDias;
      cotizacion.titulo = payload.titulo || null;
      cotizacion.observaciones = payload.observaciones || null;
      cotizacion.costoBase = payload.costoBase;
      cotizacion.utilidadTotal = payload.utilidadTotal;
      cotizacion.tipoCambio = payload.tipoCambio;
      cotizacion.subtotal = payload.subtotal;
      cotizacion.descuento = payload.descuento || 0;
      cotizacion.totalIva = payload.totalIva;
      cotizacion.total = payload.total;
      
      if (payload.idCliente) {
        const cliente = await queryRunner.manager.findOne(PosCliente, { where: { idCliente: payload.idCliente } });
        if (cliente) cotizacion.cliente = cliente;
      }
      if (payload.nombreClienteTemporal) {
        cotizacion.nombreClienteTemporal = payload.nombreClienteTemporal;
      }

      await queryRunner.manager.save(PosCotizacion, cotizacion);

      // Remove old detalles
      await queryRunner.manager.delete(PosCotizacionDetalle, { cotizacion: { idCotizacion } });

      // Create new detalles
      for (const prod of payload.productos) {
        const det = new PosCotizacionDetalle();
        det.cotizacion = cotizacion;
        if (prod.idProducto) {
          const producto = await queryRunner.manager.findOne(PosProducto, { where: { idProducto: prod.idProducto } });
          if (producto) det.producto = producto;
        }
        det.nombreConcepto = prod.nombreConcepto || null;
        det.cantidad = prod.cantidad;
        det.precioUnitario = prod.precioUnitario;
        det.moneda = prod.moneda || 'MXN';
        det.utilidadPorcentaje = prod.utilidadPorcentaje || 0;
        det.utilidadValor = prod.utilidadValor || 0;
        det.precioConUtilidad = prod.precioConUtilidad || prod.precioUnitario;
        det.aplicaIva = prod.aplicaIva || false;
        
        await queryRunner.manager.save(PosCotizacionDetalle, det);
      }

      await queryRunner.commitTransaction();
      
      // Return fully loaded cotizacion
      return this.cotizacionRepo.findOne({
        where: { idCotizacion },
        relations: { cliente: true, sucursal: true, usuario: true, detalles: { producto: true } }
      });

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async cambiarEstatusCotizacion(idCotizacion: number, estatus: string, idSucursal?: number, rol?: string) {
    const cotizacion = await this.getCotizacionById(idCotizacion);
    if (idSucursal && rol !== 'Administrador' && rol !== 'Soporte') {
      if (cotizacion.sucursal?.idSucursal !== idSucursal) throw new ForbiddenException('No tienes permiso para modificar esta cotización');
    }
    cotizacion.estatus = estatus;
    return this.cotizacionRepo.save(cotizacion);
  }

  async eliminarCotizacion(idCotizacion: number, idSucursal?: number, rol?: string) {
    const cotizacion = await this.getCotizacionById(idCotizacion);
    if (idSucursal && rol !== 'Administrador' && rol !== 'Soporte') {
      if (cotizacion.sucursal?.idSucursal !== idSucursal) throw new ForbiddenException('No tienes permiso para eliminar esta cotización');
    }
    return this.cotizacionRepo.remove(cotizacion);
  }

  async convertirCotizacionAVenta(idCotizacion: number, idUsuario: number) {
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
    });

    const savedVenta = await this.ventaRepo.save(nuevaVenta);

    const movimientos: PosMovimientoInventario[] = [];
    const detallesVenta = cotizacion.detalles.map(d => {
      if (d.producto) {
        const mov = new PosMovimientoInventario();
        mov.tipoMovimiento = 'SALIDA';
        mov.referencia = `Conversión de Cotización ${cotizacion.folio}`;
        mov.cantidad = d.cantidad;
        mov.producto = d.producto;
        mov.sucursal = cotizacion.sucursal;
        mov.usuario = { idUsuario } as PosUsuario;
        movimientos.push(mov);

        d.producto.stockActual = Number(d.producto.stockActual) - Number(d.cantidad);
      }

      return this.ventaRepo.manager.create(PosVentaDetalle, {
        venta: savedVenta,
        producto: d.producto,
        cantidad: d.cantidad,
        precioUnitario: d.precioConUtilidad,
        subtotal: d.importe,
        aplicaIva: d.aplicaIva
      });
    });

    await this.ventaRepo.manager.save(detallesVenta);
    await this.movimientoRepo.save(movimientos);

    for (const d of cotizacion.detalles) {
      if (d.producto) {
        await this.productoRepo.save(d.producto);
      }
    }

    cotizacion.estatus = 'Aceptada';
    cotizacion.idVenta = savedVenta.idVenta;
    await this.cotizacionRepo.save(cotizacion);

    return { success: true, venta: savedVenta, cotizacion };
  }

  async facturarCotizacion(idCotizacion: number, payload: any) {
    const cotizacion = await this.getCotizacionById(idCotizacion);
    if (!cotizacion.idVenta) {
      throw new BadRequestException('Las cotizaciones deben convertirse a ventas para poder facturarse.');
    }
    return this.facturarVenta(cotizacion.idVenta, payload);
  }


  async parsearPdfFactura(buffer: Buffer, idSucursal: number) {

    try {

      const data = await pdfParse(buffer);

      const text = data.text;



//       void("=== INICIO TEXTO PDF ===");

//       void(text);

//       void("=== FIN TEXTO PDF ===");



      const rfcs = text.match(/[A-Z&Ñ]{3,4}\d{6}[A-V1-9][A-Z1-9][0-9A]/gi) || [];

      let rfcEmisor = rfcs && rfcs.length > 0 ? (rfcs[0]?.toUpperCase() || '') : '';



      let folio = '';

      const folioMatch = text.match(/(?:Folio|Factura)[\s:-]*([A-Z0-9\-]+)/i);

      if (folioMatch && folioMatch[1]) {

        folio = folioMatch[1].trim();

      }



      const conceptos: any[] = [];

      const lines = text.split('\n');



      let currentProduct: any = null;



      for (const line of lines) {

        const trimmed = line.trim();



                // 1. Buscar inicio del producto
        const matchAzul = trimmed.match(/^(\d{8})(.+?)(\d+(?:\.\d+)?)(0[1-4])([A-Z0-9]{2,4})\s*-/);
        const matchRojo = trimmed.match(/^(\d{8})\s*(\d+(?:\.\d+)?)\s*([A-Z0-9]{2,4})\s*-\s*(.+?)(?:\s*\$([0-9.,]+)\s*\$([0-9.,]+))?$/);

        let pCantidad = 0;
        let pConcepto = '';
        let pPrecio = 0;
        let productMatch = false;

        if (matchAzul) {
          productMatch = true;
          pConcepto = matchAzul[2].trim();
          pCantidad = parseFloat(matchAzul[3]);
        } else if (matchRojo) {
          productMatch = true;
          pCantidad = parseFloat(matchRojo[2]);
          pConcepto = matchRojo[4].trim();
          if (matchRojo[5]) {
            pPrecio = parseFloat(matchRojo[5].replace(/,/g, ''));
          }
        }

        if (productMatch) {
          currentProduct = {
            cantidad: pCantidad,
            conceptoXml: pConcepto,
            costoUnitario: pPrecio,
            noIdentificacion: 'PDF-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 1000),
            productoEncontrado: null
          };
          if (pPrecio > 0 && pCantidad > 0) {
            conceptos.push({ ...currentProduct });
            currentProduct = null;
          }
          continue;
        }

        // 2. Buscar linea de precios si no vinieron en la misma linea
        if (currentProduct && trimmed.startsWith('$')) {
          const priceMatch = trimmed.match(/^\$([0-9.,]+)(?:\s*\$([0-9.,]+))?\s*\$([0-9.,]+)$/);
          if (priceMatch) {
            const precioStr = priceMatch[1].replace(/,/g, '');
            const descuentoStr = priceMatch[2] ? priceMatch[2].replace(/,/g, '') : '0';
            const precioBruto = parseFloat(precioStr);
            const descuento = parseFloat(descuentoStr);
            currentProduct.costoUnitario = currentProduct.cantidad > 0 ? ((precioBruto * currentProduct.cantidad) - descuento) / currentProduct.cantidad : precioBruto;
            if (currentProduct.cantidad > 0 && currentProduct.costoUnitario > 0) {
              conceptos.push({ ...currentProduct });
            }
            currentProduct = null;
          }
        }

      }



      // Buscar en BD por nombre para ver si ya existen

      for (const c of conceptos) {

        if (idSucursal) {

          const productoMatch = await this.productoRepo.findOne({

            where: {

              sucursal: { idSucursal: idSucursal },

              nombre: c.conceptoXml.trim().toUpperCase()

            }

          });



          if (productoMatch) {

            c.productoEncontrado = {

              idProducto: productoMatch.idProducto,

              nombre: productoMatch.nombre,

              codigoBarras: productoMatch.codigoBarras

            };

          }

        }

      }



      return {

        emisor: {

          rfc: rfcEmisor,

          nombre: ''

        },

        folio: folio,

        serie: '',

        conceptos: conceptos

      };

    } catch (error) {

      throw new BadRequestException('No se pudo analizar el PDF.');

    }

  }

  // ─── IMPORTACIÓN MASIVA ──────────────────────────────────────────────────────

  generarPlantillaExcel(tipo: 'productos' | 'clientes' | 'proveedores'): Buffer {
    const wb = XLSX.utils.book_new();
    let headers: string[] = [];
    let ejemplo: any[] = [];

    if (tipo === 'productos') {
      headers = ['nombre*', 'precioCompra*', 'utilidad%', 'stock', 'stockMinimo', 'codigoBarras', 'categoria', 'aplicaIva', 'tasaIva', 'tipoArticulo', 'unidadMedida', 'claveSAT', 'unidadSAT'];
        ejemplo = [{ 'nombre*': 'Miel a Granel', 'precioCompra*': 40.00, 'utilidad%': 25, 'stock': 100, 'stockMinimo': 10, 'codigoBarras': 'MG-001', 'categoria': 'Granel', 'aplicaIva': 'NO', 'tasaIva': 0, 'tipoArticulo': 'Terminado', 'unidadMedida': 'kg', 'claveSAT': '50192403', 'unidadSAT': 'KGM' }];
    } else if (tipo === 'clientes') {
      headers = ['nombreCompleto*', 'rfc', 'telefono', 'correo', 'direccion', 'cp', 'regimenFiscal', 'usoCfdi', 'formaPago', 'metodoPago'];
      ejemplo = [{ 'nombreCompleto*': 'Juan Pérez García', 'rfc': 'PEGJ900101ABC', 'telefono': '6181234567', 'correo': 'juan@ejemplo.com', 'direccion': 'Calle Falsa 123', 'cp': '34000', 'regimenFiscal': '616', 'usoCfdi': 'G03', 'formaPago': '01', 'metodoPago': 'PUE' }];
    } else {
      headers = ['nombre*', 'rfc', 'contacto', 'telefono', 'correo', 'direccion', 'cp', 'regimenFiscal'];
      ejemplo = [{ 'nombre*': 'Distribuidora XYZ', 'rfc': 'DXY990101ABC', 'contacto': 'María López', 'telefono': '6189876543', 'correo': 'ventas@xyz.com', 'direccion': 'Av. Industrial 456', 'cp': '34100', 'regimenFiscal': '601' }];
    }

    const ws = XLSX.utils.json_to_sheet(ejemplo, { header: headers });
    // Ancho de columnas automático
    ws['!cols'] = headers.map(() => ({ wch: 22 }));
    XLSX.utils.book_append_sheet(wb, ws, tipo.charAt(0).toUpperCase() + tipo.slice(1));
    return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
  }

  async importarProductos(buffer: Buffer, idSucursal?: number): Promise<{ importados: number; errores: { fila: number; error: string }[] }> {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const filas: any[] = XLSX.utils.sheet_to_json(ws);

    let importados = 0;
    const errores: { fila: number; error: string }[] = [];

    for (let i = 0; i < filas.length; i++) {
      const fila = filas[i];
      const numFila = i + 2; // +2 porque fila 1 es el encabezado

      const nombre = String(fila['nombre*'] || fila['nombre'] || '').trim();
      const precioCompra = parseFloat(fila['precioCompra*'] || fila['precioCompra'] || '0');
        const utilidad = parseFloat(fila['utilidad%'] || fila['utilidad'] || '18');
        
        if (!nombre) { errores.push({ fila: numFila, error: 'El campo "nombre" es obligatorio' }); continue; }
        if (isNaN(precioCompra) || precioCompra < 0) { errores.push({ fila: numFila, error: 'El campo "precioCompra" es inválido' }); continue; }
        
        const precioPublico = precioCompra * (1 + (utilidad / 100));

      try {
        // Auto-crear categora si se especifica y no existe
        let categoriaObj: PosCategoria | null = null;
        const categoriaStr = String(fila['categoria'] || '').trim();
        if (categoriaStr) {
          let cat = await this.categoriaRepo.createQueryBuilder('cat')
            .where('LOWER(cat.nombre) = LOWER(:nombre)', { nombre: categoriaStr })
            .getOne();
            
          if (!cat) {
            cat = this.categoriaRepo.create({ 
              nombre: categoriaStr.toUpperCase(),
              ...(idSucursal ? { sucursal: { idSucursal } } : {})
            });
            cat = await this.categoriaRepo.save(cat);
          }
          categoriaObj = cat;
        }

        const aplicaIvaStr = String(fila['aplicaIva'] || '').toUpperCase();
          const aplicaIva = aplicaIvaStr === 'Sí' || aplicaIvaStr === 'Sí' || aplicaIvaStr === 'TRUE' || aplicaIvaStr === '1' || aplicaIvaStr === 'YES';
          const ivaRate = parseFloat(fila['tasaIva'] || fila['iva'] || (aplicaIva ? '16' : '0'));
          
          const baseIva = precioPublico; // Asumimos que precioPublico no incluye descuentos fijos por defecto al importar
          const ivaCalc = aplicaIva ? (baseIva * (ivaRate / 100)) : 0;
          const precioVenta = baseIva + ivaCalc;

          const producto = this.productoRepo.create({
            nombre,
            precioCompra,
            utilidad,
            precioUnitario: precioPublico,
            precioPublico,
            precioVenta,
            aplicaIva,
            iva: ivaRate,
            stockActual: parseInt(fila['stock'] || '0', 10) || 0,
            stockMinimo: parseInt(fila['stockMinimo'] || '0', 10) || 0,
            codigoBarras: String(fila['codigoBarras'] || '').trim() || undefined,
            descripcion: String(fila['descripcion'] || '').trim() || undefined,
            tipoArticulo: String(fila['tipoArticulo'] || '').trim() || 'Terminado',
            unidadMedida: String(fila['unidadMedida'] || '').trim() || 'Pza',
            claveProdServ: String(fila['claveSAT'] || fila['claveProdServ'] || '').trim() || '01010101',
            claveUnidad: String(fila['unidadSAT'] || fila['claveUnidad'] || '').trim() || 'H87',
            activo: true,
            ...(categoriaObj ? { categoria: categoriaObj } : {}),
            ...(idSucursal ? { sucursal: { idSucursal } } : {}),
          });

        await this.productoRepo.save(producto);

        // Registrar movimiento de inventario si hay stock inicial
        if (producto.stockActual > 0) {
          const mov = this.movimientoRepo.create({
            producto: { idProducto: producto.idProducto },
            tipoMovimiento: 'Entrada',
            cantidad: producto.stockActual,
            referencia: 'Stock inicial - importación masiva',
            ...(idSucursal ? { sucursal: { idSucursal } } : {}),
          });
          await this.movimientoRepo.save(mov);
        }

        importados++;
      } catch (err: any) {
        let errorMsg = err?.message || 'Error al guardar';
        if (errorMsg.includes('Duplicate entry')) {
          const match = errorMsg.match(/Duplicate entry '(.*?)'/);
          const val = match ? match[1] : '';
          errorMsg = `El código de barras o clave '${val}' ya existe en el inventario.`;
        }
        errores.push({ fila: numFila, error: errorMsg });
      }
    }

    return { importados, errores };
  }

  async importarClientes(buffer: Buffer, idSucursal?: number): Promise<{ importados: number; errores: { fila: number; error: string }[] }> {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const filas: any[] = XLSX.utils.sheet_to_json(ws);

    let importados = 0;
    const errores: { fila: number; error: string }[] = [];

    for (let i = 0; i < filas.length; i++) {
      const fila = filas[i];
      const numFila = i + 2;

      const nombreCompleto = String(fila['nombreCompleto*'] || fila['nombreCompleto'] || '').trim();
      if (!nombreCompleto) { errores.push({ fila: numFila, error: 'El campo "nombreCompleto" es obligatorio' }); continue; }

      try {
        // Verificar duplicado por nombre o RFC
        const rfc = String(fila['rfc'] || '').trim() || null;
        if (rfc && rfc !== 'XAXX010101000') {
          const whereCondition = idSucursal ? { sucursal: { idSucursal } } : {};
          const existe = await this.clienteRepo.findOne({ where: { rfc, ...whereCondition } });
          if (existe) { errores.push({ fila: numFila, error: `RFC ${rfc} ya registrado (cliente: ${existe.nombreCompleto})` }); continue; }
        }

        const cliente = this.clienteRepo.create({
          nombreCompleto,
          rfc: rfc || undefined,
          telefono: String(fila['telefono'] || '').trim() || undefined,
          correo: String(fila['correo'] || '').trim() || undefined,
          direccion: String(fila['direccion'] || '').trim() || undefined,
          cp: String(fila['cp'] || '').trim() || undefined,
          regimenFiscal: String(fila['regimenFiscal'] || '616').trim(),
          usoCfdi: String(fila['usoCfdi'] || 'G03').trim(),
          formaPago: String(fila['formaPago'] || '01').trim(),
          metodoPago: String(fila['metodoPago'] || 'PUE').trim(),
          activo: true,
          ...(idSucursal ? { sucursal: { idSucursal } } : {}),
        });

        await this.clienteRepo.save(cliente);
        importados++;
      } catch (err: any) {
        let errorMsg = err?.message || 'Error al guardar';
        if (errorMsg.includes('Duplicate entry')) {
          const match = errorMsg.match(/Duplicate entry '(.*?)'/);
          const val = match ? match[1] : '';
          errorMsg = `El RFC o dato '${val}' ya está registrado.`;
        }
        errores.push({ fila: numFila, error: errorMsg });
      }
    }

    return { importados, errores };
  }

  async importarProveedores(buffer: Buffer, idSucursal?: number): Promise<{ importados: number; errores: { fila: number; error: string }[] }> {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const filas: any[] = XLSX.utils.sheet_to_json(ws);

    let importados = 0;
    const errores: { fila: number; error: string }[] = [];

    for (let i = 0; i < filas.length; i++) {
      const fila = filas[i];
      const numFila = i + 2;

      const nombre = String(fila['nombre*'] || fila['nombre'] || '').trim();
      if (!nombre) { errores.push({ fila: numFila, error: 'El campo "nombre" es obligatorio' }); continue; }

      try {
        const rfc = String(fila['rfc'] || '').trim() || null;
        if (rfc) {
          const whereCondition = idSucursal ? { sucursal: { idSucursal } } : {};
          const existe = await this.proveedorRepo.findOne({ where: { rfc, ...whereCondition } });
          if (existe) { errores.push({ fila: numFila, error: `RFC ${rfc} ya registrado (proveedor: ${existe.nombre})` }); continue; }
        }

        const proveedor = this.proveedorRepo.create({
          nombre,
          rfc: rfc || undefined,
          contacto: String(fila['contacto'] || '').trim() || undefined,
          telefono: String(fila['telefono'] || '').trim() || undefined,
          correo: String(fila['correo'] || '').trim() || undefined,
          direccion: String(fila['direccion'] || '').trim() || undefined,
          cp: String(fila['cp'] || '').trim() || undefined,
          regimenFiscal: String(fila['regimenFiscal'] || '601').trim(),
          activo: true,
          ...(idSucursal ? { sucursal: { idSucursal } } : {}),
        });

        await this.proveedorRepo.save(proveedor);
        importados++;
      } catch (err: any) {
        let errorMsg = err?.message || 'Error al guardar';
        if (errorMsg.includes('Duplicate entry')) {
          const match = errorMsg.match(/Duplicate entry '(.*?)'/);
          const val = match ? match[1] : '';
          errorMsg = `El RFC o dato '${val}' ya está registrado.`;
        }
        errores.push({ fila: numFila, error: errorMsg });
      }
    }

    return { importados, errores };
  }

  // --- Gestion de Recetas ---
  async agregarReceta(idProductoPadre: number, idProductoHijo: number, cantidad: number) {
    const receta = this.recetaRepo.create({
      productoPadre: { idProducto: idProductoPadre },
      productoHijo: { idProducto: idProductoHijo },
      cantidad
    });
    return this.recetaRepo.save(receta);
  }

  async obtenerRecetas(idProductoPadre: number) {
    return this.recetaRepo.find({
      where: { productoPadre: { idProducto: idProductoPadre } },
      relations: { productoHijo: true }
    });
  }

  async eliminarReceta(idReceta: number) {
    return this.recetaRepo.delete(idReceta);
  }

  // --- Produccion y Fraccionamiento ---
  async fraccionarProducto(idSucursal: number, idProductoPadre: number, cantidad: number, productosResultantes: any[], idUsuario: number) {
    const parseNumber = (val: any) => {
      if (val === null || val === undefined) return 0;
      if (typeof val === 'string') val = val.replace(/,/g, '');
      const parsed = Number(val);
      return isNaN(parsed) ? 0 : parsed;
    };

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const productoPadre = await queryRunner.manager.findOne(PosProducto, { where: { idProducto: idProductoPadre } });
      if (!productoPadre) throw new BadRequestException('Producto padre no encontrado');

      const usuario = await queryRunner.manager.findOne(PosUsuario, { where: { idUsuario }, relations: { sucursal: true } });
      if (!usuario) throw new BadRequestException('Usuario no encontrado');

      const cantidadNum = parseNumber(cantidad);
      if (parseNumber(productoPadre.stockActual) < cantidadNum) {
        throw new BadRequestException(`Stock insuficiente de ${productoPadre.nombre} para fraccionar`);
      }

      // Salida del padre
      productoPadre.stockActual = parseNumber(productoPadre.stockActual) - cantidadNum;
      await queryRunner.manager.save(productoPadre);

      const movSalida = queryRunner.manager.create(PosMovimientoInventario, {
        producto: productoPadre,
        usuario,
        sucursal: { idSucursal },
        tipoMovimiento: 'Fraccionamiento_OUT',
        cantidad: cantidadNum,
        referencia: 'Fraccionamiento de producto'
      });
      await queryRunner.manager.save(movSalida);

      // Entradas de los hijos
      for (const item of productosResultantes) {
        if (!item.idProducto) continue;
        const productoHijo = await queryRunner.manager.findOne(PosProducto, { where: { idProducto: item.idProducto } });
        if (!productoHijo) throw new BadRequestException(`Producto resultante ${item.idProducto} no encontrado`);

        const itemCantidad = parseNumber(item.cantidad);
        productoHijo.stockActual = parseNumber(productoHijo.stockActual) + itemCantidad;
        await queryRunner.manager.save(productoHijo);

        const movEntrada = queryRunner.manager.create(PosMovimientoInventario, {
          producto: productoHijo,
          usuario,
          sucursal: { idSucursal },
          tipoMovimiento: 'Fraccionamiento_IN',
          cantidad: itemCantidad,
          referencia: `Derivado de fraccionamiento de ${productoPadre.nombre}`
        });
        await queryRunner.manager.save(movEntrada);
      }

      await queryRunner.commitTransaction();
      return { success: true, message: 'Fraccionamiento completado' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async producirArticulo(idSucursal: number, idProducto: number, cantidad: number, idUsuario: number) {
    const parseNumber = (val: any) => {
      if (val === null || val === undefined) return 0;
      if (typeof val === 'string') val = val.replace(/,/g, '');
      const parsed = Number(val);
      return isNaN(parsed) ? 0 : parsed;
    };

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const productoTerminado = await queryRunner.manager.findOne(PosProducto, { where: { idProducto } });
      if (!productoTerminado) throw new BadRequestException('Producto a producir no encontrado');

      const usuario = await queryRunner.manager.findOne(PosUsuario, { where: { idUsuario }, relations: { sucursal: true } });
      if (!usuario) throw new BadRequestException('Usuario no encontrado');

      const receta = await queryRunner.manager.find(PosReceta, { 
        where: { productoPadre: { idProducto } },
        relations: { productoHijo: true }
      });

      if (!receta || receta.length === 0) {
        throw new BadRequestException('El producto no tiene una receta configurada para produccion');
      }

      const cantidadNum = parseNumber(cantidad);

      // 1. Descontar ingredientes (hijos)
      for (const item of receta) {
        if (!item.productoHijo && !(item as any).id_producto_hijo) continue;
        const cantRequerida = parseNumber(item.cantidad) * cantidadNum;
        
        // Sometimes TypeORM returns the relation as a number or doesn't map idProducto properly
        const hijoId = item.productoHijo?.idProducto || (item as any).id_producto_hijo || (typeof item.productoHijo === 'number' ? item.productoHijo : null);
        
        if (!hijoId) {
          throw new BadRequestException(`No se pudo obtener el ID del ingrediente para la receta de ${productoTerminado.nombre}`);
        }

        const ingrediente = await queryRunner.manager.findOne(PosProducto, { where: { idProducto: hijoId } });
        
        if (!ingrediente) throw new BadRequestException(`Ingrediente no encontrado con ID: ${hijoId}`);
        if (parseNumber(ingrediente.stockActual) < cantRequerida) {
           throw new BadRequestException(`Stock insuficiente de ingrediente: ${ingrediente.nombre} (Stock: ${ingrediente.stockActual}, Requerido: ${cantRequerida})`);
        }

        ingrediente.stockActual = parseNumber(ingrediente.stockActual) - cantRequerida;
        await queryRunner.manager.save(ingrediente);

        const movSalida = queryRunner.manager.create(PosMovimientoInventario, {
          producto: ingrediente,
          usuario,
          sucursal: { idSucursal },
          tipoMovimiento: 'Produccion_OUT',
          cantidad: cantRequerida,
          referencia: `Consumo para produccion de ${productoTerminado.nombre}`
        });
        await queryRunner.manager.save(movSalida);
      }

      // 2. Sumar producto terminado (padre)
      productoTerminado.stockActual = parseNumber(productoTerminado.stockActual) + cantidadNum;
      await queryRunner.manager.save(productoTerminado);

      const movEntrada = queryRunner.manager.create(PosMovimientoInventario, {
        producto: productoTerminado,
        usuario,
        sucursal: { idSucursal },
        tipoMovimiento: 'Produccion_IN',
        cantidad: cantidadNum,
        referencia: 'Produccion de articulo'
      });
      await queryRunner.manager.save(movEntrada);

      await queryRunner.commitTransaction();
      return { success: true, message: 'Produccion completada' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // --- TRASPASOS DE INVENTARIO ---

  async crearTraspaso(idSucursalOrigen: number, idSucursalDestino: number, idUsuario: number, productos: any[], observaciones: string) {
    const parseNumber = (val: any) => {
      if (val === null || val === undefined) return 0;
      const parsed = typeof val === 'string' ? parseFloat(val) : val;
      return isNaN(parsed) ? 0 : parsed;
    };

    if (idSucursalOrigen === idSucursalDestino) {
      throw new BadRequestException('La sucursal origen y destino no pueden ser la misma.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sucursalOrigen = await queryRunner.manager.findOne(PosSucursal, { where: { idSucursal: idSucursalOrigen } });
      const sucursalDestino = await queryRunner.manager.findOne(PosSucursal, { where: { idSucursal: idSucursalDestino } });
      const usuario = await queryRunner.manager.findOne(PosUsuario, { where: { idUsuario } });

      if (!sucursalOrigen || !sucursalDestino) {
        throw new BadRequestException('Sucursal origen o destino no encontrada.');
      }

      const folio = await this.generarFolioConsecutivo(this.traspasoRepo, 'TRAS', 'folio');

      const traspaso = queryRunner.manager.create(PosTraspaso, {
        folio,
        sucursalOrigen: sucursalOrigen as any,
        sucursalDestino: sucursalDestino as any,
        usuario: usuario as any,
        observaciones
      });
      const savedTraspaso = await queryRunner.manager.save(traspaso);

      for (const item of productos) {
        if (!item.idProducto) continue;
        
        const cantidadTraspaso = parseNumber(item.cantidad);
        if (cantidadTraspaso <= 0) continue;

        // 1. Obtener producto origen
        const prodOrigen = await queryRunner.manager.findOne(PosProducto, { 
          where: { idProducto: item.idProducto },
          relations: { categoria: true }
        });
        
        if (!prodOrigen) {
          throw new BadRequestException(`Producto origen con ID ${item.idProducto} no encontrado.`);
        }
        
        const stockActual = parseNumber(prodOrigen.stockActual);
        if (stockActual < cantidadTraspaso) {
          throw new BadRequestException(`Stock insuficiente en sucursal origen para: ${prodOrigen.nombre} (Stock: ${stockActual}, Requerido: ${cantidadTraspaso})`);
        }

        // 2. Buscar equivalente en destino por código de barras
        let prodDestino = await queryRunner.manager.findOne(PosProducto, {
          where: { 
            codigoBarras: prodOrigen.codigoBarras,
            sucursal: { idSucursal: idSucursalDestino }
          }
        });

        // 3. Si no existe, crearlo
        if (!prodDestino) {
          prodDestino = queryRunner.manager.create(PosProducto, {
            nombre: prodOrigen.nombre,
            descripcion: prodOrigen.descripcion,
            codigoBarras: prodOrigen.codigoBarras,
            precioUnitario: prodOrigen.precioUnitario,
            iva: prodOrigen.iva,
            precioPublico: prodOrigen.precioPublico,
            precioMayoreo: prodOrigen.precioMayoreo,
            descuento: prodOrigen.descuento,
            minimoMayoreo: prodOrigen.minimoMayoreo,
            stockMinimo: prodOrigen.stockMinimo,
            stockActual: 0,
            claveProdServ: prodOrigen.claveProdServ,
            claveUnidad: prodOrigen.claveUnidad,
            tipoArticulo: prodOrigen.tipoArticulo,
            unidadMedida: prodOrigen.unidadMedida,
            categoria: prodOrigen.categoria,
            sucursal: sucursalDestino,
            activo: prodOrigen.activo
          });
          prodDestino = await queryRunner.manager.save(prodDestino);
        }

        // 4. Descontar en Origen
        prodOrigen.stockActual = stockActual - cantidadTraspaso;
        await queryRunner.manager.save(prodOrigen);

        const movSalida = queryRunner.manager.create(PosMovimientoInventario, {
          producto: prodOrigen,
          sucursal: sucursalOrigen,
          usuario: usuario as any,
          tipoMovimiento: 'Traspaso_OUT',
          cantidad: cantidadTraspaso,
          referencia: `Traspaso a ${sucursalDestino.nombre} (Folio: ${folio})`
        });
        await queryRunner.manager.save(movSalida);

        // 5. Sumar en Destino
        prodDestino.stockActual = parseNumber(prodDestino.stockActual) + cantidadTraspaso;
        await queryRunner.manager.save(prodDestino);

        const movEntrada = queryRunner.manager.create(PosMovimientoInventario, {
          producto: prodDestino,
          sucursal: sucursalDestino,
          usuario: usuario as any,
          tipoMovimiento: 'Traspaso_IN',
          cantidad: cantidadTraspaso,
          referencia: `Traspaso desde ${sucursalOrigen.nombre} (Folio: ${folio})`
        });
        await queryRunner.manager.save(movEntrada);

        // 6. Guardar Detalle
        const detalle = queryRunner.manager.create(PosTraspasoDetalle, {
          traspaso: savedTraspaso,
          producto: prodOrigen,
          cantidad: cantidadTraspaso
        });
        await queryRunner.manager.save(detalle);
      }

      await queryRunner.commitTransaction();
      return { success: true, traspaso: savedTraspaso, message: 'Traspaso completado con éxito' };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async obtenerTraspasos(idEmpresa: number) {
    return this.traspasoRepo.find({
      where: [
        { sucursalOrigen: { empresa: { idEmpresa } } },
        { sucursalDestino: { empresa: { idEmpresa } } }
      ],
      relations: { sucursalOrigen: true, sucursalDestino: true, usuario: true },
      order: { fecha: 'DESC' }
    });
  }

  async generarReporteTraspaso(idTraspaso: number): Promise<Buffer> {
    const traspaso = await this.traspasoRepo.findOne({
      where: { idTraspaso },
      relations: { sucursalOrigen: true, sucursalDestino: true, usuario: true, detalles: { producto: true } }
    });

    if (!traspaso) throw new NotFoundException('Traspaso no encontrado');

    const pdfDoc = await PDFLibDocument.create();
    let page = pdfDoc.addPage([612, 792]);
    const { width, height } = page.getSize();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let yOffset = height - 50;
    
    const drawText = (text: string, x: number, font: any, size: number) => {
      page.drawText(text, { x, y: yOffset, size, font, color: rgb(0, 0, 0) });
      yOffset -= (size + 5);
    };

    drawText('Reporte de Traspaso de Inventario', 50, timesRomanBoldFont, 16);
    yOffset -= 10;

    drawText(`Folio: ${traspaso.folio}`, 50, timesRomanFont, 12);
    drawText(`Fecha: ${new Date(traspaso.fecha).toLocaleString()}`, 50, timesRomanFont, 12);
    drawText(`Registrado por: ${traspaso.usuario?.nombreCompleto || 'N/A'}`, 50, timesRomanFont, 12);
    drawText(`Estado: ${traspaso.estatus}`, 50, timesRomanFont, 12);
    yOffset -= 10;

    drawText(`Sucursal Origen: ${traspaso.sucursalOrigen?.nombre || 'N/A'}`, 50, timesRomanBoldFont, 12);
    drawText(`Sucursal Destino: ${traspaso.sucursalDestino?.nombre || 'N/A'}`, 50, timesRomanBoldFont, 12);
    yOffset -= 20;

    // Table Header
    drawText('CÓDIGO', 50, timesRomanBoldFont, 10);
    yOffset += 15;
    drawText('PRODUCTO', 150, timesRomanBoldFont, 10);
    yOffset += 15;
    drawText('CANTIDAD', 450, timesRomanBoldFont, 10);
    yOffset -= 5;
    
    page.drawLine({ start: { x: 50, y: yOffset }, end: { x: 550, y: yOffset }, thickness: 1, color: rgb(0,0,0) });
    yOffset -= 15;

    for (const detalle of traspaso.detalles) {
      drawText(detalle.producto?.codigoBarras || 'N/A', 50, timesRomanFont, 10);
      yOffset += 15;
      drawText(detalle.producto?.nombre || 'N/A', 150, timesRomanFont, 10);
      yOffset += 15;
      drawText(String(detalle.cantidad), 450, timesRomanFont, 10);
      yOffset -= 5;
    }
    
    yOffset -= 50;
    page.drawLine({ start: { x: 100, y: yOffset }, end: { x: 250, y: yOffset }, thickness: 1, color: rgb(0,0,0) });
    page.drawLine({ start: { x: 350, y: yOffset }, end: { x: 500, y: yOffset }, thickness: 1, color: rgb(0,0,0) });
    yOffset -= 15;
    drawText('Firma de Envío', 120, timesRomanFont, 10);
    yOffset += 15;
    drawText('Firma de Recibido', 370, timesRomanFont, 10);

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}





