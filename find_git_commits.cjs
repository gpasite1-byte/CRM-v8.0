const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log("Listing git commits...");
  const commits = execSync('git log -n 30 --format="%h | %an | %ad | %s" --date=short', { encoding: 'utf-8', stdio: 'pipe' });
  fs.writeFileSync('git_commits_list.txt', commits);
  console.log("Commits listed successfully!");
} catch (err) {
  const errOutput = (err.stdout || '') + '\n' + (err.stderr || '');
  fs.writeFileSync('git_commits_list.txt', 'GIT_COMMITS_ERROR:\n' + errOutput);
}
