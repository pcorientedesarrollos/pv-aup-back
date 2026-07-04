require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  await connection.query(`
    CREATE TABLE IF NOT EXISTS configuracion (
      idConfiguracion INT AUTO_INCREMENT PRIMARY KEY,
      nombreNegocio VARCHAR(150) NOT NULL,
      direccion VARCHAR(255),
      telefono VARCHAR(50),
      rfc VARCHAR(50),
      mensajeTicket TEXT,
      anchoTicket VARCHAR(50) DEFAULT '58mm',
      imprimirLogo BOOLEAN DEFAULT FALSE
    );
  `);
  console.log("Table created!");
  process.exit(0);
}

main().catch(console.error);
