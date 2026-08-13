const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'videos');
const destPublicDir = path.join(rootDir, 'public', 'videos');
const destAssetsDir = path.join(rootDir, 'src', 'assets', 'videos');

[destPublicDir, destAssetsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

if (fs.existsSync(srcDir)) {
  const files = fs.readdirSync(srcDir);
  for (const file of files) {
    const srcFile = path.join(srcDir, file);
    if (fs.statSync(srcFile).isFile()) {
      fs.copyFileSync(srcFile, path.join(destPublicDir, file));
      fs.copyFileSync(srcFile, path.join(destAssetsDir, file));
      console.log(`Successfully synced ${file} to public/videos/ and src/assets/videos/`);
    }
  }
}
