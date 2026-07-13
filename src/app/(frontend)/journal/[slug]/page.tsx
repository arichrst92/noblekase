/**
 * /journal/[slug] — Halaman artikel.
 * Layout: hero image + body prose + related articles.
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RevealOnScroll } from "@/components/animation/RevealOnScroll";
import { articles, getArticleBySlug } from "@/lib/sample-data";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Artikel tidak ditemukan" };
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.heroUrl ?? article.coverUrl }],
      type: "article",
      publishedTime: article.publishedAt,
    },
  };
}

const dateFormat = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const related = articles
    .filter((a) => a.slug !== article.slug && a.category === article.category)
    .slice(0, 3);

  return (
    <>
      <RevealOnScroll />

      {/* Hero */}
      <article className="pt-28 md:pt-36 pb-16 md:pb-20">
        <div className="container-prose max-w-3xl">
          {/* Breadcrumb */}
          <nav className="text-[12px] text-ink-tertiary mb-6 flex items-center gap-1.5">
            <Link href="/" className="hover:text-ink-primary">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/journal" className="hover:text-ink-primary">
              Journal
            </Link>
            <span>/</span>
            <span className="text-ink-secondary line-clamp-1">
              {article.title}
            </span>
          </nav>

          <div className="reveal mb-6">
            <div className="text-[10px] tracking-widest uppercase text-ink-tertiary mb-3">
              {article.category} · {article.readingTime} mnt baca ·{" "}
              {dateFormat.format(new Date(article.publishedAt))}
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-medium leading-tight mb-5 tracking-tight">
              {article.title}
            </h1>
            <p className="text-lg text-ink-secondary leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          <div className="reveal aspect-[16/9] bg-bg-warm border border-border-light rounded-lg overflow-hidden relative mb-10">
            <Image
              src={article.heroUrl ?? article.coverUrl}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 720px"
              className="object-cover"
            />
          </div>

          {/* Body */}
          <div className="prose-body reveal">
            {article.body.map((block, i) => {
              if (block.type === "p")
                return (
                  <p
                    key={i}
                    className="text-base md:text-lg text-ink-primary leading-relaxed mb-5"
                  >
                    {block.text}
                  </p>
                );
              if (block.type === "h2")
                return (
                  <h2
                    key={i}
                    className="font-serif text-xl md:text-2xl font-medium mt-10 mb-4"
                  >
                    {block.text}
                  </h2>
                );
              if (block.type === "quote")
                return (
                  <blockquote
                    key={i}
                    className="border-l-2 border-ink-primary pl-5 py-2 my-7 font-serif italic text-lg md:text-xl text-ink-primary"
                  >
                    {block.text}
                  </blockquote>
                );
              if (block.type === "img" && block.src)
                return (
                  <figure
                    key={i}
                    className="my-8 aspect-[16/9] bg-bg-warm border border-border-light rounded-md overflow-hidden relative"
                  >
                    <Image
                      src={block.src}
                      alt=""
                      fill
                      sizes="720px"
                      className="object-cover"
                    />
                  </figure>
                );
              return null;
            })}
          </div>

          {/* Share */}
          <div className="mt-12 pt-6 border-t border-border-light flex items-center justify-between">
            <Link
              href="/journal"
              className="text-sm text-ink-secondary hover:text-ink-primary"
            >
              ← Kembali ke Journal
            </Link>
            <span className="text-[11px] uppercase tracking-widest text-ink-tertiary">
              Bagikan: WA · Tw · IG
            </span>
          </div>
        </div>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-bg-cream py-16 md:py-20 border-t border-border-light">
          <div className="container-prose">
            <div className="reveal eyebrow mb-2">Artikel terkait</div>
            <h2 className="reveal font-serif text-2xl md:text-3xl font-medium mb-8">
              Cerita lain dari {article.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {related.map((a, i) => (
                <Link
                  key={a.slug}
                  href={`/journal/${a.slug}`}
                  className="reveal group"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="aspect-[4/3] bg-bg-warm border border-border-light rounded-md overflow-hidden mb-3 hover-zoom relative">
                    <Image
                      src={a.coverUrl}
                      alt={a.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="text-[10px] tracking-widest uppercase text-ink-tertiary mb-2">
                    {a.category} · {a.readingTime} mnt
                  </div>
                  <h3 className="font-serif text-base md:text-lg font-medium leading-snug group-hover:text-accent transition-colors">
                    {a.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
