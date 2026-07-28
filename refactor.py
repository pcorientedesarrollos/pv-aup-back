import re

file_path = r'C:\Users\EMMA\Desktop\ESTADIAS\PROYECTO AUP PUNTO DE VENTA\pv-aup-back\src\pos\pos.controller.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports
imports = """
import { LoginDto } from './dto/auth.dto';
import { CrearSucursalDto, ActualizarSucursalDto } from './dto/sucursal.dto';
import { ClienteDto } from './dto/cliente.dto';
import { UsuarioDto } from './dto/usuario.dto';
import { CheckoutDto } from './dto/venta.dto';
import { InventarioDto, EditarMovimientoDto } from './dto/inventario.dto';
import { EmpresaDto } from './dto/empresa.dto';
import { CategoriaDto } from './dto/categoria.dto';
import { ConfiguracionDto } from './dto/configuracion.dto';
import { GenerarProformaDto } from './dto/proforma.dto';
"""
content = re.sub(r"(import \{ Controller[^\n]+;\n)", r"\1" + imports, content)

# Replace methods
content = re.sub(r'login\(@Body\(\) payload: any\)', r'login(@Body() payload: LoginDto)', content)
content = re.sub(r'crearSucursal\(@Headers\("x-empresa-id"\) idEmpresa: string, @Body\(\) payload: any\)', r'crearSucursal(@Headers("x-empresa-id") idEmpresa: string, @Body() payload: CrearSucursalDto)', content)
content = re.sub(r'actualizarSucursal\(@Param\(\'id\'\) id: string, @Body\(\) payload: any\)', r'actualizarSucursal(@Param("id") id: string, @Body() payload: ActualizarSucursalDto)', content)
content = re.sub(r'crearCliente\(@Headers\("x-sucursal-id"\) idSucursal: string, @Body\(\) payload: any\)', r'crearCliente(@Headers("x-sucursal-id") idSucursal: string, @Body() payload: ClienteDto)', content)
content = re.sub(r'actualizarCliente\(@Param\(\'id\'\) id: number, @Body\(\) payload: any\)', r'actualizarCliente(@Param("id") id: number, @Body() payload: ClienteDto)', content)
content = re.sub(r'crearUsuario\(@Headers\("x-sucursal-id"\) idSucursal: string, @Body\(\) payload: any\)', r'crearUsuario(@Headers("x-sucursal-id") idSucursal: string, @Body() payload: UsuarioDto)', content)
content = re.sub(r'actualizarUsuario\(@Param\(\'id\'\) id: string, @Body\(\) payload: any\)', r'actualizarUsuario(@Param("id") id: string, @Body() payload: UsuarioDto)', content)
content = re.sub(r'checkout\(@Body\(\) payload: any\)', r'checkout(@Body() payload: CheckoutDto)', content)
content = re.sub(r'registrarEntradaInventario\(@Headers\("x-sucursal-id"\) idSucursal: string, @Headers\("x-usuario-id"\) idUsuarioHeader: string, @Body\(\) payload: any\)', r'registrarEntradaInventario(@Headers("x-sucursal-id") idSucursal: string, @Headers("x-usuario-id") idUsuarioHeader: string, @Body() payload: InventarioDto)', content)
content = re.sub(r'editarMovimiento\(@Param\(\'id\'\) id: string, @Body\(\) payload: any\)', r'editarMovimiento(@Param("id") id: string, @Body() payload: EditarMovimientoDto)', content)
content = re.sub(r'crearEmpresa\(@Body\(\) payload: any\)', r'crearEmpresa(@Body() payload: EmpresaDto)', content)
content = re.sub(r'actualizarEmpresa\(@Param\(\'id\'\) id: string, @Body\(\) payload: any\)', r'actualizarEmpresa(@Param("id") id: string, @Body() payload: EmpresaDto)', content)
content = re.sub(r'crearCategoria\(@Headers\("x-sucursal-id"\) idSucursal: string, @Body\(\) payload: any\)', r'crearCategoria(@Headers("x-sucursal-id") idSucursal: string, @Body() payload: CategoriaDto)', content)
content = re.sub(r'actualizarCategoria\(@Param\(\'id\'\) id: string, @Body\(\) payload: any\)', r'actualizarCategoria(@Param("id") id: string, @Body() payload: CategoriaDto)', content)
content = re.sub(r'actualizarConfiguracion\(@Headers\("x-sucursal-id"\) idSucursal: string, @Body\(\) payload: any\)', r'actualizarConfiguracion(@Headers("x-sucursal-id") idSucursal: string, @Body() payload: ConfiguracionDto)', content)
content = re.sub(r'generarProforma\(@Body\(\) payload: any, @Headers\(\'x-sucursal-id\'\) idSucursal: string\)', r'generarProforma(@Body() payload: GenerarProformaDto, @Headers("x-sucursal-id") idSucursal: string)', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done!")
