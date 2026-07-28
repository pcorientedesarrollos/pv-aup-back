import re

inv_path = r'C:\Users\EMMA\Desktop\ESTADIAS\PROYECTO AUP PUNTO DE VENTA\PV-AUP-FRONT\src\app\features\inventario\inventario.ts'
prov_path = r'C:\Users\EMMA\Desktop\ESTADIAS\PROYECTO AUP PUNTO DE VENTA\PV-AUP-FRONT\src\app\features\proveedores\proveedores.component.ts'

with open(inv_path, 'r', encoding='utf-8') as f:
    inv_content = f.read()

# D4: Delete getProductosFiltradosPorPestana
inv_content = re.sub(r"  getProductosFiltradosPorPestana\(\) \{.*?\n  \}\n\n", "", inv_content, flags=re.DOTALL)

# U2: Success toast for inventario
inv_content = inv_content.replace(
    "          this.cargarDatos(activeTab); // Recargar tabla\n        }",
    "          this.cargarDatos(activeTab); // Recargar tabla\n        }\n        alert('Entrada de inventario registrada con éxito');"
)

with open(inv_path, 'w', encoding='utf-8') as f:
    f.write(inv_content)

with open(prov_path, 'r', encoding='utf-8') as f:
    prov_content = f.read()

# U7: Loading state in eliminarProveedor
prov_elim = """  eliminarProveedor(p: any) {
    if (!confirm(`¿Eliminar a ${p.nombre}?`)) return;
    this.cargando.set(true);
    this.http.delete(`${this.API}/proveedores/${p.idProveedor}`, { headers: this.headers }).subscribe({
      next: () => this.cargarProveedores(),
      error: () => { this.cargando.set(false); alert('Error al eliminar'); }
    });
  }"""
prov_content = re.sub(r"  eliminarProveedor\(p: any\) \{.*?\n  \}", prov_elim, prov_content, flags=re.DOTALL)

with open(prov_path, 'w', encoding='utf-8') as f:
    f.write(prov_content)

print("U2, U7, D4 done")
