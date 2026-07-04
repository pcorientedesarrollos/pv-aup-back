import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RelacionMovimiento } from './entities/relacion-movimiento.entity';
import { RelacionDeMovimientosService } from './relaciondemovimientos.service';
import { RelacionDeMovimientosController } from './relaciondemovimientos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RelacionMovimiento])],
  controllers: [RelacionDeMovimientosController],
  providers: [RelacionDeMovimientosService],
})
export class RelacionDeMovimientosModule {}
