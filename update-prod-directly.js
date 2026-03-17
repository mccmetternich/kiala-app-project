// Update production database directly via API
const updateData = {
  type: 'comparison-table',
  props: {
    title: "Kiala Gummies vs. Seed vs. Ritual: Side-by-Side Comparison",
    subtitle: "See how Kiala Gummies delivers more comprehensive gut health support",
    leftColumnHeader: "Seed DS-01",
    rightColumnHeader: "Kiala Gummies",
    rows: [
      {
        feature: "Serving Format",
        standard: "2 Capsules",
        premium: "2 Tasty Gummies"
      },
      {
        feature: "Price per Serving",
        standard: "$1.67",
        premium: "$1.33"
      },
      {
        feature: "Probiotic Count",
        standard: "53.6B CFU (24 strains)",
        premium: "Clinically-studied strains"
      },
      {
        feature: "Contains Greens",
        standard: false,
        premium: "11 Organic Superfoods"
      },
      {
        feature: "Prebiotics",
        standard: true,
        premium: true
      },
      {
        feature: "Antioxidant Support",
        standard: false,
        premium: "Elderberry, Cranberry, Turmeric"
      },
      {
        feature: "Taste Experience",
        standard: "Capsule (no taste)",
        premium: "Delicious natural flavor"
      },
      {
        feature: "Additional Nutrients",
        standard: false,
        premium: "Multivitamin support"
      },
      {
        feature: "Bloating Relief",
        standard: "Clinical studies",
        premium: "84% report less bloating"
      },
      {
        feature: "Made in USA",
        standard: true,
        premium: true
      }
    ],
    showCta: true,
    ctaText: "Try Kiala Gummies Risk-Free →",
    ctaUrl: "https://kialanutrition.com/products/super-greens-gummies",
    ctaSubtext: "45-day money-back guarantee"
  }
};

console.log('Comparison table data to update:');
console.log(JSON.stringify(updateData, null, 2));
console.log('\nThis data should be added to widget #5 in the production article.');
console.log('\nYou need to:');
console.log('1. Go to the admin dashboard');
console.log('2. Find the Kiala Gummies vs Seed article');  
console.log('3. Edit the comparison table widget');
console.log('4. Replace the data with the above configuration');
console.log('\nOR:');
console.log('- Update the production Vercel environment variables to point to the database I\'ve been updating');