import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvasesFrascosEncabezadoEntradasService } from './envasesfrascosencabezadoentradas.service';
import { EnvasesFrascosEncabezadoEntradasController } from './envasesfrascosencabezadoentradas.controller';
import { EnvasesFrascosEncabezadoEntradas } from './entities/envases-frascos-encabezado-entradas.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EnvasesFrascosEncabezadoEntradas])],
  controllers: [EnvasesFrascosEncabezadoEntradasController],
  providers: [EnvasesFrascosEncabezadoEntradasService],
})
export class EnvasesFrascosEncabezadoEntradasModule {}
