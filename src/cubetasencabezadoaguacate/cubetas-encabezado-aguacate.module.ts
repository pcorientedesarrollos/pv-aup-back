import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CubetasEncabezadoAguacate } from './entities/cubetas-encabezado-aguacate.entity';
import { CubetasEncabezadoAguacateService } from './cubetas-encabezado-aguacate.service';
import { CubetasEncabezadoAguacateController } from './cubetas-encabezado-aguacate.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CubetasEncabezadoAguacate])],
  controllers: [CubetasEncabezadoAguacateController],
  providers: [CubetasEncabezadoAguacateService],
})
export class CubetasEncabezadoAguacateModule {}
