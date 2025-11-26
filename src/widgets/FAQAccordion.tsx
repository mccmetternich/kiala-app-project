'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  headline?: string;
  subheading?: string;
  faqs?: FAQItem[];
}

const defaultFAQs: FAQItem[] = [
  {
    question: 'How quickly will I see results?',
    answer: "Most women start noticing changes within the first 1-2 weeks - better sleep, more energy, and reduced cravings are usually the first signs. Significant hormone balance and weight loss typically become visible around weeks 4-8. Full transformation results are achieved by week 12, though many women report continuing to see improvements for months after."
  },
  {
    question: "Is this program safe for women over 50?",
    answer: "Absolutely! This program was specifically designed for women over 40 and 50. All recommendations are based on peer-reviewed research and have been vetted by medical professionals. The protocol uses natural approaches that work with your body's biology. However, we always recommend consulting with your healthcare provider before starting any new health program."
  },
  {
    question: 'What if it doesn\'t work for me?',
    answer: "We offer a 90-day money-back guarantee, no questions asked. If you follow the protocol and don't see results, simply reach out to our support team for a full refund. We've helped over 47,000 women achieve their health goals, and we're confident this will work for you too - but we want you to feel completely risk-free when you join."
  },
  {
    question: "Do I need to buy special supplements?",
    answer: "No special supplements are required to follow the core protocol. The program focuses primarily on diet, lifestyle, and timing strategies that optimize your natural hormone production. We do recommend certain supplements that can accelerate results, but these are completely optional and available at any health food store."
  },
  {
    question: 'How much time does this program require?',
    answer: "The daily time investment is minimal - about 15-30 minutes for meal prep and 10-15 minutes for the recommended movement routines. The video lessons can be watched at your own pace (most are under 10 minutes). Most members find the program easily fits into their existing schedule without major disruption."
  },
  {
    question: 'Will I have support throughout the program?',
    answer: "Yes! You'll have access to our private community of supportive women on the same journey. Complete Kit members also get access to weekly live Q&A sessions where you can ask questions directly. Plus, our support team is always available via email to help with any issues."
  }
];

export default function FAQAccordion({
  headline = 'Frequently Asked Questions',
  subheading = 'Everything you need to know before getting started',
  faqs = defaultFAQs
}: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="my-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <HelpCircle className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{headline}</h2>
        </div>
        <p className="text-gray-600">{subheading}</p>
      </div>

      {/* FAQ List */}
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`bg-white rounded-xl border-2 overflow-hidden transition-all duration-200 ${
              openIndex === index
                ? 'border-primary-300 shadow-md'
                : 'border-gray-100 hover:border-gray-200'
            }`}
          >
            {/* Question */}
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full p-5 text-left flex items-center justify-between gap-4"
            >
              <span className="font-semibold text-gray-900 text-lg">{faq.question}</span>
              <ChevronDown
                className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Answer */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === index ? 'max-h-96' : 'max-h-0'
              }`}
            >
              <div className="px-5 pb-5 pt-0">
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
