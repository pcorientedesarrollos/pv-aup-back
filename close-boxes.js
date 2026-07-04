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
    console.log("Cerrando todos los turnos abiertos...");
    const [res] = await connection.execute("UPDATE pos_cortes_caja SET estatus = 'Cerrado', fecha_cierre = NOW() WHERE estatus = 'Abierto'");
    console.log(`Cortes cerrados: ${res.affectedRows}`);
  } catch(e) {
    console.error(e);
  } finally {
    await connection.end();
  }
}

run();
