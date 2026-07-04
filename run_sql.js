const mysql = require('mysql2/promise');
const fs = require('fs');

async function run() {
  const connection = await mysql.createConnection({
    host: 'mysql.apicultoresunidos.com',
    user: 'apicultores',
    password: 'oaxacaMiel65',
    database: 'apicultores2026_dev',
    multipleStatements: true
  });

  try {
    const sql = fs.readFileSync('pos_schema.sql', 'utf8');
    await connection.query(sql);
    console.log('Migración ejecutada con éxito!');
  } catch (err) {
    console.error('Error ejecutando migración:', err);
  } finally {
    await connection.end();
  }
}

run();
