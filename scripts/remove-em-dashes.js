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

async function removeEmDashes() {
  try {
    console.log('Connecting to Turso database...');
    
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    const result = await client.execute({
      sql: `SELECT id, widget_config FROM articles 
            WHERE slug = 'bloom-vs-kiala-greens-powder-comparison' 
            AND site_id = (SELECT id FROM sites WHERE subdomain = 'goodness-authority')`,
      args: []
    });

    if (result.rows.length === 0) {
      console.log('❌ Article not found');
      return;
    }

    let widgetConfig = JSON.parse(result.rows[0].widget_config);
    let dashesFound = 0;

    // Remove em dashes from all content
    widgetConfig = widgetConfig.map(widget => {
      if (widget.type === 'text-block' && widget.config && widget.config.content) {
        const originalContent = widget.config.content;
        // Replace em dashes (—) with regular hyphens (-)
        widget.config.content = widget.config.content.replace(/—/g, '-');
        
        const dashCount = (originalContent.match(/—/g) || []).length;
        if (dashCount > 0) {
          console.log(`✓ Removed ${dashCount} em dashes from ${widget.id}`);
          dashesFound += dashCount;
        }
      }
      
      if (widget.type === 'faq-accordion' && widget.config && widget.config.faqs) {
        widget.config.faqs = widget.config.faqs.map(faq => {
          const originalQuestion = faq.question;
          const originalAnswer = faq.answer;
          
          faq.question = faq.question.replace(/—/g, '-');
          faq.answer = faq.answer.replace(/—/g, '-');
          
          const questionDashes = (originalQuestion.match(/—/g) || []).length;
          const answerDashes = (originalAnswer.match(/—/g) || []).length;
          
          if (questionDashes > 0 || answerDashes > 0) {
            console.log(`✓ Removed ${questionDashes + answerDashes} em dashes from FAQ`);
            dashesFound += questionDashes + answerDashes;
          }
          
          return faq;
        });
      }
      
      if (widget.type === 'stacked-quotes' && widget.config && widget.config.quotes) {
        widget.config.quotes = widget.config.quotes.map(quote => {
          const originalContent = quote.content;
          quote.content = quote.content.replace(/—/g, '-');
          
          const dashCount = (originalContent.match(/—/g) || []).length;
          if (dashCount > 0) {
            console.log(`✓ Removed ${dashCount} em dashes from testimonial`);
            dashesFound += dashCount;
          }
          
          return quote;
        });
      }
      
      return widget;
    });

    if (dashesFound === 0) {
      console.log('✅ No em dashes found in article content');
      return;
    }

    // Update the database
    await client.execute({
      sql: `UPDATE articles 
            SET widget_config = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
      args: [JSON.stringify(widgetConfig), result.rows[0].id]
    });

    console.log(`✅ Successfully removed ${dashesFound} em dashes from article!`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

removeEmDashes();