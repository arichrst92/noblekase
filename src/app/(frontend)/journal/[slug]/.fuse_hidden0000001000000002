/**
 * /journal/[slug] — Halaman artikel.
 * Layout: hero image + body prose + related articles.
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RevealOnScroll } from "@/components/animation/RevealOnScroll";
import { RichText } from "@/components/richtext/RichText";
import {
  getArticles,
  getArticleBySlug,
  getRelatedArticles,
  getGlobalData,
} from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const articles = await getArticles();
    return articles.map((a) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Artikel tidak ditemukan" };
  return buildMetadata({
    title: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.excerpt,
    path: `/journal/${slug}`,
    image: article.ogUrl,
    type: "article",
    publishedTime: article.publishedAt || undefined,
  });
}

const dateFormat = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const [article, t] = await Promise.all([
    getArticleBySlug(slug),
    getGlobalData("page-article-detail"),
  ]);
  if (!article) notFound();

  const related = await getRelatedArticles(article);
  const relatedHeadline = (t?.relatedHeadlineTemplate ?? "Cerita lain dari {category}").replace(
    "{category}",
    article.category,
  );

  return (
    <>
      <RevealOnScroll />

      {/* Hero */}
      <article className="pt-28 md:pt-36 pb-16 md:pb-20">
        <div className="container-prose max-w-3xl">
          {/* Breadcrumb */}
          <nav className="text-[12px] text-ink-tertiary mb-6 flex items-center gap-1.5">
            <Link href="/" className="hover:text-ink-primary">
              {t?.breadcrumbHome ?? "Beranda"}
            </Link>
            <span>/</span>
            <Link href="/journal" className="hover:text-ink-primary">
              {t?.breadcrumbJournal ?? "Journal"}
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
          <RichText data={article.body} className="prose-body reveal" />

          {/* Share */}
          <div className="mt-12 pt-6 border-t border-border-light flex items-center justify-between">
            <Link
              href="/journal"
              className="text-sm text-ink-secondary hover:text-ink-primary"
            >
              {t?.backLabel ?? "← Kembali ke Journal"}
            </Link>
            <span className="text-[11px] uppercase tracking-widest text-ink-tertiary">
              {t?.shareLabel ?? "Bagikan:"} WA · Tw · IG
            </span>
          </div>
        </div>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-bg-cream py-16 md:py-20 border-t border-border-light">
          <div className="container-prose">
            <div className="reveal eyebrow mb-2">{t?.relatedEyebrow ?? "Artikel terkait"}</div>
            <h2 className="reveal font-serif text-2xl md:text-3xl font-medium mb-8">
              {relatedHeadline}
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
