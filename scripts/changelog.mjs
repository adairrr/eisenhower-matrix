// Keeps CHANGELOG.md and releases in step.
//   node scripts/changelog.mjs stamp            turn "## Unreleased" into this version's section (run by `npm version`)
//   node scripts/changelog.mjs notes <version>  print that version's bullets (used for the GitHub release notes)
import { readFileSync, writeFileSync } from 'node:fs';

const file = new URL('../CHANGELOG.md', import.meta.url);
const version = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;
const text = readFileSync(file, 'utf8');
const [mode, arg] = process.argv.slice(2);

/** Bullet lines under the heading that starts with `## <name>`. */
function section(name) {
  const lines = text.split('\n');
  const start = lines.findIndex(l => l.startsWith('## ') && l.slice(3).trim().split(/\s/)[0] === name);
  if (start < 0) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex(l => l.startsWith('## '));
  return (end < 0 ? rest : rest.slice(0, end)).filter(l => /^\s*[-*]\s+\S/.test(l));
}
function fail(message) { console.error(message); process.exit(1); }

if (mode === 'stamp') {
  const items = section('Unreleased');
  if (!items?.length) fail('CHANGELOG.md has nothing under "## Unreleased". Add a bullet for each change first.');
  const today = new Date().toISOString().slice(0, 10);
  writeFileSync(file, text.replace(/^## Unreleased[ \t]*$/m, `## Unreleased\n\n## ${version} — ${today}`));
  console.log(`CHANGELOG.md: ${items.length} change(s) filed under ${version}`);
} else if (mode === 'notes') {
  const wanted = (arg ?? version).replace(/^v/, '');
  if (wanted !== version) fail(`Tag v${wanted} does not match package.json (${version}).`);
  const items = section(wanted);
  if (!items?.length) fail(`CHANGELOG.md has no entries for ${wanted}.`);
  console.log(items.join('\n'));
} else {
  fail('usage: changelog.mjs stamp | notes <version>');
}
