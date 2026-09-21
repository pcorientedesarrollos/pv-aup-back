import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { PosCliente } from '../pos/entities/pos-cliente.entity';
import { PosVenta } from '../pos/entities/pos-venta.entity';
import { PosVentaDetalle } from '../pos/entities/pos-venta-detalle.entity';
import { PosProducto } from '../pos/entities/pos-producto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PosCliente, PosVenta, PosVentaDetalle, PosProducto])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
