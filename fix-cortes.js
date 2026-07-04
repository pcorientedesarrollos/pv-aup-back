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
    console.log("Asignando sucursal 1 a registros huérfanos de cortes...");
    const [res] = await connection.execute('UPDATE pos_cortes_caja SET id_sucursal = 1 WHERE id_sucursal IS NULL');
    console.log(`Cortes actualizados: ${res.affectedRows}`);
    
    const [resM] = await connection.execute('UPDATE pos_movimientos_inventario SET id_sucursal = 1 WHERE id_sucursal IS NULL');
    console.log(`Movimientos actualizados: ${resM.affectedRows}`);
  } catch(e) {
    console.error(e);
  } finally {
    await connection.end();
  }
}

run();
