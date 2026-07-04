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
    console.log("Verificando sucursales...");
    const [sucursales] = await connection.execute('SELECT * FROM pos_sucursales');
    if (sucursales.length === 0) {
      console.log("Creando sucursal principal...");
      await connection.execute(`
        INSERT INTO pos_sucursales (nombre, direccion, telefono)
        VALUES ('Matriz Oaxaca', 'Centro', '9510000000')
      `);
    }

    console.log("Asignando sucursal 1 a registros huérfanos...");
    
    // Usuarios
    const [resU] = await connection.execute('UPDATE pos_usuarios SET id_sucursal = 1 WHERE id_sucursal IS NULL');
    console.log(`Usuarios actualizados: ${resU.affectedRows}`);
    
    // Productos
    const [resP] = await connection.execute('UPDATE pos_productos SET id_sucursal = 1 WHERE id_sucursal IS NULL');
    console.log(`Productos actualizados: ${resP.affectedRows}`);
    
    // Categorias
    const [resC] = await connection.execute('UPDATE pos_categorias SET id_sucursal = 1 WHERE id_sucursal IS NULL');
    console.log(`Categorías actualizadas: ${resC.affectedRows}`);
    
    // Clientes
    const [resCl] = await connection.execute('UPDATE pos_clientes SET id_sucursal = 1 WHERE id_sucursal IS NULL');
    console.log(`Clientes actualizados: ${resCl.affectedRows}`);

    // Ventas
    const [resV] = await connection.execute('UPDATE pos_ventas SET id_sucursal = 1 WHERE id_sucursal IS NULL');
    console.log(`Ventas actualizadas: ${resV.affectedRows}`);

    console.log("¡Listo!");
  } catch(e) {
    console.error(e);
  } finally {
    await connection.end();
  }
}

run();
