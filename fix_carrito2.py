carrito_path = r'C:\Users\EMMA\Desktop\ESTADIAS\PROYECTO AUP PUNTO DE VENTA\PV-AUP-FRONT\src\app\features\pos\carrito\carrito.component.ts'
with open(carrito_path, 'r', encoding='utf-8') as f:
    c_content = f.read()

import re

if "ultimoTicketItems" not in c_content:
    c_content = c_content.replace(
        "ultimoTotal = signal(0);",
        "ultimoTotal = signal(0);\n  ultimoTicketItems = signal<any[]>([]);"
    )

c_content = c_content.strip()
if not c_content.endswith("}"):
    c_content += "\n}"

with open(carrito_path, 'w', encoding='utf-8') as f:
    f.write(c_content)
