const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const docsDir = 'c:\\Users\\GPA (PC)\\Documents\\crm\\Ducumentos';
const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.xlsx'));

console.log('Found files:', files);

const output = {};

files.forEach(file => {
  const filePath = path.join(docsDir, file);
  console.log(`\n========================================`);
  console.log(`FILE: ${file}`);
  console.log(`========================================`);
  
  const workbook = XLSX.readFile(filePath);
  output[file] = {};

  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log(`--- Sheet: ${sheetName} (Rows: ${json.length}) ---`);
    // print non-empty first 20 rows
    const nonHead = json.slice(0, 25).filter(r => r && r.length > 0);
    console.log(JSON.stringify(nonHead.slice(0, 15), null, 2));
    output[file][sheetName] = json;
  });
});

fs.writeFileSync(
  'c:\\Users\\GPA (PC)\\Documents\\crm\\uploads\\excel_parsed_summary.json',
  JSON.stringify(output, null, 2),
  'utf-8'
);
console.log('\nSaved full JSON summary to uploads/excel_parsed_summary.json');
