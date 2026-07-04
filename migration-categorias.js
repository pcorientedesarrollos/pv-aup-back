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
    const [result] = await connection.execute(`
      UPDATE pos_categorias 
      SET id_empresa = 1 
      WHERE id_empresa IS NULL
    `);
    console.log("Categorias actualizadas a empresa 1:", result.affectedRows);
  } catch(e) {
    console.error(e);
  } finally {
    await connection.end();
  }
}

run();
