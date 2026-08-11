const XLSX = require('./node_modules/xlsx');
const fs = require('fs');
const docsDir = './Ducumentos';
const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.xlsx'));
const out = {};
files.forEach(file => {
  const wb = XLSX.readFile(docsDir + '/' + file);
  out[file] = {};
  wb.SheetNames.forEach(name => {
    out[file][name] = XLSX.utils.sheet_to_json(wb.Sheets[name], {header:1}).slice(0,25);
  });
});
fs.writeFileSync('./excel_inspect.json', JSON.stringify(out, null, 2), 'utf-8');
console.log('Excel inspect written to excel_inspect.json');
