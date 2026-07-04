import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvasesFrascosDetalleSalidasService } from './envasesfrascosdetallesalidas.service';
import { EnvasesFrascosDetalleSalidasController } from './envasesfrascosdetallesalidas.controller';
import { EnvasesFrascosDetalleSalidas } from './entities/envases-frascos-detalle-salidas.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EnvasesFrascosDetalleSalidas])],
  controllers: [EnvasesFrascosDetalleSalidasController],
  providers: [EnvasesFrascosDetalleSalidasService],
})
export class EnvasesFrascosDetalleSalidasModule {}
