import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DerivadosAlmacenDetalleService } from './derivadosalmacendetalle.service';
import { DerivadosAlmacenDetalleController } from './derivadosalmacendetalle.controller';
import { DerivadosAlmacenDetalle } from './entities/derivados-almacen-detalle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DerivadosAlmacenDetalle])],
  controllers: [DerivadosAlmacenDetalleController],
  providers: [DerivadosAlmacenDetalleService],
})
export class DerivadosAlmacenDetalleModule {}
