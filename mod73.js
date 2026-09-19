const fs = require('fs');
let ts = fs.readFileSync('src/pos/pos.service.ts', 'utf8');

const startStr = '// Mapear R';
const endStr = 'let clienteExistente: any = null;';

let startIndex = ts.indexOf(startStr, ts.indexOf('async parseCsf'));
let endIndex = ts.indexOf(endStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    let oldBlock = ts.substring(startIndex, endIndex);

    let newBlock = `// Mapear Regimen Fiscal
        let regimenFiscal = '';
        if (text.match(/General de Ley Personas Morales/i)) regimenFiscal = '601';
        else if (text.match(/Personas F(?:í|i|.)sicas con Actividades Empresariales/i)) regimenFiscal = '612';
        else if (text.match(/Incorporaci(?:ó|o|.)n Fiscal/i)) regimenFiscal = '621';
        else if (text.match(/Simplificado de Confianza/i)) regimenFiscal = '626';
        else if (text.match(/Sueldos y Salarios/i)) regimenFiscal = '605';
        else if (text.match(/Sin obligaciones/i)) regimenFiscal = '616';

        let direccionCompleta = '';
        // "Datos del domicilio registrado" until "Actividades Económicas"
        const domicilioMatch = text.match(/Datos del domicilio registrado([\\s\\S]+?)(?:Actividades Econ(?:ó|o|.)micas|Susceptibles de recibir)/i);
        if (domicilioMatch) {
          let dom = domicilioMatch[1].replace(/[\\r\\n]+/g, ' ').replace(/\\s+/g, ' ');
          
          const getField = (regex) => {
            const m = dom.match(regex);
            return m ? m[1].trim() : '';
          };
          
          const calle = getField(/(?:Nombre\\s*de\\s*Vialidad|NombredeVialidad):?\\s*([\\s\\S]*?)(?:N(?:ú|u|.)mero)/i);
          const ext = getField(/(?:N(?:ú|u|.)mero\\s*Exterior|N(?:ú|u|.)meroExterior):?\\s*([\\s\\S]*?)(?:N(?:ú|u|.)mero|Nombre\\s*de\\s*la\\s*Colonia|Nombredela Colonia)/i);
          const int = getField(/(?:N(?:ú|u|.)mero\\s*Interior|N(?:ú|u|.)meroInterior):?\\s*([\\s\\S]*?)(?:Nombre\\s*de\\s*la\\s*Colonia|Nombredela Colonia)/i);
          const col = getField(/(?:Nombre\\s*de\\s*la\\s*Colonia|Nombredela Colonia):?\\s*([\\s\\S]*?)(?:Nombre\\s*de\\s*la\\s*Localidad|Nombredela Localidad)/i);
          const mun = getField(/(?:Municipio\\s*o\\s*Demarcaci(?:ó|o|.)n\\s*Territorial|Municipioo Demarcaci(?:ó|o|.)nTerritorial):?\\s*([\\s\\S]*?)(?:Nombre\\s*de\\s*la\\s*Entidad|Nombredela Entidad)/i);
          const est = getField(/(?:Entidad\\s*Federativa|EntidadFederativa):?\\s*([\\s\\S]*?)(?:Entre\\s*Calle|EntreCalle|C(?:ó|o|.)digo\\s*Postal|CP)/i);
          
          const partes = [];
          if (calle) partes.push(calle);
          if (ext && ext !== 'S/N' && ext !== 'SN') partes.push(\`Num. Ext. \${ext}\`);
          if (int && int !== 'S/N' && int !== 'SN') partes.push(\`Num. Int. \${int}\`);
          if (col) partes.push(\`Col. \${col}\`);
          if (mun) partes.push(mun);
          if (est) partes.push(est);
          if (cp) partes.push(\`CP \${cp}\`);
          
          direccionCompleta = partes.join(', ').replace(/\\s+/g, ' ');
        }
        
        `;

    ts = ts.slice(0, startIndex) + newBlock + ts.slice(endIndex);
    fs.writeFileSync('src/pos/pos.service.ts', ts, 'utf8');
    console.log('Fixed parsing encoding errors');
} else {
    console.log('Could not find block', startIndex, endIndex);
}
