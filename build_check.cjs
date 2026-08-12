const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log("Testing vite build...");
  const out = execSync('npx vite build', { encoding: 'utf-8', stdio: 'pipe' });
  fs.writeFileSync('build_result.txt', 'BUILD_SUCCESS:\n' + out);
  console.log("Vite build SUCCESSFUL!");
} catch (err) {
  const errOutput = (err.stdout || '') + '\n' + (err.stderr || '');
  fs.writeFileSync('build_result.txt', 'BUILD_FAILED:\n' + errOutput);
  console.log("Build output captured in build_result.txt");
}
