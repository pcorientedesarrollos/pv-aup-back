# -*- coding: utf-8 -*-
import re

with open('src/pos/pos.controller.ts', 'r', encoding='utf-8') as f:
    text = f.read()

methods = '''
  @Get('gastos/categorias')
  getCategoriasGastos() {
    return this.posService.getCategoriasGastos();
  }

  @Post('gastos/categorias')
  createCategoriaGasto(@Body() payload: { nombre: string }) {
    return this.posService.createCategoriaGasto(payload.nombre);
  }
'''

# insert before last closing brace
text = text[:text.rfind('}')] + methods + '}\n'

with open('src/pos/pos.controller.ts', 'w', encoding='utf-8') as f:
    f.write(text)
