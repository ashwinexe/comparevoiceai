import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import BreadcrumbNav from "@/components/seo/BreadcrumbNav";
import JsonLd from "@/components/seo/JsonLd";
import SEOHead from "@/components/seo/SEOHead";
import Footer from "@/components/Footer";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@shared/blog-types";
import { DEFAULT_OG_IMAGE_URL, publisherOrganization, siteCoreContent } from "@shared/site-core";
import generatedPosts from "@/generated/blog-posts.json";

const posts = generatedPosts as BlogPost[];

export default function BlogIndex() {
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: siteCoreContent.blog.h1,
    description: siteCoreContent.blog.description,
    url: `https://comparevoiceai.com${siteCoreContent.blog.path}`,
    publisher: publisherOrganization,
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      url: `https://comparevoiceai.com/blog/${post.slug}/`,
      datePublished: post.date,
      dateModified: post.updated,
      author: { "@type": "Person", name: post.author.name },
      publisher: publisherOrganization,
      image: post.coverImage ? `https://comparevoiceai.com${post.coverImage}` : DEFAULT_OG_IMAGE_URL,
    })),
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] font-sans bg-[radial-gradient(#5E17EB_1px,transparent_1px),radial-gradient(#5E17EB_1px,transparent_1px)] bg-[length:40px_40px] bg-[0_0,20px_20px] bg-fixed">
      <SEOHead
        title={siteCoreContent.blog.title}
        description={siteCoreContent.blog.description}
        canonicalUrl={`https://comparevoiceai.com${siteCoreContent.blog.path}`}
      />
      <JsonLd data={blogSchema} id="blog" />

      <main className="container mx-auto px-4 py-10">
        <BreadcrumbNav currentLabel={siteCoreContent.blog.breadcrumbLabel} />
        <header className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0)] mb-10">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-3">{siteCoreContent.blog.h1}</h1>
          <p className="text-lg text-gray-700 max-w-3xl">
            Technical notes on building, pricing, and operating voice agents. Historical benchmarks are labeled; use the current comparison pages for rates verified on July 22, 2026.
          </p>
          <Link href="/" className="inline-block mt-5 px-5 py-3 bg-[#5E17EB] text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0)]">
            Open the pricing calculator
          </Link>
        </header>

        <section aria-labelledby="posts-heading">
          <h2 id="posts-heading" className="sr-only">All articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article key={post.slug}>
                <Link href={`/blog/${post.slug}/`} className="block h-full">
                  <Card className="h-full border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] hover:translate-x-1 hover:translate-y-1 transition-all">
                    {post.coverImage && (
                      <img src={post.coverImage} alt="" className="h-48 w-full object-cover border-b-4 border-black" loading="lazy" decoding="async" />
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl font-serif leading-tight">{post.title}</CardTitle>
                      <CardDescription>Published {formatDate(new Date(`${post.date}T00:00:00Z`))} · Updated {formatDate(new Date(`${post.updated}T00:00:00Z`))} · {post.author.name}</CardDescription>
                    </CardHeader>
                    <CardContent><p className="text-gray-700">{post.description}</p></CardContent>
                    <CardFooter><span className="text-[#5E17EB] font-bold">Read article →</span></CardFooter>
                  </Card>
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
