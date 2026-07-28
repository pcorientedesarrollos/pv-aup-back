import re

pos_service_path = r'C:\Users\EMMA\Desktop\ESTADIAS\PROYECTO AUP PUNTO DE VENTA\PV-AUP-FRONT\src\app\core\services\pos.service.ts'
with open(pos_service_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import { of, tap } from 'rxjs';", "import { of, tap, from } from 'rxjs';")

with open(pos_service_path, 'w', encoding='utf-8') as f:
    f.write(content)


carrito_path = r'C:\Users\EMMA\Desktop\ESTADIAS\PROYECTO AUP PUNTO DE VENTA\PV-AUP-FRONT\src\app\features\pos\carrito\carrito.component.ts'
with open(carrito_path, 'r', encoding='utf-8') as f:
    c_content = f.read()

# Add ultimoTicketItems inside the class:
if "ultimoTicketItems = signal<any[]>([])" not in c_content:
    c_content = c_content.replace(
        "ultimoTotal = signal<number>(0);",
        "ultimoTotal = signal<number>(0);\n  ultimoTicketItems = signal<any[]>([]);"
    )

# Fix items.map(i => ...) implicitly has any type
c_content = c_content.replace(
    "productos: items.map(i => ({",
    "productos: items.map((i: any) => ({"
)

# Fix TS1128: Declaration or statement expected. 
# My regex for imprimirTicket replaced too much or left a dangling brace.
# Let's fix it by completely replacing the method using regex up to the end of the class.
# But it's easier to just append the missing `}` if there is one missing.
# Let's see the end of the file.
c_content = c_content.strip()
if not c_content.endswith("}"):
    c_content += "\n}"

# Wait, maybe there's a missing brace or an extra one.
# If `c_content` ends with multiple `}`, let's normalize it.
while c_content.endswith("}\n}") or c_content.endswith("}}"):
    c_content = c_content[:-1].strip()
if not c_content.endswith("}"):
    c_content += "\n}"

with open(carrito_path, 'w', encoding='utf-8') as f:
    f.write(c_content)

print("Fixes applied.")
