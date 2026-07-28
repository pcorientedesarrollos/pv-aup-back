import re

file_path = r'C:\Users\EMMA\Desktop\ESTADIAS\PROYECTO AUP PUNTO DE VENTA\pv-aup-back\src\pos\pos.controller.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('payload.sucursal', '(payload as any).sucursal')
content = content.replace('payload.idSucursal =', '(payload as any).idSucursal =')
content = content.replace('payload.idUsuario =', '(payload as any).idUsuario =')
content = content.replace('payload.idUsuario ||', '(payload as any).idUsuario ||')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixes applied.")
