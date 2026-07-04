const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: 'mysql.apicultoresunidos.com',
    user: 'apicultores',
    password: 'oaxacaMiel65',
    database: 'apicultores2026_dev',
    port: 3306
  });

  try {
    try {
      await connection.execute(`ALTER TABLE pos_sucursales DROP FOREIGN KEY FK_959a5faea6a59139d249f202dd5`);
    } catch(e) {}
    try {
      await connection.execute(`ALTER TABLE pos_sucursales DROP FOREIGN KEY FK_empresa_sucursal`);
    } catch(e) {}
    
    try {
      await connection.execute(`ALTER TABLE pos_sucursales DROP INDEX FK_959a5faea6a59139d249f202dd5`);
    } catch(e) {}
    try {
      await connection.execute(`ALTER TABLE pos_sucursales DROP INDEX FK_empresa_sucursal`);
    } catch(e) {}

    console.log("¡Listo!");
  } catch(e) {
    console.error(e);
  } finally {
    await connection.end();
  }
}

run();
