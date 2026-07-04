import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CubetasDetalleAguacate } from './entities/cubetas-detalle-aguacate.entity';
import { CubetasDetalleAguacateService } from './cubetas-detalle-aguacate.service';
import { CubetasDetalleAguacateController } from './cubetas-detalle-aguacate.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CubetasDetalleAguacate])],
  controllers: [CubetasDetalleAguacateController],
  providers: [CubetasDetalleAguacateService],
})
export class CubetasDetalleAguacateModule {}
