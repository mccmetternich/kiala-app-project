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

async function checkWidgetStatus() {
  try {
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    const result = await client.execute({
      sql: 'SELECT title, widget_config FROM articles WHERE slug = ?',
      args: ['kiala-gummies-vs-seed-ritual-probiotics-comparison']
    });

    if (result.rows.length === 0) {
      console.log('Article not found');
      return;
    }

    const widgets = JSON.parse(result.rows[0].widget_config);
    
    console.log('📄 Article:', result.rows[0].title);
    console.log('\n🔧 Widget Status:');
    
    widgets.forEach((widget, i) => {
      const status = widget.enabled ? '✅ ENABLED' : '❌ DISABLED';
      console.log('   ', i+1, ':', widget.type, '(', widget.id, ')', '-', status);
      
      if (widget.type === 'text-block' && widget.config.content) {
        const preview = widget.config.content.replace(/<[^>]*>/g, '').substring(0, 60) + '...';
        console.log('        Preview:', preview);
      }
    });
    
    const enabledCount = widgets.filter(w => w.enabled).length;
    const disabledCount = widgets.filter(w => !w.enabled).length;
    
    console.log('\n📊 Summary:');
    console.log('   Total widgets:', widgets.length);
    console.log('   Enabled:', enabledCount);
    console.log('   Disabled:', disabledCount);
    
    if (disabledCount > 0) {
      console.log('\n💡 You may want to enable some disabled widgets to show more content.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkWidgetStatus();