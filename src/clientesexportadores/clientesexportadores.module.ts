import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClienteExportador } from './entities/cliente-exportador.entity';
import { ClientesExportadoresService } from './clientesexportadores.service';
import { ClientesExportadoresController } from './clientesexportadores.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ClienteExportador])],
  controllers: [ClientesExportadoresController],
  providers: [ClientesExportadoresService],
})
export class ClientesExportadoresModule {}
