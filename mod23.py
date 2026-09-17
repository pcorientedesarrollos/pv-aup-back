# -*- coding: utf-8 -*-
import re

with open('src/pos/pos.controller.ts', 'r', encoding='utf-8') as f:
    text = f.read()

target = '''  @Get('gastos')
  getGastos(@Headers('x-sucursal-id') idSucursal: string) {
    return this.posService.getGastos(Number(idSucursal));
  }'''

new_method = '''  @Get('gastos')
  getGastos(
    @Headers('x-sucursal-id') idSucursal: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string
  ) {
    return this.posService.getGastos(Number(idSucursal), desde, hasta);
  }'''

text = text.replace(target, new_method)

with open('src/pos/pos.controller.ts', 'w', encoding='utf-8') as f:
    f.write(text)
