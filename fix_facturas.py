import re
import os

file_path = r'C:\Users\EMMA\Desktop\ESTADIAS\PROYECTO AUP PUNTO DE VENTA\PV-AUP-FRONT\src\app\features\facturas\facturas.component.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# S4: Validacion Regex RFC
rfc_validation = """
    const rfcRegex = /^([A-ZÑ&]{3,4}) ?(?:- ?)?(\\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\\d|3[01])) ?(?:- ?)?([A-Z\\d]{2})([A\\d])$/i;
    if (!rfcRegex.test(this.formData.rfc)) {
      this.errorFactura.set('El formato del RFC no es válido');
      return;
    }"""
content = content.replace(
    "    if (this.formData.rfc.length < 12 || this.formData.rfc.length > 13) {\n      this.errorFactura.set('El RFC debe tener 12 o 13 caracteres');\n      return;\n    }",
    rfc_validation
)

# S6: Uso CFDI
usos = """  usos = [
    { id: 'G01', nombre: 'Adquisición de mercancias' },
    { id: 'G02', nombre: 'Devoluciones, descuentos o bonificaciones' },
    { id: 'G03', nombre: 'Gastos en general' },
    { id: 'I01', nombre: 'Construcciones' },
    { id: 'I02', nombre: 'Mobilario y equipo de oficina' },
    { id: 'I03', nombre: 'Equipo de transporte' },
    { id: 'I04', nombre: 'Equipo de computo' },
    { id: 'D01', nombre: 'Honorarios médicos, dentales y gastos hospitalarios' },
    { id: 'D02', nombre: 'Gastos médicos por incapacidad' },
    { id: 'S01', nombre: 'Sin efectos fiscales' }
  ];"""
content = re.sub(r"  usos = \[\s*\{ id: 'G01',.*?\{ id: 'S01', nombre: 'Sin efectos fiscales' \}\s*\];", usos, content, flags=re.DOTALL)

# U5: Success Toast
# In emitirFactura(), after this.cargarFacturas();
success_toast = """        this.facturando.set(false);
        this.cerrarModal();
        this.cargarFacturas();
        alert('Factura emitida con éxito');"""
content = content.replace("        this.facturando.set(false);\n        this.cerrarModal();\n        this.cargarFacturas();", success_toast)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("S4, S6, U5 done")
