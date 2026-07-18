/**
 * /tentang — Brand story page (block-based dari koleksi Pages, slug "tentang").
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RevealOnScroll } from "@/components/animation/RevealOnScroll";
import { PageBlocks } from "@/components/pages/PageBlocks";
import { getPageBySlug, resolveMediaUrl } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("tentang");
  // Fallback gambar: SEO override → gambar hero block pertama → default situs
  const heroBlock = (page?.blocks ?? []).find((b: { blockType?: string }) => b.blockType === "hero");
  return buildMetadata({
    title: page?.seo?.title ?? page?.title ?? "Tentang Noblekase",
    description:
      page?.seo?.description ??
      "Cerita di balik Noblekase: aksesoris yang menemani hari-hari setiap orang dengan kualitas konsisten dan desain editorial.",
    path: "/tentang",
    image:
      resolveMediaUrl(page?.seo?.ogImage, "og") ||
      resolveMediaUrl(heroBlock?.image, "og") ||
      undefined,
  });
}

export default async function TentangPage() {
  const page = await getPageBySlug("tentang");
  if (!page) notFound();

  return (
    <>
      <RevealOnScroll />
      <PageBlocks blocks={page.blocks ?? []} />
    </>
  );
}
