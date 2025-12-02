import { createClient } from "@libsql/client";
import dotenv from "dotenv";
dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

const articleId = "k2IxMEsu9zzsw_Hd3BaU4";

// Get current widget_config
const result = await client.execute({
  sql: "SELECT widget_config FROM articles WHERE id = ?",
  args: [articleId]
});

if (result.rows.length === 0) {
  console.log("Article not found");
  process.exit(1);
}

const widgetConfig = JSON.parse(result.rows[0].widget_config);

// Find the menopause-focus widget
const menopauseFocusWidget = widgetConfig.find(w => w.id === 'menopause-focus');
if (!menopauseFocusWidget) {
  console.log("Widget not found");
  process.exit(1);
}

// New content with arrow format (condensed and using arrows like the validation-section)
const newContent = `<div class="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
<h3 class="font-bold text-purple-900 text-xl mb-4">The Menopause Triple Threat—And Why Most Solutions Fail</h3>
<p class="text-gray-700 mb-4">During menopause, three biological shifts happen simultaneously:</p>
<div class="space-y-3 mb-4">
<div class="flex items-start gap-3 bg-white rounded-lg p-3">
<span class="text-purple-600 font-bold text-xl flex-shrink-0">→</span>
<div><strong class="text-gray-900">Estrogen drops = Fat redistributes to your midsection.</strong> <span class="text-gray-600 text-sm">Diet and exercise alone can't override this biology.</span></div>
</div>
<div class="flex items-start gap-3 bg-white rounded-lg p-3">
<span class="text-purple-600 font-bold text-xl flex-shrink-0">→</span>
<div><strong class="text-gray-900">Gut bacteria diversity crashes = Chronic inflammation begins.</strong> <span class="text-gray-600 text-sm">More toxins, more bloating, systemic inflammation.</span></div>
</div>
<div class="flex items-start gap-3 bg-white rounded-lg p-3">
<span class="text-purple-600 font-bold text-xl flex-shrink-0">→</span>
<div><strong class="text-gray-900">The estrobolome weakens = Hormone metabolism breaks down.</strong> <span class="text-gray-600 text-sm">Hot flashes, mood swings, and weight gain spiral.</span></div>
</div>
</div>
<p class="text-gray-700 font-medium"><strong>Here's what most doctors miss:</strong> These three problems FEED each other.</p>
<p class="text-purple-800 font-bold mt-3">To break the cycle, you must address the gut FIRST.</p>
</div>`;

menopauseFocusWidget.config.content = newContent;

// Update the database
await client.execute({
  sql: "UPDATE articles SET widget_config = ? WHERE id = ?",
  args: [JSON.stringify(widgetConfig), articleId]
});

console.log("Updated menopause-focus widget content to arrow format");
