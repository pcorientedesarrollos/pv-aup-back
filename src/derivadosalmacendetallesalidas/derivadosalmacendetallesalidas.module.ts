import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DerivadosAlmacenDetalleSalidasService } from './derivadosalmacendetallesalidas.service';
import { DerivadosAlmacenDetalleSalidasController } from './derivadosalmacendetallesalidas.controller';
import { DerivadosAlmacenDetalleSalidas } from './entities/derivados-almacen-detalle-salidas.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DerivadosAlmacenDetalleSalidas])],
  controllers: [DerivadosAlmacenDetalleSalidasController],
  providers: [DerivadosAlmacenDetalleSalidasService],
})
export class DerivadosAlmacenDetalleSalidasModule {}
