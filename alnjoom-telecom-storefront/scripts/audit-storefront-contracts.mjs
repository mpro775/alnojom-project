import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";
const root = join(process.cwd(), "src");
const forbidden = [/\/admin(?:\/|['"`])/i, /customers\/manage/i, /\/brands(?:\?|['"`])/i, /\/promotions(?:\?|['"`])/i];
const violations = [];
await walk(root);
if (violations.length) throw new Error(`Forbidden storefront API references:\n${violations.join("\n")}`);
console.log("Storefront contract audit passed: no admin/manage API references.");
async function walk(dir) { for (const entry of await readdir(dir, { withFileTypes: true })) { const path = join(dir, entry.name); if (entry.isDirectory()) await walk(path); else if ([".ts", ".tsx"].includes(extname(path)) && !path.endsWith("types.generated.ts")) { const text = await readFile(path, "utf8"); forbidden.forEach((pattern) => { if (pattern.test(text)) violations.push(`${relative(process.cwd(), path)}: ${pattern}`); }); } } }
