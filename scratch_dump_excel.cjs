const XLSX = require('./node_modules/xlsx');
const fs = require('fs');
const path = './Ducumentos';

const files = fs.readdirSync(path).filter(f => f.endsWith('.xlsx'));
let fullLog = '';

files.forEach(file => {
  fullLog += `\n==================================================\nFILE: ${file}\n==================================================\n`;
  const wb = XLSX.readFile(path + '/' + file);
  wb.SheetNames.forEach(sheetName => {
    fullLog += `\n--- SHEET: ${sheetName} ---\n`;
    const sheet = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    fullLog += `Total lines in sheet: ${data.length}\n`;
    data.slice(0, 50).forEach((row, i) => {
      if (row.some(cell => cell !== '')) {
        fullLog += `Row ${i}: ${JSON.stringify(row)}\n`;
      }
    });
  });
});

fs.writeFileSync('./scratch_full_excel_dump.txt', fullLog, 'utf-8');
console.log('Done writing full log.');
