const fs = require('fs');
let content = fs.readFileSync('src/pos/pos.service.ts', 'utf8');

// getCategorias
content = content.replace(/async getCategorias\(\) \{[\s\S]*?return this\.categoriaRepo\.find\(\{[\s\S]*?where: \{ activo: true \}[\s\S]*?\}\);[\s\S]*?\}/, 'async getCategorias(idSucursal: number) {\n    if (!idSucursal) return [];\n    return this.categoriaRepo.find({\n      where: { activo: true, sucursal: { idSucursal } }\n    });\n  }');

// getClientes
content = content.replace(/async getClientes\(\) \{\s*return this\.clienteRepo\.find\(\);\s*\}/, 'async getClientes(idSucursal: number) {\n    if (!idSucursal) return [];\n    return this.clienteRepo.find({ where: { sucursal: { idSucursal } } });\n  }');

// getUsuarios
content = content.replace(/async getUsuarios\(\) \{\s*return this\.usuarioRepo\.find\(\{ order: \{ idUsuario: 'ASC' \} \}\);\s*\}/, 'async getUsuarios(idSucursal: number) {\n    if (!idSucursal) return [];\n    return this.usuarioRepo.find({ where: { sucursal: { idSucursal } }, relations: { sucursal: true }, order: { idUsuario: "ASC" } });\n  }');

fs.writeFileSync('src/pos/pos.service.ts', content);
console.log('Patched');
