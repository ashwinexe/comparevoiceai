import { Link } from "wouter";
import { useId } from "react";
import type { SiteLink } from "@shared/site-core";

interface GuideLinksProps {
  links: readonly SiteLink[];
  title?: string;
}

export default function GuideLinks({ links, title = "Related guides and comparisons" }: GuideLinksProps) {
  const headingId = useId();
  if (links.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className="border-4 border-black bg-white p-5 md:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0)] mb-8">
      <h2 id={headingId} className="font-mono text-2xl font-bold uppercase mb-4">{title}</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {links.map((link) => (
          <article key={link.href} className="border-2 border-black p-4 bg-gray-50">
            <h3 className="font-bold mb-2">
              <Link href={link.href} className="underline text-[#5E17EB]">{link.title}</Link>
            </h3>
            <p className="text-sm text-gray-700">{link.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
