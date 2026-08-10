
const mysql = require('mysql2/promise');
async function run() {
  const connection = await mysql.createConnection({
    host: 'mysql.apicultoresunidos.com',
    user: 'apicultores',
    password: 'oaxacaMiel65',
    database: 'apicultores2026_dev'
  });
  try {
     const [rows] = await connection.execute('SHOW INDEX FROM pos_productos WHERE Key_name = \'UQ_codigo_sucursal\'');
     console.log(rows);
  } catch (e) {
     console.log(e.message);
  }
  await connection.end();
}
run();

