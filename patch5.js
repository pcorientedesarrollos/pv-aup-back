const fs = require('fs');
let content = fs.readFileSync('src/pos/pos.controller.ts', 'utf8');

content = content.replace(/crearProducto\(@Body\(\) body: any\)/, 'crearProducto(@Headers("x-sucursal-id") idSucursal: string, @Body() body: any)');
content = content.replace(/return this\.posService\.crearProducto\(body\);/, 'body.idSucursal = Number(idSucursal);\n    return this.posService.crearProducto(body);');

content = content.replace(/crearCliente\(@Body\(\) payload: any\)/, 'crearCliente(@Headers("x-sucursal-id") idSucursal: string, @Body() payload: any)');
content = content.replace(/return this\.posService\.crearCliente\(payload\);/, 'payload.idSucursal = Number(idSucursal);\n    return this.posService.crearCliente(payload);');

content = content.replace(/crearUsuario\(@Body\(\) payload: any\)/, 'crearUsuario(@Headers("x-sucursal-id") idSucursal: string, @Body() payload: any)');
content = content.replace(/return this\.posService\.crearUsuario\(payload\);/, 'payload.idSucursal = Number(idSucursal);\n    return this.posService.crearUsuario(payload);');

fs.writeFileSync('src/pos/pos.controller.ts', content);

let service = fs.readFileSync('src/pos/pos.service.ts', 'utf8');

service = service.replace(/const nuevo = this\.clienteRepo\.create\(payload\);/, 'const nuevo = this.clienteRepo.create({ ...payload, sucursal: { idSucursal: payload.idSucursal } });');

service = service.replace(/const nuevo = this\.usuarioRepo\.create\(\{/, 'const nuevo = this.usuarioRepo.create({\n      sucursal: { idSucursal: payload.idSucursal },');

service = service.replace(/const payload: any = \{/, 'const payloadPayload: any = {\n      sucursal: { idSucursal: data.idSucursal },');
service = service.replace(/const producto = this\.productoRepo\.create\(payload\);/, 'const producto = this.productoRepo.create(payloadPayload);');

fs.writeFileSync('src/pos/pos.service.ts', service);
console.log('Patched POSTs');
