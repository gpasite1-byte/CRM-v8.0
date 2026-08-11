const XLSX = require('./node_modules/xlsx');
const fs = require('fs');

const path = './Ducumentos';
const files = fs.readdirSync(path).filter(f => f.endsWith('.xlsx'));
let out = '';

files.forEach(file => {
  out += `\n========================================\nFILE: ${file}\n========================================\n`;
  const wb = XLSX.readFile(path + '/' + file);
  wb.SheetNames.forEach(sheetName => {
    out += `\n--- SHEET: ${sheetName} ---\n`;
    const sheet = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    out += `Total rows: ${rows.length}\n`;
    if (rows.length > 0) {
      out += `Headers: ${JSON.stringify(Object.keys(rows[0]))}\n`;
      out += `Sample row 0: ${JSON.stringify(rows[0])}\n`;
      out += `Sample row 1: ${JSON.stringify(rows[1])}\n`;
      if (rows.length > 2) out += `Sample row 2: ${JSON.stringify(rows[2])}\n`;
    }
  });
});

fs.writeFileSync('./scratch_doc_output.txt', out, 'utf-8');
console.log('Done writing output.');
