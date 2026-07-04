const fs = require('fs');
let content = fs.readFileSync('src/pos/pos.service.ts', 'utf8');

// getAllCortes
content = content.replace(/async getAllCortes\(\) \{\s*return this\.corteRepo\.find\(\{\s*relations: \{ usuario: true \},\s*order: \{ fechaApertura: 'DESC' \}\s*\}\);\s*\}/, 
"async getAllCortes(idSucursal: number) {\n    if (!idSucursal) return [];\n    return this.corteRepo.find({\n      where: { usuario: { sucursal: { idSucursal } } },\n      relations: { usuario: { sucursal: true } },\n      order: { fechaApertura: 'DESC' }\n    });\n  }");

// getVentas
content = content.replace(/async getVentas\(\) \{\s*return this\.ventaRepo\.find\(\{\s*relations: \{\s*usuario: true,\s*corte: true,\s*detalles: \{\s*producto: true\s*\}\s*\},\s*order: \{ fecha: 'DESC' \}\s*\}\);\s*\}/, 
"async getVentas(idSucursal: number) {\n    if (!idSucursal) return [];\n    return this.ventaRepo.find({\n      where: { usuario: { sucursal: { idSucursal } } },\n      relations: {\n        usuario: { sucursal: true },\n        corte: true,\n        detalles: {\n          producto: true\n        }\n      },\n      order: { fecha: 'DESC' }\n    });\n  }");

fs.writeFileSync('src/pos/pos.service.ts', content);
console.log('Patched');
