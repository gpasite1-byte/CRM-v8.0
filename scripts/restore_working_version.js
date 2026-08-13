const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

try {
  console.log("Checking out commit 586c7de8647b17452ba5fc5bf60729925db894b6...");
  const out1 = execSync('git checkout 586c7de8647b17452ba5fc5bf60729925db894b6 -- src/ index.html vite.config.ts package.json', { cwd: rootDir, encoding: 'utf-8', stdio: 'pipe' });
  fs.writeFileSync(path.join(rootDir, 'git_restore_log.txt'), 'SUCCESS:\n' + out1);
  console.log("Restore complete!");
} catch (err) {
  const errOut = (err.stdout || '') + '\n' + (err.stderr || '') + '\n' + (err.message || '');
  fs.writeFileSync(path.join(rootDir, 'git_restore_log.txt'), 'FAILED:\n' + errOut);
  console.log("Restore log written to git_restore_log.txt");
}
