const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log("Restoring git files to commit 586c7de8647b17452ba5fc5bf60729925db894b6...");
  const out1 = execSync('git checkout 586c7de8647b17452ba5fc5bf60729925db894b6 -- src/', { encoding: 'utf-8', stdio: 'pipe' });
  const out2 = execSync('git checkout 586c7de8647b17452ba5fc5bf60729925db894b6 -- index.html vite.config.ts package.json', { encoding: 'utf-8', stdio: 'pipe' });
  fs.writeFileSync('checkout_result.txt', 'RESTORE_SUCCESS:\n' + out1 + '\n' + out2);
  console.log("Restore complete!");
} catch (err) {
  const errOutput = (err.stdout || '') + '\n' + (err.stderr || '');
  fs.writeFileSync('checkout_result.txt', 'RESTORE_FAILED:\n' + errOutput);
  console.log("Restore output captured in checkout_result.txt");
}
