const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: 'mysql.apicultoresunidos.com',
    user: 'apicultores',
    password: 'oaxacaMiel65',
    database: 'apicultores2026_dev',
    multipleStatements: true
  });

  try {
    console.log('Migrando usuarios...');
    await connection.query(`
      INSERT INTO pos_usuarios (id_usuario, nombre_completo, nombre_usuario, contrasena_hash, rol)
      SELECT idUsuario, usuario, usuario, password, IF(idPerfil=1, 'Administrador', 'Cajero')
      FROM usuarios
      ON DUPLICATE KEY UPDATE nombre_completo=VALUES(nombre_completo);
    `);

    console.log('Migrando categorias (usando subcuentas)...');
    await connection.query(`
      INSERT INTO pos_categorias (id_categoria, nombre)
      SELECT idSubcuenta, subcuenta
      FROM subcuentas
      ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
    `);

    console.log('Migrando productos (usando subsubcuentas)...');
    await connection.query(`
      INSERT INTO pos_productos (id_producto, codigo_barras, nombre, precio_unitario, precio_publico, stock_actual, id_categoria)
      SELECT 
        s.idSubSubcuenta, 
        s.codigoBarras, 
        s.subSubcuenta, 
        s.precioUnitario, 
        s.precioUnitario, 
        0,
        s.idSubcuenta
      FROM subsubcuentas s
      WHERE s.codigoBarras IS NOT NULL AND s.codigoBarras != ''
      ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
    `);

    console.log('Migrando clientes...');
    await connection.query(`
      INSERT INTO pos_clientes (id_cliente, nombre_completo, telefono, direccion)
      SELECT idCliente, nombre, telefono, domicilio
      FROM clientes
      ON DUPLICATE KEY UPDATE nombre_completo=VALUES(nombre_completo);
    `);

    console.log('Datos migrados con éxito!');
  } catch (err) {
    console.error('Error ejecutando migración de datos:', err);
  } finally {
    await connection.end();
  }
}

run();
