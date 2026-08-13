const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const ducumentosDir = path.join(rootDir, 'Ducumentos');
const documentosDir = path.join(rootDir, 'Documentos');

if (!fs.existsSync(documentosDir)) {
  fs.mkdirSync(documentosDir, { recursive: true });
}

if (!fs.existsSync(ducumentosDir)) {
  fs.mkdirSync(ducumentosDir, { recursive: true });
}

// Copy files from Ducumentos to Documentos
if (fs.existsSync(ducumentosDir)) {
  const files = fs.readdirSync(ducumentosDir);
  for (const file of files) {
    const src = path.join(ducumentosDir, file);
    const dest = path.join(documentosDir, file);
    if (fs.statSync(src).isFile() && !fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
      console.log(`Synced ${file} to Documentos/`);
    }
  }
}

// Copy files from Documentos to Ducumentos
if (fs.existsSync(documentosDir)) {
  const files = fs.readdirSync(documentosDir);
  for (const file of files) {
    const src = path.join(documentosDir, file);
    const dest = path.join(ducumentosDir, file);
    if (fs.statSync(src).isFile() && !fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
      console.log(`Synced ${file} to Ducumentos/`);
    }
  }
}

console.log('✅ Documentos & Ducumentos folders synchronized!');
