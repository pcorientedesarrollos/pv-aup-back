import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Localidad } from './entities/localidad.entity';
import { LocalidadesService } from './localidades.service';
import { LocalidadesController } from './localidades.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Localidad])],
  controllers: [LocalidadesController],
  providers: [LocalidadesService],
})
export class LocalidadesModule {}
