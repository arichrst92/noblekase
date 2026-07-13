/**
 * RichText — render Lexical richText JSON (Payload) → React.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Mendukung: paragraph, heading, quote, list/listitem, link, upload (gambar),
 * text formatting (bold/italic/underline/strikethrough), linebreak.
 */

import Link from "next/link";
import Image from "next/image";
import { Fragment } from "react";
import { resolveMediaUrl } from "@/lib/queries";

/* eslint-disable @typescript-eslint/no-explicit-any */

function renderText(node: any, key: number) {
  const format = node.format ?? 0;
  let el: React.ReactNode = node.text;
  if (format & 1) el = <strong>{el}</strong>;
  if (format & 2) el = <em>{el}</em>;
  if (format & 8) el = <u>{el}</u>;
  if (format & 4) el = <s>{el}</s>;
  return <Fragment key={key}>{el}</Fragment>;
}

function renderChildren(children: any[] = []): React.ReactNode {
  return children.map((child, i) => renderNode(child, i));
}

function renderNode(node: any, key: number): React.ReactNode {
  switch (node?.type) {
    case "text":
      return renderText(node, key);
    case "linebreak":
      return <br key={key} />;
    case "paragraph":
      return (
        <p key={key} className="text-base md:text-lg text-ink-primary leading-relaxed mb-5">
          {renderChildren(node.children)}
        </p>
      );
    case "heading": {
      const Tag = (node.tag ?? "h2") as any;
      return (
        <Tag key={key} className="font-serif text-xl md:text-2xl font-medium mt-10 mb-4">
          {renderChildren(node.children)}
        </Tag>
      );
    }
    case "quote":
      return (
        <blockquote
          key={key}
          className="border-l-2 border-ink-primary pl-5 py-2 my-7 font-serif italic text-lg md:text-xl text-ink-primary"
        >
          {renderChildren(node.children)}
        </blockquote>
      );
    case "list": {
      const ordered = node.tag === "ol" || node.listType === "number";
      const Tag = (ordered ? "ol" : "ul") as any;
      return (
        <Tag
          key={key}
          className={`mb-5 pl-6 space-y-1.5 text-base md:text-lg text-ink-primary ${
            ordered ? "list-decimal" : "list-disc"
          }`}
        >
          {renderChildren(node.children)}
        </Tag>
      );
    }
    case "listitem":
      return (
        <li key={key} className="leading-relaxed">
          {renderChildren(node.children)}
        </li>
      );
    case "link": {
      const url = node.fields?.url ?? node.url ?? "#";
      const newTab = node.fields?.newTab;
      return (
        <Link
          key={key}
          href={url}
          className="text-accent underline underline-offset-2 hover:text-ink-primary"
          {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {renderChildren(node.children)}
        </Link>
      );
    }
    case "upload": {
      const url = resolveMediaUrl(node.value, "wide");
      if (!url) return null;
      const alt = node.value && typeof node.value === "object" ? node.value.alt ?? "" : "";
      return (
        <figure
          key={key}
          className="my-8 aspect-[16/9] bg-bg-warm border border-border-light rounded-md overflow-hidden relative"
        >
          <Image src={url} alt={alt} fill sizes="720px" className="object-cover" />
        </figure>
      );
    }
    default:
      return node?.children ? <Fragment key={key}>{renderChildren(node.children)}</Fragment> : null;
  }
}

export function RichText({ data, className }: { data: any; className?: string }) {
  const root = data?.root;
  if (!root?.children) return null;
  return <div className={className}>{renderChildren(root.children)}</div>;
}
