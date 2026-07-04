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
    console.log("Creando tabla pos_empresas si no existe...");
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS pos_empresas (
        id_empresa int NOT NULL AUTO_INCREMENT,
        nombre varchar(255) NOT NULL,
        logoUrl varchar(500) DEFAULT NULL,
        activa tinyint NOT NULL DEFAULT 1,
        fecha_creacion datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id_empresa)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log("Insertando Empresa principal (AUP)...");
    const [empresas] = await connection.execute('SELECT * FROM pos_empresas');
    if (empresas.length === 0) {
      await connection.execute(`
        INSERT INTO pos_empresas (nombre, logoUrl) VALUES ('AUP POS', '/logo.png')
      `);
    }

    console.log("Añadiendo columna id_empresa a pos_sucursales si no existe...");
    try {
      await connection.execute(`
        ALTER TABLE pos_sucursales ADD COLUMN id_empresa int DEFAULT NULL;
      `);
      console.log("Columna creada.");
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
    }

    console.log("Asignando empresa 1 a sucursales existentes...");
    await connection.execute('UPDATE pos_sucursales SET id_empresa = 1 WHERE id_empresa IS NULL');
    
    console.log("Agregando Foreign Key a pos_sucursales...");
    try {
      await connection.execute(`
        ALTER TABLE pos_sucursales
        ADD CONSTRAINT FK_empresa_sucursal FOREIGN KEY (id_empresa) REFERENCES pos_empresas(id_empresa)
      `);
      console.log("FK creada.");
    } catch(e) {
      if (!e.message.includes('Duplicate key')) throw e;
    }

    console.log("¡Listo!");
  } catch(e) {
    console.error(e);
  } finally {
    await connection.end();
  }
}

run();
