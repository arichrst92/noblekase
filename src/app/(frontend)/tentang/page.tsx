/**
 * /tentang — Brand story page (block-based dari koleksi Pages, slug "tentang").
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RevealOnScroll } from "@/components/animation/RevealOnScroll";
import { PageBlocks } from "@/components/pages/PageBlocks";
import { getPageBySlug } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("tentang");
  return {
    title: page?.seo?.title ?? page?.title ?? "Tentang Noblekase",
    description:
      page?.seo?.description ??
      "Cerita di balik Noblekase: aksesoris yang menemani hari-hari setiap orang dengan kualitas konsisten dan desain editorial.",
  };
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
