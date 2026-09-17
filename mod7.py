import re

with open('src/pos/pos.service.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    "where: { usuario: { idUsuario }, estatus: 'Abierto' }",
    "where: { usuario: { sucursal: { idSucursal } }, estatus: 'Abierto' }"
)

with open('src/pos/pos.service.ts', 'w', encoding='utf-8') as f:
    f.write(text)
