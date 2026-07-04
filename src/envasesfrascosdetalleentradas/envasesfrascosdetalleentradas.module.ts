import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvasesFrascosDetalleEntradasService } from './envasesfrascosdetalleentradas.service';
import { EnvasesFrascosDetalleEntradasController } from './envasesfrascosdetalleentradas.controller';
import { EnvasesFrascosDetalleEntradas } from './entities/envases-frascos-detalle-entradas.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EnvasesFrascosDetalleEntradas])],
  controllers: [EnvasesFrascosDetalleEntradasController],
  providers: [EnvasesFrascosDetalleEntradasService],
})
export class EnvasesFrascosDetalleEntradasModule {}
