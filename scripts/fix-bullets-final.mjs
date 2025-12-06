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
  console.log('Fetching article...');
  const result = await client.execute({
    sql: 'SELECT widget_config FROM articles WHERE id = ?',
    args: [ARTICLE_ID]
  });

  if (!result.rows[0]) {
    console.error('Article not found');
    return;
  }

  let widgets = JSON.parse(result.rows[0].widget_config);
  console.log(`Found ${widgets.length} widgets`);

  // Update product-reveal keyBenefits
  const productRevealIdx = widgets.findIndex(w => w.id === 'product-reveal');
  if (productRevealIdx !== -1) {
    console.log('Found product-reveal at index', productRevealIdx);
    widgets[productRevealIdx].config.keyBenefits = [
      "Steady energy from morning to night—no more 3pm crashes",
      "Support for the stubborn weight that diet and exercise alone can't fix",
      "Deeper, more restorative sleep with fewer night sweats",
      "Mental clarity and focus instead of brain fog"
    ];
    console.log('Updated product-reveal keyBenefits');
  } else {
    console.log('product-reveal NOT FOUND');
  }

  // Find product-card widget (which is type exclusive-product)
  const productCardIdx = widgets.findIndex(w => w.id === 'product-card');
  if (productCardIdx !== -1) {
    console.log('Found product-card at index', productCardIdx);
    widgets[productCardIdx].config.benefits = [
      "All-day energy without the afternoon crash",
      "Support for weight that won't budge",
      "Better sleep, fewer night sweats",
      "Clearer thinking, less brain fog",
      "Balanced mood and fewer cravings"
    ];
    console.log('Updated product-card benefits');
  } else {
    console.log('product-card NOT FOUND');
  }

  // Save to database
  console.log('Saving to database...');
  const updateResult = await client.execute({
    sql: 'UPDATE articles SET widget_config = ?, updated_at = datetime("now") WHERE id = ?',
    args: [JSON.stringify(widgets), ARTICLE_ID]
  });

  console.log('Update result:', updateResult);

  // Verify the update
  console.log('\nVerifying update...');
  const verifyResult = await client.execute({
    sql: 'SELECT widget_config FROM articles WHERE id = ?',
    args: [ARTICLE_ID]
  });

  const verifyWidgets = JSON.parse(verifyResult.rows[0].widget_config);
  const verifyProductReveal = verifyWidgets.find(w => w.id === 'product-reveal');
  const verifyProductCard = verifyWidgets.find(w => w.id === 'product-card');

  console.log('\n=== VERIFIED product-reveal keyBenefits ===');
  console.log(JSON.stringify(verifyProductReveal?.config?.keyBenefits, null, 2));

  console.log('\n=== VERIFIED product-card benefits ===');
  console.log(JSON.stringify(verifyProductCard?.config?.benefits, null, 2));
}

updateBullets().catch(console.error);
