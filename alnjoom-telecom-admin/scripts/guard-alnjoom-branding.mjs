import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const root = process.cwd();
const compatibilityAllowlist = new Set([
  'src/compatibility/legacy-admin-compat.ts',
]);
const extensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json', '.md', '.html']);
const forbidden = [
  /General Ecommerce/iu,
  /Ecommerce Core/iu,
  /general-ecommerce/iu,
  /ecommerce[_-]core/iu,
  /\bMerchant\b/u,
  /\bmerchant\b/iu,
  /لوحة التاجر/u,
  /متجرك/u,
];
const roots = ['src', 'package.json', 'package-lock.json', 'index.html', 'README.md'];
const violations = [];

for (const target of roots) {
  for (const file of walk(join(root, target))) {
    const rel = relative(root, file).replaceAll('\\', '/');
    if (compatibilityAllowlist.has(rel)) continue;
    if (/features\/merchant(?:\/|$)/iu.test(rel)) {
      violations.push(`${rel}: legacy feature namespace`);
    }
    const source = readFileSync(file, 'utf8');
    source.split(/\r?\n/u).forEach((line, index) => {
      for (const pattern of forbidden) {
        if (pattern.test(line)) violations.push(`${rel}:${index + 1}: ${pattern.source}`);
      }
    });
  }
}

if (violations.length > 0) {
  console.error('Alnjoom branding guard failed:');
  console.error(violations.join('\n'));
  process.exit(1);
}

console.log(`Alnjoom branding guard passed (compatibility allowlist: ${compatibilityAllowlist.size} file).`);

function walk(target) {
  const stats = statSync(target);
  if (stats.isFile()) return extensions.has(extname(target)) ? [target] : [];
  return readdirSync(target, { withFileTypes: true }).flatMap((entry) => {
    const path = join(target, entry.name);
    return entry.isDirectory() ? walk(path) : extensions.has(extname(entry.name)) ? [path] : [];
  });
}
