import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlmacenCera } from './entities/almacen-cera.entity';
import { AlmacenCeraService } from './almacencera.service';
import { AlmacenCeraController } from './almacencera.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AlmacenCera])],
  controllers: [AlmacenCeraController],
  providers: [AlmacenCeraService],
})
export class AlmacenCeraModule {}
