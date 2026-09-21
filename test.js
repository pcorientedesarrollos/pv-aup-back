const { Client } = require('pg');
const client = new Client({ connectionString: 'postgres://postgres:S2yGvN4M$8rP@viaduct.proxy.rlwy.net:18274/railway' });
client.connect().then(() => {
  client.query('SELECT nombre, "precioCompra", "precioUnitario", "precioPublico", "precioVenta", utilidad, "aplicaIva", iva FROM pos_productos WHERE nombre LIKE \'%MIEL%\'').then(res => {
    console.log(res.rows);
    client.end();
  });
});
