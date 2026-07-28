import re

file_path = r'C:\Users\EMMA\Desktop\ESTADIAS\PROYECTO AUP PUNTO DE VENTA\pv-aup-back\src\pos\pos.service.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# A6: Corregir diferencia
content = content.replace(
    "diferencia: efectivoEscaner - corteData.resumen.totalIngresos",
    "diferencia: efectivoEscaner - (Number(corteData.corte.fondoInicial) + corteData.resumen.totalEfectivo)"
)

# A7: Eliminar datos mockeados en buscarRfc
mock_data = """      // Al no existir una API p\u00fablica gratuita 100% confiable del SAT sin autenticaci\u00f3n,
      // aqu\u00ed se puede integrar un servicio como API-SAT o Facturama/FacturAPI (si tienen validaci\u00f3n p\u00fablica).
      // Por ahora, simularemos la extracci\u00f3n para que el flujo frontend funcione como solicitaste.
      
      // Simulaci\u00f3n de respuesta de API SAT o Facturama
      const simulado = {
        success: true,
        data: {
          nombre: 'EJEMPLO DE RAZON SOCIAL SA DE CV',
          cp: '01000',
          regimenFiscal: '601'
        },
        fuente: 'api'
      };
      
      return simulado;"""

real_logic = """      // Al no existir una API pública gratuita 100% confiable del SAT sin autenticación,
      // retornamos error si no existe en la base local.
      return { success: false, mensaje: 'RFC no encontrado localmente. Captura los datos manualmente.' };"""
      
# The text in the file might have different encoding or spaces.
# Let's use regex to replace everything after `if (clienteLocal) { ... }` up to `} catch (e)`
content = re.sub(
    r"\}\s*// Al no existir una API p.blica gratuita.*?(?=^\s*\} catch \(e\))",
    "}\n      return { success: false, mensaje: 'RFC no encontrado localmente. Captura los datos manualmente.' };\n",
    content,
    flags=re.DOTALL | re.MULTILINE
)

# S1: Mapear IVA 0% vs IVA Exento
# Let's see how IVA is handled in facturarVenta
# I will just write another small python script to search what it currently does for facturarVenta.

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("A6 and A7 done")
