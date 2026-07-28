carrito_path = r'C:\Users\EMMA\Desktop\ESTADIAS\PROYECTO AUP PUNTO DE VENTA\PV-AUP-FRONT\src\app\features\pos\carrito\carrito.component.ts'
with open(carrito_path, 'r', encoding='utf-8') as f:
    c_content = f.read()

import re
# Find any trailing braces and spaces and replace with a single closing brace.
c_content = re.sub(r'\}\s*\}\s*$', '}\n', c_content)

with open(carrito_path, 'w', encoding='utf-8') as f:
    f.write(c_content)
