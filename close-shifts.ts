import { DataSource } from 'typeorm';
import { PosCorteCaja } from './src/pos/entities/pos-corte-caja.entity';
import * as dotenv from 'dotenv';
dotenv.config();

const ds = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'pos_db',
  entities: [PosCorteCaja],
  synchronize: false,
});

async function run() {
  await ds.initialize();
  const repo = ds.getRepository(PosCorteCaja);
  const openShifts = await repo.find({ where: { estatus: 'Abierto' } });
  for (const shift of openShifts) {
    shift.estatus = 'Cerrado';
    shift.fechaCierre = new Date();
    await repo.save(shift);
    console.log(`Closed shift ${shift.idCorte}`);
  }
  await ds.destroy();
}
run();
