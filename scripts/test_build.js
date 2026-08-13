const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

try {
  console.log("Running npx vite build --no-emit or npx tsc --noEmit...");
  const result = execSync('npx tsc --noEmit', { cwd: rootDir, encoding: 'utf-8', stdio: 'pipe' });
  fs.writeFileSync(path.join(rootDir, 'build_test_result.txt'), 'TSC BUILD CLEAN SUCCESS:\n' + result);
  console.log("Clean build!");
} catch (err) {
  const errOutput = (err.stdout || '') + '\n' + (err.stderr || '') + '\n' + (err.message || '');
  fs.writeFileSync(path.join(rootDir, 'build_test_result.txt'), 'TSC BUILD ERRORS:\n' + errOutput);
  console.log("Build error log written to build_test_result.txt");
}
