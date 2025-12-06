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

async function fixPollCta() {
  const result = await client.execute({
    sql: 'SELECT widget_config FROM articles WHERE id = ?',
    args: [ARTICLE_ID]
  });

  let widgets = JSON.parse(result.rows[0].widget_config);

  // Find the opening-poll widget
  const pollIdx = widgets.findIndex(w => w.id === 'opening-poll');
  if (pollIdx !== -1) {
    // Set up anchor link to product-card widget
    widgets[pollIdx].config.ctaType = 'anchor';
    widgets[pollIdx].config.anchorWidgetId = 'product-card';
    // Keep the existing ctaText

    console.log('Updated poll config:');
    console.log('showCta:', widgets[pollIdx].config.showCta);
    console.log('ctaText:', widgets[pollIdx].config.ctaText);
    console.log('ctaType:', widgets[pollIdx].config.ctaType);
    console.log('anchorWidgetId:', widgets[pollIdx].config.anchorWidgetId);
  }

  await client.execute({
    sql: 'UPDATE articles SET widget_config = ?, updated_at = datetime("now") WHERE id = ?',
    args: [JSON.stringify(widgets), ARTICLE_ID]
  });

  console.log('\n✅ Poll CTA fixed!');
}

fixPollCta().catch(console.error);
