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

async function main() {
  const result = await client.execute({
    sql: 'SELECT widget_config FROM articles WHERE id = ?',
    args: ['s46BRDv72F2SeqT-ruHby']
  });
  const widgets = JSON.parse(result.rows[0].widget_config);

  // Show all widgets in order with their key content
  widgets.sort((a, b) => a.position - b.position);

  widgets.filter(w => w.enabled !== false).forEach(w => {
    console.log(`\n=== ${w.position}. ${w.type} (${w.id}) ===`);
    if (w.config.content) {
      // Strip HTML for readability
      const text = w.config.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      console.log(text.substring(0, 400));
    } else if (w.config.question) {
      console.log('Q:', w.config.question);
    } else if (w.config.headline) {
      console.log('Headline:', w.config.headline);
    } else if (w.config.message) {
      console.log('Message:', w.config.message);
    }
  });
}
main();
