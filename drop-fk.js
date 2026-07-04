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
    console.log("Intentando eliminar FK_empresa_sucursal de pos_sucursales...");
    try {
      await connection.execute(`ALTER TABLE pos_sucursales DROP FOREIGN KEY FK_empresa_sucursal`);
      console.log("Foreign Key eliminada.");
    } catch(e) {
      console.log("No se pudo eliminar FK (tal vez no exista):", e.message);
    }
    
    try {
      await connection.execute(`ALTER TABLE pos_sucursales DROP INDEX FK_empresa_sucursal`);
      console.log("Índice eliminado.");
    } catch(e) {
      console.log("No se pudo eliminar Índice (tal vez no exista):", e.message);
    }

    console.log("¡Listo!");
  } catch(e) {
    console.error(e);
  } finally {
    await connection.end();
  }
}

run();
