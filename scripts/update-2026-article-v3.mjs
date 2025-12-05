import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file manually
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

async function updateArticle() {
  // Fetch current article
  const result = await client.execute({
    sql: 'SELECT widget_config FROM articles WHERE id = ?',
    args: [ARTICLE_ID]
  });

  if (!result.rows[0]) {
    console.error('Article not found');
    return;
  }

  let widgets = JSON.parse(result.rows[0].widget_config);

  // Change approach-comparison widget type from comparison-table to two-approaches
  const approachComparison = widgets.find(w => w.id === 'approach-comparison');
  if (approachComparison) {
    approachComparison.type = 'two-approaches';
    approachComparison.config = {
      headline: "Two Paths Into 2026",
      leftColumn: {
        header: "The Willpower Path",
        subheader: "What you've been trying",
        items: [
          { text: "Set ambitious weight loss goals", negative: true },
          { text: "Start a strict diet January 1st", negative: true },
          { text: "Force yourself to exercise", negative: true },
          { text: "White-knuckle through cravings", negative: true },
          { text: "Feel guilty when you slip", negative: true }
        ],
        result: "92% fail by March"
      },
      rightColumn: {
        header: "The Foundation Path",
        subheader: "What actually works after 45",
        items: [
          { text: "Fix what's broken first", positive: true },
          { text: "Support your gut-hormone axis", positive: true },
          { text: "Let energy return naturally", positive: true },
          { text: "Watch cravings diminish", positive: true },
          { text: "Build habits that stick", positive: true }
        ],
        result: "83% still going at 60 days"
      },
      style: "contrast"
    };
    console.log('✓ Changed approach-comparison to two-approaches widget type');
  }

  // Sort and save
  widgets.sort((a, b) => a.position - b.position);

  await client.execute({
    sql: 'UPDATE articles SET widget_config = ?, updated_at = datetime("now") WHERE id = ?',
    args: [JSON.stringify(widgets), ARTICLE_ID]
  });

  console.log('\n✅ Article updated successfully!');
}

updateArticle().catch(console.error);
