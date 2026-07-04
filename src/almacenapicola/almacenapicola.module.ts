import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlmacenApicola } from './entities/almacen-apicola.entity';
import { AlmacenApicolaService } from './almacenapicola.service';
import { AlmacenApicolaController } from './almacenapicola.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AlmacenApicola])],
  controllers: [AlmacenApicolaController],
  providers: [AlmacenApicolaService],
})
export class AlmacenApicolaModule {}
