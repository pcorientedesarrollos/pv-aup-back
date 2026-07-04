import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlmacenNaranjo } from './entities/almacen-naranjo.entity';
import { AlmacenNaranjoService } from './almacen-naranjo.service';
import { AlmacenNaranjoController } from './almacen-naranjo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AlmacenNaranjo])],
  controllers: [AlmacenNaranjoController],
  providers: [AlmacenNaranjoService],
})
export class AlmacenNaranjoModule {}
