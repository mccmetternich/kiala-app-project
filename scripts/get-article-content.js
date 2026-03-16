const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
    }
  });
}

async function getArticleContent() {
  try {
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    const result = await client.execute({
      sql: `SELECT widget_config FROM articles 
            WHERE slug = 'bloom-vs-kiala-greens-powder-comparison' 
            AND site_id = (SELECT id FROM sites WHERE subdomain = 'goodness-authority')`,
      args: []
    });

    if (result.rows.length === 0) {
      console.log('❌ Article not found');
      return;
    }

    let widgetConfig = JSON.parse(result.rows[0].widget_config);
    
    // Extract all text content
    widgetConfig.forEach((widget, index) => {
      if (widget.type === 'text-block') {
        console.log(`\n=== ${widget.id.toUpperCase()} ===`);
        console.log(widget.config.content);
      } else if (widget.type === 'faq-accordion') {
        console.log(`\n=== FAQ SECTION ===`);
        if (widget.config.faqs) {
          widget.config.faqs.forEach((faq, i) => {
            console.log(`\n${i+1}. Q: ${faq.question}`);
            console.log(`   A: ${faq.answer}`);
          });
        }
      } else if (widget.type === 'stacked-quotes') {
        console.log(`\n=== TESTIMONIALS ===`);
        if (widget.config.quotes) {
          widget.config.quotes.forEach((quote, i) => {
            console.log(`\n${i+1}. ${quote.name} (${quote.location}) - ${quote.result}`);
            console.log(`   "${quote.content}"`);
          });
        }
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

getArticleContent();