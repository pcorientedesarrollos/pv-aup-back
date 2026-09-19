const fs = require('fs');
let ts = fs.readFileSync('src/pos/pos.service.ts', 'utf8');

const regexBad = /(?:C\[.*?\]digo\\s\*Postal|CP)\[\\s\\S\]\*?\\(\\d\\{5}\\)/i;

// Let's just find "const cpMatch ="
let startIndex = ts.indexOf('const cpMatch = text.match');
let endIndex = ts.indexOf('const cp = cpMatch ? cpMatch[1] : \'\';', startIndex) + 'const cp = cpMatch ? cpMatch[1] : \'\';'.length;

if (startIndex !== -1 && endIndex !== -1) {
    let newBlock = `const cpMatch = text.match(/(?:C(?:ó|o|.)digo\\s*Postal|CP)[\\s\\S]*?(\\d{5})/i);
      const cp = cpMatch ? cpMatch[1] : '';`;

    ts = ts.slice(0, startIndex) + newBlock + ts.slice(endIndex);
    fs.writeFileSync('src/pos/pos.service.ts', ts, 'utf8');
    console.log('Fixed CP parsing encoding errors');
} else {
    console.log('Could not find block', startIndex, endIndex);
}
