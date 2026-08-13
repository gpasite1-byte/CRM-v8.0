const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

try {
  console.log("Checking git commits...");
  const commits = execSync('git log -n 15 --oneline', { cwd: rootDir, encoding: 'utf-8', stdio: 'pipe' });
  fs.writeFileSync(path.join(rootDir, 'git_commits.txt'), commits);
  console.log("Git log captured.");
} catch (err) {
  fs.writeFileSync(path.join(rootDir, 'git_commits.txt'), 'GIT LOG ERROR:\n' + err.message);
}
