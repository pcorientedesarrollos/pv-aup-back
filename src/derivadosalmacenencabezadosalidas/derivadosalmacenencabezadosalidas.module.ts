import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DerivadosAlmacenEncabezadoSalidasService } from './derivadosalmacenencabezadosalidas.service';
import { DerivadosAlmacenEncabezadoSalidasController } from './derivadosalmacenencabezadosalidas.controller';
import { DerivadosAlmacenEncabezadoSalidas } from './entities/derivados-almacen-encabezado-salidas.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DerivadosAlmacenEncabezadoSalidas])],
  controllers: [DerivadosAlmacenEncabezadoSalidasController],
  providers: [DerivadosAlmacenEncabezadoSalidasService],
})
export class DerivadosAlmacenEncabezadoSalidasModule {}
