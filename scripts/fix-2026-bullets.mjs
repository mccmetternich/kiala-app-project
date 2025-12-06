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

const ARTICLE_ID = 's46BRDv72F2SeqT-ruHby';

async function updateBullets() {
  const result = await client.execute({
    sql: 'SELECT widget_config FROM articles WHERE id = ?',
    args: [ARTICLE_ID]
  });

  if (!result.rows[0]) {
    console.error('Article not found');
    return;
  }

  let widgets = JSON.parse(result.rows[0].widget_config);

  // Find and log all widget IDs to understand structure
  console.log('All widget IDs in article:');
  widgets.forEach(w => console.log(`  - ${w.id} (${w.type})`));
  console.log('');

  // Update product-reveal keyBenefits
  const productReveal = widgets.find(w => w.id === 'product-reveal');
  if (productReveal) {
    productReveal.config.keyBenefits = [
      "Steady energy from morning to night—no more 3pm crashes",
      "Support for the stubborn weight that diet and exercise alone can't fix",
      "Deeper, more restorative sleep with fewer night sweats",
      "Mental clarity and focus instead of brain fog"
    ];
    console.log('✓ Updated product-reveal keyBenefits');
    console.log('  New values:', JSON.stringify(productReveal.config.keyBenefits, null, 2));
  }

  // Find exclusive-product and check its structure
  const exclusiveProduct = widgets.find(w => w.id === 'exclusive-product');
  if (exclusiveProduct) {
    console.log('\n=== exclusive-product current config ===');
    console.log(JSON.stringify(exclusiveProduct.config, null, 2));

    // Update benefits (whatever the field name is)
    exclusiveProduct.config.benefits = [
      "All-day energy without the afternoon crash",
      "Support for weight that won't budge",
      "Better sleep, fewer night sweats",
      "Clearer thinking, less brain fog",
      "Balanced mood and fewer cravings"
    ];
    console.log('\n✓ Updated exclusive-product benefits');
  } else {
    console.log('\nNo widget with id "exclusive-product" found');
    // Search for any widget that might be the product CTA
    const productWidgets = widgets.filter(w =>
      w.type.includes('product') ||
      w.type.includes('exclusive') ||
      w.id.includes('product')
    );
    console.log('Product-related widgets found:');
    productWidgets.forEach(w => {
      console.log(`  - ${w.id} (${w.type})`);
      console.log('    Config:', JSON.stringify(w.config, null, 2).substring(0, 500));
    });
  }

  // Save updates
  await client.execute({
    sql: 'UPDATE articles SET widget_config = ?, updated_at = datetime("now") WHERE id = ?',
    args: [JSON.stringify(widgets), ARTICLE_ID]
  });

  console.log('\n✅ Changes saved to database!');
}

updateBullets().catch(console.error);
