// Offline sanity check for the source tree. No dependencies required.
//   - every relative import resolves to a real file
//   - every named import exists as an export of the target module
//   - every bare import is declared in package.json
// Run with:  npm run check

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const declared = new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})]);
const builtins = new Set(['node:fs', 'node:path', 'node:url']);

const problems = [];
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else if (/\.(jsx?|mjs)$/.test(name)) files.push(full);
  }
})(join(root, 'src'));

const importRe = /import\s+(?:([\w$]+)\s*,?\s*)?(?:\*\s+as\s+([\w$]+)|\{([^}]*)\})?\s*(?:from\s*)?['"]([^'"]+)['"]/g;

function exportsOf(file, seen = new Set()) {
  if (seen.has(file)) return new Set();
  seen.add(file);
  const src = readFileSync(file, 'utf8');
  const names = new Set();
  for (const m of src.matchAll(/export\s+(?:async\s+)?(?:const|let|var|function\*?|class)\s+([\w$]+)/g)) names.add(m[1]);
  for (const m of src.matchAll(/export\s*\{([^}]*)\}(?:\s*from\s*['"]([^'"]+)['"])?/g)) {
    for (const part of m[1].split(',')) {
      const name = part.trim().split(/\s+as\s+/).pop();
      if (name) names.add(name);
    }
  }
  if (/export\s+default\b/.test(src)) names.add('default');
  return names;
}

function resolveRelative(from, spec) {
  const base = resolve(dirname(from), spec);
  if (existsSync(base) && statSync(base).isFile()) return base;
  for (const ext of ['.js', '.jsx', '.mjs', '.json']) if (existsSync(base + ext)) return base + ext;
  return null;
}

for (const file of files) {
  const src = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  for (const m of src.matchAll(importRe)) {
    const [, defaultName, , named, spec] = m;
    const where = relative(root, file);
    if (spec.startsWith('.')) {
      const target = resolveRelative(file, spec);
      if (!target) {
        problems.push(`${where}: cannot resolve '${spec}'`);
        continue;
      }
      if (extname(target) === '.css' || extname(target) === '.json') continue;
      const available = exportsOf(target);
      if (defaultName && !available.has('default')) problems.push(`${where}: '${spec}' has no default export`);
      if (named) {
        for (const part of named.split(',')) {
          const name = part.trim().split(/\s+as\s+/)[0];
          if (name && !available.has(name)) problems.push(`${where}: '${name}' is not exported by '${spec}'`);
        }
      }
    } else if (!builtins.has(spec)) {
      const pkgName = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
      if (!declared.has(pkgName)) problems.push(`${where}: '${pkgName}' is imported but not listed in package.json`);
    }
  }
}

// Declared runtime dependencies that nothing imports.
const usedBare = new Set();
for (const file of files) {
  for (const m of readFileSync(file, 'utf8').matchAll(/from\s*['"]([^'"./][^'"]*)['"]|import\s*['"]([^'"./][^'"]*)['"]/g)) {
    const spec = m[1] ?? m[2];
    usedBare.add(spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]);
  }
}
for (const dep of Object.keys(pkg.dependencies ?? {})) {
  if (!usedBare.has(dep)) problems.push(`package.json: dependency '${dep}' is never imported (remove it or use it)`);
}

console.log(`Checked ${files.length} source files.`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('No import, export or dependency problems found.');
