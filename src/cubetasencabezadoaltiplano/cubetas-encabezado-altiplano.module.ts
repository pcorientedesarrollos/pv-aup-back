import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CubetasEncabezadoAltiplano } from './entities/cubetas-encabezado-altiplano.entity';
import { CubetasEncabezadoAltiplanoService } from './cubetas-encabezado-altiplano.service';
import { CubetasEncabezadoAltiplanoController } from './cubetas-encabezado-altiplano.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CubetasEncabezadoAltiplano])],
  controllers: [CubetasEncabezadoAltiplanoController],
  providers: [CubetasEncabezadoAltiplanoService],
})
export class CubetasEncabezadoAltiplanoModule {}
