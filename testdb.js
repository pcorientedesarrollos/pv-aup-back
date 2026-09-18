const mysql = require('mysql2/promise');
require('dotenv').config();

async function test() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });
  
  const [rows] = await conn.execute('SELECT * FROM pos_cortes_caja WHERE id_corte = 24');
  console.log('Corte 24:', rows[0]);
  
  const [compras] = await conn.execute('SELECT id_compra, fecha_compra FROM pos_compras ORDER BY id_compra DESC LIMIT 5');
  console.log('Compras:', compras);
  
  await conn.end();
}
test().catch(console.error);
