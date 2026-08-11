const XLSX = require('./node_modules/xlsx');
const fs = require('fs');
const path = './Ducumentos';

const files = fs.readdirSync(path).filter(f => f.endsWith('.xlsx'));
const allParsedDeals = [];

files.forEach(file => {
  const filePath = path + '/' + file;
  const wb = XLSX.readFile(filePath);

  wb.SheetNames.forEach(sheetName => {
    const sheet = wb.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (rawData.length < 2) return;

    // Encontrar a linha de cabeçalho
    let headerRowIdx = -1;
    for (let i = 0; i < Math.min(10, rawData.length); i++) {
      const rowStr = JSON.stringify(rawData[i]).toLowerCase();
      if (rowStr.includes('cliente') || rowStr.includes('serviço') || rowStr.includes('servico') || rowStr.includes('proposta')) {
        headerRowIdx = i;
        break;
      }
    }

    if (headerRowIdx === -1) return;

    const headers = rawData[headerRowIdx].map(h => String(h).trim());
    const rows = rawData.slice(headerRowIdx + 1);

    rows.forEach((r, idx) => {
      if (!r || r.every(cell => cell === '')) return;
      const rowObj = {};
      headers.forEach((h, hIdx) => {
        if (h) rowObj[h] = r[hIdx];
      });
      rowObj['_file'] = file;
      rowObj['_sheet'] = sheetName;
      rowObj['_rowIdx'] = idx;
      allParsedDeals.push(rowObj);
    });
  });
});

fs.writeFileSync('./scratch_excel_rows.json', JSON.stringify(allParsedDeals, null, 2), 'utf-8');
console.log(`Parsed ${allParsedDeals.length} total rows from Excel files.`);
