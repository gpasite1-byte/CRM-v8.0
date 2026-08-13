const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log("Running TypeScript check...");
  const output = execSync('npx tsc --noEmit', { encoding: 'utf-8', stdio: 'pipe' });
  fs.writeFileSync('ts_check_result.txt', 'NO_ERRORS:\n' + output);
  console.log("TypeScript check passed with 0 errors!");
} catch (err) {
  const errOutput = (err.stdout || '') + '\n' + (err.stderr || '');
  fs.writeFileSync('ts_check_result.txt', 'ERRORS_FOUND:\n' + errOutput);
  console.log("TypeScript errors captured in ts_check_result.txt");
}
