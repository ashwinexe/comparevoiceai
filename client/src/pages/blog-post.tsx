import { Link, useRoute } from "wouter";
import { Children, isValidElement, type ComponentPropsWithoutRef, type HTMLAttributes, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { CalendarDays } from "lucide-react";
import BreadcrumbNav from "@/components/seo/BreadcrumbNav";
import GuideLinks from "@/components/seo/GuideLinks";
import JsonLd from "@/components/seo/JsonLd";
import SEOHead from "@/components/seo/SEOHead";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@shared/blog-types";
import {
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_OG_IMAGE_URL,
  pricingLinksForTags,
  publisherOrganization,
  type SiteLink,
} from "@shared/site-core";
import generatedPosts from "@/generated/blog-posts.json";

const posts = generatedPosts as BlogPost[];

function headingText(node: ReactNode): string {
  return Children.toArray(node).map((child) => {
    if (typeof child === "string" || typeof child === "number") return String(child);
    if (isValidElement<{ children?: ReactNode }>(child)) return headingText(child.props.children);
    return "";
  }).join("");
}

function headingId(node: ReactNode): string {
  return headingText(node)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "section";
}

function MarkdownHeading({ level, children, ...props }: HTMLAttributes<HTMLHeadingElement> & { level: 2 | 3 | 4 | 5 | 6 }) {
  const Heading = `h${level}` as const;
  return <Heading id={headingId(children)} {...props}>{children}</Heading>;
}

const markdownComponents = {
  h1: (props: HTMLAttributes<HTMLHeadingElement>) => <MarkdownHeading level={2} {...props} />,
  h2: (props: HTMLAttributes<HTMLHeadingElement>) => <MarkdownHeading level={2} {...props} />,
  h3: (props: HTMLAttributes<HTMLHeadingElement>) => <MarkdownHeading level={3} {...props} />,
  h4: (props: HTMLAttributes<HTMLHeadingElement>) => <MarkdownHeading level={4} {...props} />,
  h5: (props: HTMLAttributes<HTMLHeadingElement>) => <MarkdownHeading level={5} {...props} />,
  h6: (props: HTMLAttributes<HTMLHeadingElement>) => <MarkdownHeading level={6} {...props} />,
  img: ({ node: _node, ...props }: ComponentPropsWithoutRef<"img"> & { node?: unknown }) => <img {...props} loading="lazy" decoding="async" />,
};

export default function BlogPostPage() {
  const [, params] = useRoute("/blog/:slug");
  const post = posts.find((candidate) => candidate.slug === params?.slug);

  if (!post) {
    return (
      <main className="min-h-screen bg-[#f7f7f7] p-6">
        <SEOHead title="Article Not Found | CompareVoiceAI" description="The requested article could not be found." robots="noindex, follow" />
        <div className="max-w-2xl mx-auto border-4 border-black bg-white p-8 mt-16">
          <h1 className="text-4xl font-bold mb-4">Article not found</h1>
          <p className="mb-6">The link may be outdated or the article may have moved.</p>
          <Link href="/blog/" className="underline font-bold">Return to the blog</Link>
        </div>
      </main>
    );
  }

  const canonicalUrl = `https://comparevoiceai.com/blog/${post.slug}/`;
  const articleImage = post.coverImage ? `https://comparevoiceai.com${post.coverImage}` : DEFAULT_OG_IMAGE_URL;
  const comparisonLinks = pricingLinksForTags(post.tags);
  const relatedPosts: SiteLink[] = posts
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => ({
      candidate,
      sharedTags: candidate.tags.filter((tag) => post.tags.includes(tag)).length,
    }))
    .filter(({ sharedTags }) => sharedTags > 0)
    .sort((a, b) => b.sharedTags - a.sharedTags || Date.parse(b.candidate.updated) - Date.parse(a.candidate.updated) || a.candidate.title.localeCompare(b.candidate.title))
    .slice(0, 3)
    .map(({ candidate }) => ({
      title: candidate.title,
      description: candidate.description,
      href: `/blog/${candidate.slug}/`,
    }));
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url: canonicalUrl,
    datePublished: post.date,
    dateModified: post.updated,
    mainEntityOfPage: canonicalUrl,
    keywords: post.tags,
    author: {
      "@type": "Person",
      name: post.author.name,
      url: "https://rnikhil.com",
    },
    publisher: publisherOrganization,
    image: articleImage,
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] font-sans">
      <SEOHead
        title={post.title}
        description={post.description}
        canonicalUrl={canonicalUrl}
        ogType="article"
        ogImage={post.coverImage ?? DEFAULT_OG_IMAGE_PATH}
        publishedTime={post.date}
        modifiedTime={post.updated}
      />
      <JsonLd data={articleSchema} id="article" />

      <main className="container mx-auto px-4 py-10">
        <BreadcrumbNav currentLabel={post.title} />
        <div className="flex flex-wrap gap-3 mb-6">
          <Link href="/blog/" className="px-4 py-2 bg-white font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0)]">← All articles</Link>
          <Link href="/" className="px-4 py-2 bg-[#5E17EB] text-white font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0)]">Pricing calculator</Link>
        </div>

        <article className="max-w-4xl mx-auto">
          <Card className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0)]">
            <CardHeader className="p-6 md:p-10 border-b-4 border-black">
              <h1 className="text-4xl md:text-5xl font-bold font-serif leading-tight mb-5">{post.title}</h1>
              <p className="flex flex-wrap items-center gap-2 text-gray-700"><CalendarDays className="h-4 w-4" /> Published {formatDate(new Date(`${post.date}T00:00:00Z`))} · Updated {formatDate(new Date(`${post.updated}T00:00:00Z`))} · {post.author.name}</p>
            </CardHeader>
            <CardContent className="p-6 md:p-10">
              <aside className="border-2 border-black bg-yellow-50 p-4 mb-8 font-mono text-sm">
                This article was published in 2025 and updated {formatDate(new Date(`${post.updated}T00:00:00Z`))}. Provider catalogs and prices change frequently. For purchase decisions, use the comparison tables and confirm the linked provider source.
              </aside>
              <div className="prose prose-lg max-w-none blog-content">
                <ReactMarkdown components={markdownComponents} rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </article>
        <div className="max-w-4xl mx-auto mt-8">
          <GuideLinks links={comparisonLinks} title="Current pricing comparisons" />
          <GuideLinks links={relatedPosts} title="Related voice AI guides" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
