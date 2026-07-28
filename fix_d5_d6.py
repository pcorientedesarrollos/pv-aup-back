import re

file_path = r'C:\Users\EMMA\Desktop\ESTADIAS\PROYECTO AUP PUNTO DE VENTA\pv-aup-back\src\pos\pos.service.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# D6: Asignar sucursal a PosCorteCaja
content = content.replace(
    "const nuevoCorte = this.corteRepo.create({",
    "const nuevoCorte = this.corteRepo.create({\n      sucursal: usuario.sucursal,"
)

# D5: pdf-parse al inicio
content = content.replace("const pdfParse = require('pdf-parse');", "")
content = content.replace("import * as bcrypt from 'bcryptjs';", "import * as bcrypt from 'bcryptjs';\nconst pdfParse = require('pdf-parse');")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("D5 and D6 done")
