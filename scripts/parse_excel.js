const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const docsDir = fs.existsSync(path.join(rootDir, 'Documentos')) 
  ? path.join(rootDir, 'Documentos') 
  : path.join(rootDir, 'Ducumentos');

if (fs.existsSync(docsDir)) {
  const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.xlsx'));
  const out = {};
  files.forEach(file => {
    const wb = XLSX.readFile(path.join(docsDir, file));
    out[file] = {};
    wb.SheetNames.forEach(name => {
      out[file][name] = XLSX.utils.sheet_to_json(wb.Sheets[name], {header:1}).slice(0,25);
    });
  });
  fs.writeFileSync(path.join(rootDir, 'excel_inspect.json'), JSON.stringify(out, null, 2), 'utf-8');
  console.log('Excel inspect written to excel_inspect.json');
} else {
  console.log('Pasta Documentos não encontrada.');
}
