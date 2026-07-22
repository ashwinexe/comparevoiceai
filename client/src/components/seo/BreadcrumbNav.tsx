import { Link, useLocation } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { routeLabelsBySegment } from "@shared/site-core";
import JsonLd from "./JsonLd";

interface BreadcrumbItem {
  label: string;
  href: string;
}

export default function BreadcrumbNav({ currentLabel }: { currentLabel?: string }) {
  const [location] = useLocation();
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.split(/[?#]/)[0].split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: "Home", href: "/" }
    ];

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Convert path segments to readable labels
      const label = routeLabelsBySegment[segment]
        ?? segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
      
      breadcrumbs.push({
        label: index === pathSegments.length - 1 && currentLabel ? currentLabel : label,
        href: `${currentPath}/`
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on home page
  if (location === '/') return null;

  // Generate structured data for breadcrumbs
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": item.href === "/" ? "https://comparevoiceai.com/" : `https://comparevoiceai.com${item.href.replace(/\/$/, "")}/`
    }))
  };

  return (
    <>
    <JsonLd id="breadcrumbs" data={structuredData} />
    <nav aria-label="Breadcrumb" className="py-4">
      <ol className="flex items-center space-x-2 text-sm text-gray-600">
        {breadcrumbs.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            )}
            {index === 0 && (
              <Home className="w-4 h-4 mr-2 text-gray-500" />
            )}
            {index === breadcrumbs.length - 1 ? (
              <span className="font-medium text-gray-900" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className="hover:text-blue-600 transition-colors">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
    </>
  );
}
