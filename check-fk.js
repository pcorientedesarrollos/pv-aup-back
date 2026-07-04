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
    const [rows] = await connection.execute(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = 'apicultores2026_dev' 
        AND TABLE_NAME = 'pos_sucursales' 
        AND REFERENCED_TABLE_NAME IS NOT NULL;
    `);
    console.log("Foreign keys en pos_sucursales:", rows);
  } catch(e) {
    console.error(e);
  } finally {
    await connection.end();
  }
}

run();
