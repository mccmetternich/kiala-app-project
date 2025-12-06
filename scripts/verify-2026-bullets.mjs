import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const envPath = join(dirname(fileURLToPath(import.meta.url)), '../.env');
const envContent = readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    let value = valueParts.join('=').trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key.trim()] = value;
  }
});

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const result = await client.execute({
  sql: "SELECT widget_config FROM articles WHERE id = 's46BRDv72F2SeqT-ruHby'",
  args: []
});

const widgets = JSON.parse(result.rows[0].widget_config);

const productReveal = widgets.find(w => w.id === 'product-reveal');
const exclusiveProduct = widgets.find(w => w.id === 'exclusive-product');

console.log('=== PRODUCT-REVEAL keyBenefits ===');
console.log(JSON.stringify(productReveal?.config?.keyBenefits, null, 2));

console.log('\n=== EXCLUSIVE-PRODUCT benefits ===');
console.log(JSON.stringify(exclusiveProduct?.config?.benefits, null, 2));
