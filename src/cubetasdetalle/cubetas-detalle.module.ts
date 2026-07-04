import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CubetasDetalle } from './entities/cubetas-detalle.entity';
import { CubetasDetalleService } from './cubetas-detalle.service';
import { CubetasDetalleController } from './cubetas-detalle.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CubetasDetalle])],
  controllers: [CubetasDetalleController],
  providers: [CubetasDetalleService],
})
export class CubetasDetalleModule {}
