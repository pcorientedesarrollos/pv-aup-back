
const mysql = require('mysql2/promise');
async function run() {
  const connection = await mysql.createConnection({
    host: 'mysql.apicultoresunidos.com',
    user: 'apicultores',
    password: 'oaxacaMiel65',
    database: 'apicultores2026_dev'
  });
  
  try {
    const [prods] = await connection.query('SELECT id_producto, nombre FROM pos_productos ORDER BY id_producto DESC LIMIT 5');
    console.log('Recent products:', prods);
    
    await connection.query('UPDATE pos_categorias SET nombre = \'ALMACENAMIENTO\' WHERE nombre = \'ALMACANAMIENTO\'');
    await connection.query('UPDATE pos_categorias SET nombre = \'MEMORIAS RAM\' WHERE nombre = \'MEMORIOAS RAM\'');
    console.log('Fixed category names.');
    
    await connection.query('DELETE FROM pos_categorias WHERE id_empresa IS NULL');
    console.log('Deleted orphaned categories.');

    await connection.query('DELETE FROM pos_movimientos_inventario WHERE id_producto >= 1211');
    await connection.query('DELETE FROM pos_productos_codigos WHERE id_producto >= 1211');
    const [delRes] = await connection.query('DELETE FROM pos_productos WHERE id_producto >= 1211');
    console.log('Deleted newly imported products (if any):', delRes.affectedRows);
    
  } catch (e) {
    console.error(e);
  } finally {
    await connection.end();
  }
}
run();
