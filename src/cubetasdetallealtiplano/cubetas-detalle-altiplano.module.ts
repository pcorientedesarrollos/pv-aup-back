import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CubetasDetalleAltiplano } from './entities/cubetas-detalle-altiplano.entity';
import { CubetasDetalleAltiplanoService } from './cubetas-detalle-altiplano.service';
import { CubetasDetalleAltiplanoController } from './cubetas-detalle-altiplano.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CubetasDetalleAltiplano])],
  controllers: [CubetasDetalleAltiplanoController],
  providers: [CubetasDetalleAltiplanoService],
})
export class CubetasDetalleAltiplanoModule {}
