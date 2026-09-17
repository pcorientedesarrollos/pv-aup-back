const fs = require('fs');

// 1. Fix backend pos.service.ts
let service = fs.readFileSync('src/pos/pos.service.ts', 'utf-8');

// Remove the wrongly appended methods at the end
const wrongMethodsIndex = service.indexOf('// --- CATEGORIAS DE GASTOS ---');
if (wrongMethodsIndex !== -1) {
    service = service.slice(0, wrongMethodsIndex).trim();
}

// Add them inside the class before the last brace
const methods = \
  // --- CATEGORIAS DE GASTOS ---
  async getCategoriasGastos() {
    return this.gastoCategoriaRepo.find({ where: { estatus: true }, order: { nombre: 'ASC' } });
  }

  async createCategoriaGasto(nombre: string) {
    if (!nombre) throw new BadRequestException('El nombre de la categoria es requerido');
    const cat = this.gastoCategoriaRepo.create({ nombre, estatus: true });
    return this.gastoCategoriaRepo.save(cat);
  }
\;

const lastBraceIndex = service.lastIndexOf('}');
service = service.slice(0, lastBraceIndex) + methods + '\\n}\\n';

// Fix the create null issue
service = service.replace(
  'categoria: payload.idCategoria ? { idCategoria: payload.idCategoria } : null,',
  'categoria: payload.idCategoria ? { idCategoria: payload.idCategoria } : undefined,'
);

fs.writeFileSync('src/pos/pos.service.ts', service, 'utf-8');
