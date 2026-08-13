const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log("Checking git history...");
  const log = execSync('git log -n 10 --oneline', { encoding: 'utf-8', stdio: 'pipe' });
  const status = execSync('git status --short', { encoding: 'utf-8', stdio: 'pipe' });
  fs.writeFileSync('git_history_result.txt', `GIT LOG:\n${log}\n\nGIT STATUS:\n${status}`);
  console.log("Git history captured!");
} catch (err) {
  const errOutput = (err.stdout || '') + '\n' + (err.stderr || '');
  fs.writeFileSync('git_history_result.txt', 'GIT_ERRORS:\n' + errOutput);
  console.log("Git output captured in git_history_result.txt");
}
