const fs = require('fs');

let ts = fs.readFileSync('src/pos/pos.service.ts', 'utf8');

// Find the boundaries
let startIndex = ts.indexOf('const cp = cpMatch ? cpMatch[1] : \'\';');
if (startIndex !== -1) {
    startIndex = startIndex + 'const cp = cpMatch ? cpMatch[1] : \'\';'.length;
}

let endIndex = ts.indexOf('const regimenCapitalMatch = text.match');
if (endIndex !== -1) {
    // go back to previous comment
    let temp = ts.lastIndexOf('// Extraer R', endIndex);
    if (temp !== -1) endIndex = temp;
}

if (startIndex !== -1 && endIndex !== -1) {
    let toReplace = ts.substring(startIndex, endIndex);

    let newNameLogic = `

      let nombre = '';
      
      // Intentar Persona Moral
      const denominacionMatch = text.match(/(?:Nombre, denominaci(?:ó|o|.)n o raz(?:ó|o|.)n social:|Denominaci(?:ó|o|.)n\\/Raz(?:ó|o|.)n Social:)\\s*([^\\n]+)/i);
      if (denominacionMatch && denominacionMatch[1]) {
        nombre = denominacionMatch[1].trim();
      }

      // Intentar Persona Física (Nombre(s), Primer Apellido, Segundo Apellido)
      if (!nombre || nombre.includes("RFC") || nombre.length < 3) {
         nombre = '';
         const nMatch = text.match(/Nombre\\s*\\(s\\):\\s*([^\\n]+)/i);
         if (nMatch && nMatch[1]) nombre += nMatch[1].trim();
         
         const a1Match = text.match(/Primer Apellido:\\s*([^\\n]+)/i);
         if (a1Match && a1Match[1]) nombre += ' ' + a1Match[1].trim();
         
         const a2Match = text.match(/Segundo Apellido:\\s*([^\\n]+)/i);
         if (a2Match && a2Match[1]) nombre += ' ' + a2Match[1].trim();
         
         nombre = nombre.trim();
      }
      
      // Fallback si aúb asì captura basura
      if (nombre.includes("Registro Federal") || !nombre) {
         nombre = ''; // dejar vacío para que el usuario lo llene
      }
      
      `;
      
      ts = ts.slice(0, startIndex) + newNameLogic + ts.slice(endIndex);
      fs.writeFileSync('src/pos/pos.service.ts', ts, 'utf8');
      console.log('Replaced successfully.');
} else {
    console.log('Could not find indices.');
}
