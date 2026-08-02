import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import openapiTS, { astToString } from "openapi-typescript";

const root = process.cwd();
const sourcePath = resolve(root, "../docs/api/openapi.json");
const generatedPath = resolve(root, "src/lib/api/types.generated.ts");
const document = JSON.parse(await readFile(sourcePath, "utf8"));
const requiredPaths = [
  "/app/config", "/app/categories", "/app/filters", "/app/products", "/app/products/{slug}",
  "/app/cart/items", "/app/cart/{cartId}", "/app/checkout/quote", "/app/checkout", "/app/payment-methods",
  "/customers/login", "/customers/me", "/customers/addresses", "/customers/wishlist", "/customers/orders",
  "/customers/loyalty/wallet", "/customers/notifications/inbox", "/customers/support/tickets",
];
const missing = requiredPaths.filter((path) => !document.paths?.[path]);
if (missing.length) throw new Error(`Required OpenAPI paths are missing: ${missing.join(", ")}`);
const generated = astToString(await openapiTS(document));
const committed = (await readFile(generatedPath, "utf8")).replace(/^\/\*\*[\s\S]*?\*\/\s*/, "");
if (normalize(generated) !== normalize(committed)) throw new Error("Generated OpenAPI types are stale. Run npm run api:generate.");
console.log(`OpenAPI contract check passed (${Object.keys(document.paths).length} paths).`);
function normalize(value) { return value.replace(/\r\n/g, "\n").trim(); }
