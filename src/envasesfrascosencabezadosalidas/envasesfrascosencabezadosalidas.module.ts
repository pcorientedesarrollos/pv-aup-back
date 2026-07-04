import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvasesFrascosEncabezadoSalidasService } from './envasesfrascosencabezadosalidas.service';
import { EnvasesFrascosEncabezadoSalidasController } from './envasesfrascosencabezadosalidas.controller';
import { EnvasesFrascosEncabezadoSalidas } from './entities/envases-frascos-encabezado-salidas.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EnvasesFrascosEncabezadoSalidas])],
  controllers: [EnvasesFrascosEncabezadoSalidasController],
  providers: [EnvasesFrascosEncabezadoSalidasService],
})
export class EnvasesFrascosEncabezadoSalidasModule {}
