# -*- coding: utf-8 -*-
import re

with open('src/pos/pos.service.ts', 'r', encoding='utf-8') as f:
    service = f.read()

# Remove the wrongly appended methods at the end
wrong_idx = service.find('// --- CATEGORIAS DE GASTOS ---')
if wrong_idx != -1:
    service = service[:wrong_idx].strip()

methods = '''
  // --- CATEGORIAS DE GASTOS ---
  async getCategoriasGastos() {
    return this.gastoCategoriaRepo.find({ where: { estatus: true }, order: { nombre: 'ASC' } });
  }

  async createCategoriaGasto(nombre: string) {
    if (!nombre) throw new BadRequestException('El nombre de la categoria es requerido');
    const cat = this.gastoCategoriaRepo.create({ nombre, estatus: true });
    return this.gastoCategoriaRepo.save(cat);
  }
'''

last_brace = service.rfind('}')
if last_brace != -1:
    service = service[:last_brace] + methods + '\n}\n'

# Fix the create null issue
service = service.replace(
  'categoria: payload.idCategoria ? { idCategoria: payload.idCategoria } : null,',
  'categoria: payload.idCategoria ? { idCategoria: payload.idCategoria } : undefined,'
)

with open('src/pos/pos.service.ts', 'w', encoding='utf-8') as f:
    f.write(service)
