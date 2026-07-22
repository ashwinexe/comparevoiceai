import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calculator, TrendingUp, FileText } from "lucide-react";

interface RelatedItem {
  title: string;
  description: string;
  href: string;
  category: string;
  icon?: React.ReactNode;
}

interface RelatedContentProps {
  items: RelatedItem[];
  title?: string;
  className?: string;
}

export default function RelatedContent({ 
  items, 
  title = "RELATED TOOLS & RESOURCES",
  className = ""
}: RelatedContentProps) {
  return (
    <section className={`bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-1 ${className}`}>
      <h2 className="font-mono text-2xl font-bold text-center mb-6 uppercase tracking-tight border-b-4 border-black pb-4">
        {title}
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <div key={index} className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
            <div className="flex items-center space-x-3 mb-3">
              {item.icon && (
                <div className="p-2 bg-white border-2 border-black">
                  {item.icon}
                </div>
              )}
              <div>
                <div className="font-mono text-xs font-bold uppercase tracking-tight mb-1">
                  {item.category}
                </div>
                <h3 className="font-mono font-bold text-sm uppercase tracking-tight">{item.title}</h3>
              </div>
            </div>
            <p className="font-mono text-xs mb-4 leading-relaxed">
              {item.description}
            </p>
            <Link href={item.href} className="inline-flex items-center font-mono text-xs font-bold uppercase tracking-tight hover:bg-gray-100 p-2 border-2 border-black transition-all duration-200">
              Explore {item.title}
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

// Predefined related content for voice AI calculator
export const voiceAIRelatedContent: RelatedItem[] = [
  {
    title: "AI Cost Optimization Guide",
    description: "Learn best practices for reducing voice AI costs while maintaining quality and performance.",
    href: "/blog/cost-optimisation-voice-agent/",
    category: "Guide",
    icon: <TrendingUp className="w-5 h-5 text-blue-600" />
  },
  {
    title: "Voice AI Provider Directory",
    description: "Browse source-linked LLM, speech-to-text, and text-to-speech catalog coverage by provider.",
    href: "/providers/",
    category: "Directory",
    icon: <Calculator className="w-5 h-5 text-blue-600" />
  },
  {
    title: "Implementation Best Practices",
    description: "Technical guide for implementing cost-effective voice AI solutions in production.",
    href: "/blog/technical-guide-implementing-voice-ai-agent/",
    category: "Tutorial",
    icon: <FileText className="w-5 h-5 text-blue-600" />
  },
  {
    title: "Latency Optimization",
    description: "Strategies to minimize latency in real-time voice AI applications.",
    href: "/blog/latency-optimisation-voice-agent/",
    category: "Performance",
    icon: <TrendingUp className="w-5 h-5 text-blue-600" />
  },
  {
    title: "Voice AI ROI Modeling Guide",
    description: "Build a workload-specific ROI case using explicit labor, adoption, containment, and operating-cost assumptions.",
    href: "/blog/voice-ai-roi-calculator/",
    category: "Blog",
    icon: <Calculator className="w-5 h-5 text-blue-600" />
  },
  {
    title: "API Integration Examples",
    description: "Code samples and integration examples for popular voice AI providers.",
    href: "/blog/voice-ai-api-integration-tutorial-examples/",
    category: "Code",
    icon: <FileText className="w-5 h-5 text-blue-600" />
  }
];
