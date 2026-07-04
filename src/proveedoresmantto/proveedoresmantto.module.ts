import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProveedorMantto } from './entities/proveedor-mantto.entity';
import { ProveedoresManttoService } from './proveedoresmantto.service';
import { ProveedoresManttoController } from './proveedoresmantto.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProveedorMantto])],
  controllers: [ProveedoresManttoController],
  providers: [ProveedoresManttoService],
})
export class ProveedoresManttoModule {}
