import re
import os

pos_service_path = r'C:\Users\EMMA\Desktop\ESTADIAS\PROYECTO AUP PUNTO DE VENTA\PV-AUP-FRONT\src\app\core\services\pos.service.ts'
carrito_path = r'C:\Users\EMMA\Desktop\ESTADIAS\PROYECTO AUP PUNTO DE VENTA\PV-AUP-FRONT\src\app\features\pos\carrito\carrito.component.ts'

with open(pos_service_path, 'r', encoding='utf-8') as f:
    pos_content = f.read()

# Fix U4: Make checkout return an observable that awaits guardarVentaPendiente
old_offline_logic = """    if (!this.sync.isOnline()) {
      // Guardar localmente
      this.sync.guardarVentaPendiente(payload);
      return of({
        success: true,
        mensaje: 'Venta guardada en modo offline. Se sincronizará automáticamente.',
        offline: true
      });
    }"""
new_offline_logic = """    if (!this.sync.isOnline()) {
      // Guardar localmente
      return from(this.sync.guardarVentaPendiente(payload).then(() => ({
        success: true,
        mensaje: 'Venta guardada en modo offline. Se sincronizará automáticamente.',
        offline: true
      })));
    }"""
pos_content = pos_content.replace(old_offline_logic, new_offline_logic)
if "import { of } from" in pos_content and "from" not in pos_content:
    pos_content = pos_content.replace("import { of } from 'rxjs';", "import { of, from } from 'rxjs';")
elif "import { of, BehaviorSubject" in pos_content:
     pos_content = pos_content.replace("import { of, BehaviorSubject", "import { of, from, BehaviorSubject")

with open(pos_service_path, 'w', encoding='utf-8') as f:
    f.write(pos_content)


with open(carrito_path, 'r', encoding='utf-8') as f:
    car_content = f.read()

# Fix A8: Store ultimoTicketItems
if "ultimoTicketItems = signal<any[]>([]);" not in car_content:
    car_content = car_content.replace(
        "ultimoTotal = signal<number>(0);",
        "ultimoTotal = signal<number>(0);\n  ultimoTicketItems = signal<any[]>([]);"
    )

car_content = car_content.replace(
    "this.ultimoTotal.set(payload.totalPagado);",
    "this.ultimoTotal.set(payload.totalPagado);\n    this.ultimoTicketItems.set(payload.detalles.map(d => ({ producto: { nombre: this.pos.carrito().find(c => c.producto.idProducto === d.idProducto)?.producto.nombre || 'Producto', precioUnitario: d.precioUnitario }, cantidad: d.cantidad })));"
)

# ImprimirTicket update
imprimir_ticket = """  imprimirTicket() {
    const cliente = this.pos.clienteSeleccionado();
    const items = this.ultimoTicketItems().length > 0 ? this.ultimoTicketItems() : this.pos.carrito();
    const ventaSimulada = {
      id: 'Última Venta',
      fecha: new Date().toLocaleString(),
      nombreUsuario: this.auth.sesion()?.usuario || 'Admin',
      nombreCliente: cliente?.nombreCompleto || 'PÚBLICO GENERAL',
      descuento: this.descuentoGlobal(),
      totalCobrado: this.ultimoTotal(),
      metodoPago: this.metodoPago(),
      productos: items.map(i => ({
        nombre: i.producto.nombre,
        cantidad: i.cantidad,
        precioUnitario: i.producto.precioUnitario,
        subtotal: i.cantidad * i.producto.precioUnitario
      }))
    };
    
    this.printer.imprimirTicketVenta(ventaSimulada);
  }"""
car_content = re.sub(r"  imprimirTicket\(\) \{.*?(?=\s+\}\s+\})", imprimir_ticket, car_content, flags=re.DOTALL)

with open(carrito_path, 'w', encoding='utf-8') as f:
    f.write(car_content)

print("U4 and A8 done")
