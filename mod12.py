import re

with open('src/pos/pos.service.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    "import { PosGasto } from './entities/pos-gasto.entity';",
    "import { PosGasto } from './entities/pos-gasto.entity';\nimport { PosGastoCategoria } from './entities/pos-gasto-categoria.entity';"
)

text = text.replace(
    "@InjectRepository(PosGasto)\n    private readonly gastoRepo: Repository<PosGasto>,",
    "@InjectRepository(PosGasto)\n    private readonly gastoRepo: Repository<PosGasto>,\n    @InjectRepository(PosGastoCategoria)\n    private readonly gastoCategoriaRepo: Repository<PosGastoCategoria>,"
)

# Modify registrarGasto
old_gasto = '''  async registrarGasto(payload: { concepto: string; monto: number }, idUsuario: number, idSucursal: number) {'''
new_gasto = '''  async registrarGasto(payload: { concepto: string; monto: number; idCategoria?: number; observaciones?: string }, idUsuario: number, idSucursal: number) {'''
text = text.replace(old_gasto, new_gasto)

old_create = '''    const gasto = this.gastoRepo.create({
      concepto: payload.concepto,
      monto: payload.monto,
      sucursal: { idSucursal },
      usuario: { idUsuario },
      corte: { idCorte: turno.idCorte }
    });'''
new_create = '''    const gasto = this.gastoRepo.create({
      concepto: payload.concepto,
      monto: payload.monto,
      observaciones: payload.observaciones,
      categoria: payload.idCategoria ? { idCategoria: payload.idCategoria } : null,
      sucursal: { idSucursal },
      usuario: { idUsuario },
      corte: { idCorte: turno.idCorte }
    });'''
text = text.replace(old_create, new_create)

# Add getCategoriasGastos
methods = '''
  // --- CATEGORIAS DE GASTOS ---
  async getCategoriasGastos() {
    return this.gastoCategoriaRepo.find({ where: { estatus: true }, order: { nombre: 'ASC' } });
  }

  async createCategoriaGasto(nombre: string) {
    if (!nombre) throw new BadRequestException('El nombre de la categoría es requerido');
    const cat = this.gastoCategoriaRepo.create({ nombre, estatus: true });
    return this.gastoCategoriaRepo.save(cat);
  }
'''

text = text + methods

with open('src/pos/pos.service.ts', 'w', encoding='utf-8') as f:
    f.write(text)
