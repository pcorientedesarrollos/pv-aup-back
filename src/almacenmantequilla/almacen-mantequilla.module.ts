import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlmacenMantequilla } from './entities/almacen-mantequilla.entity';
import { AlmacenMantequillaService } from './almacen-mantequilla.service';
import { AlmacenMantequillaController } from './almacen-mantequilla.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AlmacenMantequilla])],
  controllers: [AlmacenMantequillaController],
  providers: [AlmacenMantequillaService],
})
export class AlmacenMantequillaModule {}
