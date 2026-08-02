import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const root = process.cwd();
const compatibilityAllowlist = new Set([
  'src/compatibility/legacy-admin-payment-methods.controller.ts',
  'src/compatibility/legacy-admin-fulfillment.controller.ts',
  'src/compatibility/legacy-branding-runtime.ts',
  'scripts/restore.sh',
]);
const extensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json', '.md', '.html', '.sh']);
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
const targets = [
  'src',
  'scripts',
  'package.json',
  'package-lock.json',
  'README.md',
  '.env.example',
  '.env.production.example',
  '../docs/api/openapi.json',
];
const violations = [];

for (const target of targets) {
  for (const file of walk(join(root, target))) {
    const rel = relative(root, file).replaceAll('\\', '/');
    if (rel === 'scripts/guard-alnjoom-branding.mjs' || compatibilityAllowlist.has(rel)) continue;
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

console.log(`Alnjoom branding guard passed (compatibility allowlist: ${compatibilityAllowlist.size} files).`);

function walk(target) {
  const stats = statSync(target);
  if (stats.isFile()) return extensions.has(extname(target)) || target.endsWith('.example') ? [target] : [];
  return readdirSync(target, { withFileTypes: true }).flatMap((entry) => {
    const path = join(target, entry.name);
    return entry.isDirectory() ? walk(path) : extensions.has(extname(entry.name)) ? [path] : [];
  });
}
