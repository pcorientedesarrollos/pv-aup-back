
const mysql = require('mysql2/promise');
async function run() {
  const connection = await mysql.createConnection({
    host: 'mysql.apicultoresunidos.com',
    user: 'apicultores',
    password: 'oaxacaMiel65',
    database: 'apicultores2026_dev'
  });
  
  try {
    const [rows] = await connection.execute('SELECT * FROM pos_categorias WHERE LOWER(nombre) = LOWER(\'almacenamiento\')');
    console.log(rows);
  } catch (e) {
    console.error(e);
  } finally {
    await connection.end();
  }
}
run();

