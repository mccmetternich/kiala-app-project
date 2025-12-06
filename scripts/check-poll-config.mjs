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

async function checkPoll() {
  const result = await client.execute({
    sql: 'SELECT widget_config FROM articles WHERE id = ?',
    args: [ARTICLE_ID]
  });

  const widgets = JSON.parse(result.rows[0].widget_config);

  // Find all poll widgets
  const pollWidgets = widgets.filter(w => w.type === 'poll');

  console.log(`Found ${pollWidgets.length} poll widgets:\n`);

  pollWidgets.forEach(poll => {
    console.log(`=== ${poll.id} ===`);
    console.log('showCta:', poll.config.showCta);
    console.log('ctaText:', poll.config.ctaText);
    console.log('ctaUrl:', poll.config.ctaUrl);
    console.log('ctaType:', poll.config.ctaType);
    console.log('target:', poll.config.target);
    console.log('anchorWidgetId:', poll.config.anchorWidgetId);
    console.log('');
  });
}

checkPoll().catch(console.error);
