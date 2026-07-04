import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuentaBancaria } from './entities/cuenta-bancaria.entity';
import { CuentasBancariasService } from './cuentasbancarias.service';
import { CuentasBancariasController } from './cuentasbancarias.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CuentaBancaria])],
  controllers: [CuentasBancariasController],
  providers: [CuentasBancariasService],
})
export class CuentasBancariasModule {}
