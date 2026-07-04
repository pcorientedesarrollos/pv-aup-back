const fs = require('fs');
let content = fs.readFileSync('src/pos/pos.service.ts', 'utf8');

content = content.replace(/async getMovimientosInventario\(\) \{/, "async getMovimientosInventario(idSucursal: number) {\n    if (!idSucursal) return [];");
content = content.replace(/return this\.movimientoRepo\.find\(\{/, "return this.movimientoRepo.find({\n      where: { usuario: { sucursal: { idSucursal } } },");

// Dashboard stats: we need to replace the where clauses
content = content.replace(/async getDashboardStats\(\) \{/, "async getDashboardStats(idSucursal: number) {\n    if (!idSucursal) return null;");

content = content.replace(/\.where\('v\.fechaVenta >= :inicio', \{ inicio: inicioHoy \}\)/g, ".where('v.fechaVenta >= :inicio', { inicio: inicioHoy }).leftJoin('v.usuario', 'u').andWhere('u.id_sucursal = :idSucursal', { idSucursal })");
content = content.replace(/\.where\('v\.fechaVenta >= :inicio', \{ inicio: inicioSemana \}\)/g, ".where('v.fechaVenta >= :inicio', { inicio: inicioSemana }).leftJoin('v.usuario', 'u').andWhere('u.id_sucursal = :idSucursal', { idSucursal })");

// Top 5 products
content = content.replace(/\.createQueryBuilder\('d'\)/g, ".createQueryBuilder('d').leftJoin('d.venta', 'v').leftJoin('v.usuario', 'u').where('u.id_sucursal = :idSucursal', { idSucursal })");

// Grafica 
content = content.replace(/\.createQueryBuilder\('v'\)\s*\.where\('v\.fechaVenta >= :inicioMes', \{ inicioMes \}\)/, ".createQueryBuilder('v').where('v.fechaVenta >= :inicioMes', { inicioMes }).leftJoin('v.usuario', 'u').andWhere('u.id_sucursal = :idSucursal', { idSucursal })");

fs.writeFileSync('src/pos/pos.service.ts', content);
console.log('Patched dashboard and inventory');
