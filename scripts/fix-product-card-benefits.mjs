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

async function updateBenefits() {
  const result = await client.execute({
    sql: 'SELECT widget_config FROM articles WHERE id = ?',
    args: [ARTICLE_ID]
  });

  if (!result.rows[0]) {
    console.error('Article not found');
    return;
  }

  let widgets = JSON.parse(result.rows[0].widget_config);

  // Find product-card widget (which is type exclusive-product)
  const productCard = widgets.find(w => w.id === 'product-card');
  if (productCard) {
    console.log('Current product-card config:');
    console.log(JSON.stringify(productCard.config, null, 2));

    // Update benefits
    productCard.config.benefits = [
      "All-day energy without the afternoon crash",
      "Support for weight that won't budge",
      "Better sleep, fewer night sweats",
      "Clearer thinking, less brain fog",
      "Balanced mood and fewer cravings"
    ];

    console.log('\n✓ Updated benefits to:');
    console.log(JSON.stringify(productCard.config.benefits, null, 2));
  }

  await client.execute({
    sql: 'UPDATE articles SET widget_config = ?, updated_at = datetime("now") WHERE id = ?',
    args: [JSON.stringify(widgets), ARTICLE_ID]
  });

  console.log('\n✅ Changes saved to database!');
}

updateBenefits().catch(console.error);
