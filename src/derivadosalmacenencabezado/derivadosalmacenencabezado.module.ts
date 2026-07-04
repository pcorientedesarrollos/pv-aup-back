import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DerivadosAlmacenEncabezadoService } from './derivadosalmacenencabezado.service';
import { DerivadosAlmacenEncabezadoController } from './derivadosalmacenencabezado.controller';
import { DerivadosAlmacenEncabezado } from './entities/derivados-almacen-encabezado.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DerivadosAlmacenEncabezado])],
  controllers: [DerivadosAlmacenEncabezadoController],
  providers: [DerivadosAlmacenEncabezadoService],
})
export class DerivadosAlmacenEncabezadoModule {}
