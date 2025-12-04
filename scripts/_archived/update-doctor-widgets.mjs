import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://kiala-app-db-mccmetternich.aws-us-west-2.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjQxMjMxMzksImlkIjoiNWIwN2Q5YTItOTgxMi00NWZkLWIwNDQtNWU4OTI3ZjliZDZlIiwicmlkIjoiOTE0MWIyNmMtZTg5My00NTViLTkzOGUtMWRkMzA0N2Q0NTdjIn0.GUnVauEA3pYhuWMLPvHAZmGsb5E-NDbDm6QH0QWkq1NYYNMNp1I1ZFPtCYWiPUUYTW0CZ16-OZQVyUOO99ulAg'
});

async function updateDoctorWidgets() {
  try {
    // Get current article
    const result = await client.execute({
      sql: `SELECT widget_config FROM articles WHERE id = ?`,
      args: ['k2IxMEsu9zzsw_Hd3BaU4']
    });

    if (!result.rows[0]) {
      console.log('Article not found!');
      return;
    }

    const widgets = JSON.parse(result.rows[0].widget_config);
    console.log('Found', widgets.length, 'widgets');

    // Find and replace the endorsement-section (Professional Assessment)
    const endorsementIndex = widgets.findIndex(w => w.id === 'endorsement-section');
    if (endorsementIndex >= 0) {
      widgets[endorsementIndex] = {
        id: 'endorsement-section',
        type: 'doctor-assessment',
        enabled: true,
        position: widgets[endorsementIndex].position,
        config: {
          doctorName: 'Dr. Amy Heart',
          doctorImage: '/uploads/oYx9upllBN3uNyd6FMlGj/WXPCOJ8PPZxy1Mt8H4AYm.jpg',
          doctorCredentials: 'Board Certified, 15+ Years Experience',
          headline: 'My Professional Assessment',
          paragraphs: [
            "In 15 years of practice, I've never endorsed a specific supplement—until now. The industry's history of overpromising made me fiercely protective of my reputation and your trust.",
            "Kiala Greens earned my recommendation through rigorous evaluation and consistent results from thousands of women dealing with menopause weight gain, hot flashes, mood swings, and digestive issues.",
            "I've watched women who \"tried everything\" finally see results. The bloating resolves. The hot flashes diminish. The weight starts moving. The energy returns."
          ],
          signature: '— Dr. Amy Heart',
          highlightText: "Kiala Greens earned my recommendation through rigorous evaluation and consistent results from thousands of women dealing with menopause weight gain, hot flashes, mood swings, and digestive issues.",
          badgeText: 'Professional Assessment'
        }
      };
      console.log('Updated endorsement-section to doctor-assessment widget at position', endorsementIndex);
    }

    // Find and replace the closing-word (Final Word)
    const closingIndex = widgets.findIndex(w => w.id === 'closing-word');
    if (closingIndex >= 0) {
      widgets[closingIndex] = {
        id: 'closing-word',
        type: 'doctor-closing-word',
        enabled: true,
        position: widgets[closingIndex].position,
        config: {
          doctorName: 'Dr. Amy Heart',
          doctorImage: '/uploads/oYx9upllBN3uNyd6FMlGj/WXPCOJ8PPZxy1Mt8H4AYm.jpg',
          headline: 'A Final Word From Dr. Amy',
          paragraphs: [
            "I know how frustrating this journey can be. You've tried so many things. You've been told it's \"just aging\" or \"just menopause.\" You've wondered if you're doing something wrong.",
            "You're not. Your body is responding to real biological changes—and you deserve a solution that addresses the real cause.",
            "I've seen thousands of women transform their health by healing their gut first. The weight, the hot flashes, the mood swings, the bloating, the exhaustion—they're all connected to the same root cause. Address that, and everything else follows.",
            "Kiala Greens is the only product I've found that does this comprehensively, safely, and effectively. I stake my professional reputation on it.",
            "Give it 90 days. If it doesn't work for you, you get every penny back. But I'm confident you'll feel the difference long before then."
          ],
          closingLine: "Here's to your health,",
          signature: '— Dr. Amy Heart',
          highlightParagraph: 1
        }
      };
      console.log('Updated closing-word to doctor-closing-word widget at position', closingIndex);
    }

    // Save updated widgets
    await client.execute({
      sql: `UPDATE articles SET widget_config = ? WHERE id = ?`,
      args: [JSON.stringify(widgets), 'k2IxMEsu9zzsw_Hd3BaU4']
    });

    console.log('Article updated successfully!');

  } catch (error) {
    console.error('Error updating article:', error);
  }
}

updateDoctorWidgets();
