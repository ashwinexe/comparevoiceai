import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqPageSchema, type FAQItem } from "@shared/site-core";
import JsonLd from "./JsonLd";

interface FAQSectionProps {
  faqs: readonly FAQItem[];
  title?: string;
  className?: string;
}

export default function FAQSection({ 
  faqs, 
  title = "Frequently Asked Questions",
  className = ""
}: FAQSectionProps) {
  
  return (
    <>
      <JsonLd id="faq" data={faqPageSchema(faqs)} />
      <section className={`py-12 ${className}`}>
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
            {title}
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.question} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}
