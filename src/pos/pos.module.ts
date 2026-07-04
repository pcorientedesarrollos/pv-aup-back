import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PosController } from './pos.controller';
import { PosService } from './pos.service';

import { PosCategoria } from './entities/pos-categoria.entity';
import { PosProducto } from './entities/pos-producto.entity';
import { PosCliente } from './entities/pos-cliente.entity';
import { PosUsuario } from './entities/pos-usuario.entity';
import { PosSucursal } from './entities/pos-sucursal.entity';
import { PosCorteCaja } from './entities/pos-corte-caja.entity';
import { PosVenta } from './entities/pos-venta.entity';
import { PosVentaDetalle } from './entities/pos-venta-detalle.entity';
import { PosMovimientoInventario } from './entities/pos-movimiento-inventario.entity';
import { PosConfiguracion } from './entities/pos-configuracion.entity';
import { PosEmpresa } from './entities/pos-empresa.entity';
import { PosFactura } from './entities/pos-factura.entity';
import { PosProforma } from './entities/pos-proforma.entity';
import { PosProveedor } from './entities/pos-proveedor.entity';
import { PosCompra } from './entities/pos-compra.entity';
import { PosCompraDetalle } from './entities/pos-compra-detalle.entity';
import { PosDevolucion } from './entities/pos-devolucion.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PosCategoria,
      PosProducto,
      PosCliente,
      PosUsuario,
      PosCorteCaja,
      PosSucursal,
      PosVenta,
      PosVentaDetalle,
      PosMovimientoInventario,
      PosConfiguracion,
      PosEmpresa,
      PosFactura,
      PosProforma,
      PosProveedor,
      PosCompra,
      PosCompraDetalle,
      PosDevolucion
    ]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [PosController],
  providers: [PosService],
  exports: [PosService]
})
export class PosModule {}
